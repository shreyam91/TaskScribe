import { contextBridge, ipcRenderer } from "electron";
import type { ShowMessage, HoldState } from "./shared";

/**
 * Minimal, typed bridge between the overlay renderer and the main process.
 * The renderer displays what main decides; it never talks to the backend.
 */
const companionApi = {
  /** Ask main to open the context menu (right/left click on the character). */
  showMenu: () => ipcRenderer.send("companion:menu"),

  /**
   * Toggle click-through. When `ignore` is true the window's transparent
   * areas pass clicks to the app beneath while still forwarding mouse-move.
   */
  setIgnore: (ignore: boolean) => ipcRenderer.send("companion:set-ignore", ignore),

  onShow: (cb: (msg: ShowMessage) => void) => {
    const listener = (_e: unknown, msg: ShowMessage) => cb(msg);
    ipcRenderer.on("companion:show", listener);
    return () => ipcRenderer.removeListener("companion:show", listener);
  },
  onHold: (cb: (state: HoldState) => void) => {
    const listener = (_e: unknown, state: HoldState) => cb(state);
    ipcRenderer.on("companion:hold", listener);
    return () => ipcRenderer.removeListener("companion:hold", listener);
  },
  onReset: (cb: () => void) => {
    const listener = () => cb();
    ipcRenderer.on("companion:reset", listener);
    return () => ipcRenderer.removeListener("companion:reset", listener);
  },
};

contextBridge.exposeInMainWorld("companion", companionApi);

export type CompanionApi = typeof companionApi;