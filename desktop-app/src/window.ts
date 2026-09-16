import {
  BrowserWindow,
  screen,
  ipcMain,
  Menu,
} from "electron";
import path from "node:path";
import type { EntranceKind } from "./shared";
import { localSettings } from "./store";

/**
 * The transparent overlay window Virtual Me lives in. Frameless, always-on-top,
 * never shown in the taskbar and never steals focus, sized tightly around the
 * character so transparent margins stay small. Transparent areas are
 * click-through; the character itself is draggable and interactive.
 */

export const WINDOW_WIDTH = 180;
export const WINDOW_HEIGHT = 210;
const EDGE_MARGIN = 8;
const TICK_MS = 16;

let win: BrowserWindow | null = null;
let isAnimating = false;

/* ── Edges ───────────────────────────────────────────────────────────── */

interface Placement {
  origin: { x: number; y: number };
  rest: { x: number; y: number };
  travel: number;
  peek: boolean;
}

function workArea() {
  return screen.getPrimaryDisplay().workArea;
}

/**
 * Map an entrance kind onto a resting spot and an off-screen origin on the
 * primary display. `xHint` anchors top/bottom entrances horizontally.
 */
function placementFor(kind: EntranceKind, xHint: number | null): Placement {
  const wa = workArea();
  const W = WINDOW_WIDTH;
  const H = WINDOW_HEIGHT;
  const over = W + EDGE_MARGIN * 2;
  const bottom = wa.y + wa.height - H - EDGE_MARGIN;

  switch (kind) {
    case "slide-right":
    case "peek-right":
      return {
        origin: { x: wa.x + wa.width + over, y: bottom },
        rest: { x: wa.x + wa.width - W - EDGE_MARGIN, y: bottom },
        travel: over + EDGE_MARGIN,
        peek: kind === "peek-right",
      };
    case "slide-left":
    case "peek-left":
      return {
        origin: { x: wa.x - over - W, y: bottom },
        rest: { x: wa.x + EDGE_MARGIN, y: bottom },
        travel: over + EDGE_MARGIN,
        peek: kind === "peek-left",
      };
    case "drop-top":
      return {
        origin: { x: xHint ?? wa.x + wa.width / 2 - W / 2, y: wa.y - H - over },
        rest: { x: xHint ?? wa.x + wa.width / 2 - W / 2, y: wa.y + EDGE_MARGIN },
        travel: over + EDGE_MARGIN,
        peek: false,
      };
    case "pop-bottom":
    default:
      return {
        origin: { x: xHint ?? wa.x + wa.width / 2 - W / 2, y: wa.y + wa.height + over },
        rest: { x: xHint ?? wa.x + wa.width / 2 - W / 2, y: bottom },
        travel: over + EDGE_MARGIN,
        peek: false,
      };
  }
}

/* ── Animation ───────────────────────────────────────────────────────── */

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function animateTo(target: { x: number; y: number }, ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const w = win;
    if (!w || w.isDestroyed()) return resolve();
    const start = w.getBounds();
    isAnimating = true;
    const total = Math.max(1, Math.round(ms / TICK_MS));
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const t = Math.min(1, step / total);
      const e = easeOut(t);
      w.setPosition(
        Math.round(start.x + (target.x - start.x) * e),
        Math.round(start.y + (target.y - start.y) * e)
      );
      if (t >= 1) {
        clearInterval(timer);
        isAnimating = false;
        resolve();
      }
    }, TICK_MS);
  });
}

/* ── Position persistence ────────────────────────────────────────────── */

function persistPosition() {
  if (isAnimating || !win || win.isDestroyed()) return;
  const b = win.getBounds();
  localSettings.update({ position: { x: b.x, y: b.y } });
}

function defaultRest(): { x: number; y: number } {
  const wa = workArea();
  return {
    x: wa.x + wa.width - WINDOW_WIDTH - EDGE_MARGIN,
    y: wa.y + wa.height - WINDOW_HEIGHT - EDGE_MARGIN,
  };
}

/* ── Context-menu actions (wire up once after window creation) ──────── */

export interface MenuActions {
  onToggleNotifications: () => void;
}

let actions: MenuActions = {
  onToggleNotifications: () => undefined,
};

export function configureMenuActions(next: MenuActions) {
  actions = next;
}

function showContextMenu() {
  const w = win;
  if (!w || w.isDestroyed()) return;
  const enabled = localSettings.get();
  const menu = Menu.buildFromTemplate([
    {
      label: "OS notifications",
      type: "checkbox",
      checked: enabled.notifications,
      click: actions.onToggleNotifications,
    },
    { type: "separator" },
    { label: "Hide", click: () => hide() },
  ]);
  void menu.popup({ window: w });
}

/* ── Lifecycle ───────────────────────────────────────────────────────── */

export function createCompanionWindow(onLoaded: () => void): BrowserWindow {
  const saved = localSettings.get().position ?? defaultRest();
  win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: saved.x,
    y: saved.y,
    transparent: true,
    backgroundColor: "#00000000",
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
      transparent: true,
    },
  });

  win.setAlwaysOnTop(true, "floating");
  win.on("move", persistPosition);

  ipcMain.on("companion:menu", (event) => {
    if (event.sender === win?.webContents) showContextMenu();
  });
  ipcMain.on("companion:set-ignore", (event, ignore: boolean) => {
    if (event.sender !== win?.webContents) return;
    // Click-through transparent areas, forwarding mouse-move so the renderer
    // can still detect when the pointer reaches the character.
    win.setIgnoreMouseEvents(!!ignore, { forward: true });
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  win.webContents.once("did-finish-load", onLoaded);
  return win;
}

export function companionWindow(): BrowserWindow | null {
  return win;
}

export function isVisible(): boolean {
  return !!win && !win.isDestroyed() && win.isVisible();
}

function show() {
  if (win) win.show();
}

function hide() {
  if (win) win.hide();
}

/* ── Event-driven entrance / exit ────────────────────────────────────── */

/**
 * Slide the companion in from the edge `kind` describes, stay for `holdMs`,
 * then slide back out and hide. Returns once the exit has finished.
 */
export async function runEntrance(
  kind: EntranceKind,
  holdMs: number,
  xHint: number | null = null
): Promise<void> {
  const w = win;
  if (!w || w.isDestroyed() || w.webContents.isLoading()) return;
  const place = placementFor(kind, xHint);
  const ms = Math.round(380 * (place.peek ? 0.8 : 1));

  w.setPosition(place.origin.x, place.origin.y);
  show();
  await animateTo(place.rest, ms);
  await wait(holdMs);
  await animateTo(place.origin, ms);
  hide();
}

/** Slide the window out to its saved (or default) resting spot and show it. */
export async function showIdle(): Promise<void> {
  const w = win;
  if (!w || w.isDestroyed()) return;
  const rest = localSettings.get().position ?? defaultRest();
  const wa = workArea();
  const safeX = Math.max(wa.x, Math.min(rest.x, wa.x + wa.width - WINDOW_WIDTH));
  const safeY = Math.max(wa.y, Math.min(rest.y, wa.y + wa.height - WINDOW_HEIGHT));
  show();
  await animateTo({ x: safeX, y: safeY }, 300);
}

export function hideCompanion() {
  hide();
}

function wait(ms: number): Promise<void> {
  return new Promise<void>((r) => setTimeout(() => r(), ms));
}