import { Notification, nativeImage } from "electron";
import path from "node:path";

/**
 * Thin wrapper over Electron's OS Notification. Keeps a tiny recent-log so a
 * genuinely identical reminder is not spammed every poll.
 */

const recent = new Map<string, number>();
const DEDUPE_MS = 15000;
const REAP_MS = 60000;

/** Best-effort Notification icon from the bundled character sprite. */
function iconImage(): Electron.NativeImage | undefined {
  try {
    const png = path.join(__dirname, "../renderer/main_window/virtual_me/idle/idle_01.png");
    const img = nativeImage.createFromPath(png);
    return img.isEmpty() ? undefined : img;
  } catch {
    return undefined;
  }
}

export function notify(title: string, body: string): void {
  if (!Notification.isSupported()) return;

  const key = `${title}::${body}`;
  const now = Date.now();
  const last = recent.get(key);
  if (last !== undefined && now - last < DEDUPE_MS) return;
  recent.set(key, now);

  // Reap stale entries so the map stays tiny.
  for (const [k, t] of recent) if (now - t > REAP_MS) recent.delete(k);

  const icon = iconImage();
  const n = new Notification({ title, body, icon, silent: false });
  n.show();
}