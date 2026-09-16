import type { CompanionApi } from "./preload";
import type { CompanionState, HoldState, ShowMessage } from "./shared";
import "./index.css";

/**
 * The overlay UI. Renders the Virtual Me pixel character with a tiny sprite
 * cycle and a short speech bubble. All decisions come from the main process
 * over IPC; this file never contacts TaskScribe or any network.
 */

declare global {
  interface Window {
    companion: CompanionApi;
  }
}

const FRAME_COUNT = 6;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const character = $<HTMLImageElement>("character");
const bubble = $<HTMLDivElement>("bubble");

/* ── Sprite cycling ─────────────────────────────────────────────────── */

type StateFrames = Record<CompanionState, number>;
const frameCounts: StateFrames = {
  idle: FRAME_COUNT,
  happy: FRAME_COUNT,
  talking: FRAME_COUNT,
  sleeping: FRAME_COUNT,
  celebrating: FRAME_COUNT,
  tired: FRAME_COUNT,
};

let cycleTimer: ReturnType<typeof setInterval> | null = null;
let currentState: CompanionState = "idle";

function stopCycle() {
  if (cycleTimer) clearInterval(cycleTimer);
  cycleTimer = null;
}

function showFrame(state: CompanionState, frame: number) {
  currentState = state;
  const n = Math.max(1, Math.min(frameCounts[state], frame + 1));
  character.src = `/virtual_me/${state}/${state}_${String(n).padStart(2, "0")}.png`;
}

function playState(state: CompanionState, intervalMs: number) {
  stopCycle();
  let frame = 0;
  showFrame(state, frame);
  cycleTimer = setInterval(() => {
    frame = (frame + 1) % frameCounts[state];
    showFrame(state, frame);
  }, intervalMs);
}

/* ── Speech bubble ──────────────────────────────────────────────────── */

function setBubble(text: string, visible: boolean) {
  bubble.textContent = text;
  bubble.classList.toggle("visible", visible);
}

/* ── IPC from main ──────────────────────────────────────────────────── */

window.companion.onShow((msg: ShowMessage) => {
  playState(msg.state, msg.state === "sleeping" ? 600 : 180);
  setBubble(msg.message, msg.bubble);
});

window.companion.onHold(({ state }: HoldState) => {
  stopCycle();
  // Hold a calm middle frame rather than animating continuously.
  showFrame(state, 2);
  setBubble("", false);
});

window.companion.onReset(() => {
  stopCycle();
  showFrame("idle", 0);
  setBubble("", false);
});

/* ── Pointer: interactive on the character, click-through elsewhere ─── */

let interactive = false;

function syncIgnore() {
  window.companion.setIgnore(!interactive);
}

// Listen on the whole document: when click-through is on, forwarded
// mouse-move targets the topmost element at the cursor, which may not be the
// character, so we compute against its rect ourselves.
document.addEventListener("pointermove", (e) => {
  const rect = character.getBoundingClientRect();
  const over =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;
  if (over !== interactive) {
    interactive = over;
    syncIgnore();
  }
});

character.addEventListener("click", () => window.companion.showMenu());