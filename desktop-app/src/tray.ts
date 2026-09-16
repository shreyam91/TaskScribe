import { Tray, Menu, nativeImage, app } from "electron";
import path from "node:path";

/**
 * System tray with exactly the requested items. The tray is the app's quiet
 * anchor — it never duplicates the TaskScribe app itself, only opens it.
 */

export interface TrayActions {
  onShow: () => void;
  onHide: () => void;
  onToday: () => void;
  onNext: () => void;
  onOpen: () => void;
  onSettings: () => void;
}

function trayIcon(): Electron.NativeImage {
  try {
    const icon = nativeImage.createFromPath(
      path.join(__dirname, "../renderer/main_window/virtual_me/idle/idle_01.png")
    );
    if (!icon.isEmpty()) return icon.resize({ width: 18, height: 18 });
  } catch {
    /* fall through to the empty image */
  }
  return nativeImage.createEmpty();
}

export function createTray(actions: TrayActions): Tray {
  const tray = new Tray(trayIcon());
  tray.setToolTip("TaskScribe · Virtual Me");
  rebuild(tray, actions);
  return tray;
}

/** (Re)build the tray menu — kept as a function so it can be refreshed. */
export function rebuild(tray: Tray, actions: TrayActions): void {
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show Virtual Me", click: actions.onShow },
      { label: "Hide Virtual Me", click: actions.onHide },
      { type: "separator" },
      { label: "Today’s Tasks", click: actions.onToday },
      { label: "Next Reminder", click: actions.onNext },
      { label: "Open TaskScribe", click: actions.onOpen },
      { label: "Settings", click: actions.onSettings },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ])
  );
}