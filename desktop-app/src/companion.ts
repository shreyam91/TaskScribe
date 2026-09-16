import type { CompanionEvent, ShowMessage } from "./shared";
import { EVENT_SPECS } from "./events";
import { messageFor } from "./speech";
import type { Settings } from "./api";
import { notify } from "./notifications";
import { companionWindow, runEntrance } from "./window";
import { localSettings } from "./store";

/**
 * Turns an event into a companion appearance: entrance + reaction + message +
 * optional OS notification + exit. This is the single, simple decision point —
 * no event abstractions beyond the `trigger` entry point.
 */

/* ── Latest known backend + local settings ──────────────────────────── */

let settings: Settings | null = null;

export function updateBackendSettings(next: Settings): void {
  settings = next;
}

const quietSuppressed: Set<CompanionEvent> = new Set([
  "TASK_REMINDER",
  "TASK_OVERDUE",
  "WATER_REMINDER",
  "BREAK_REMINDER",
]);

/* ── Quiet hours ────────────────────────────────────────────────────── */

function isQuietNow(): boolean {
  const quiet = settings?.notification_preferences?.wellness?.quiet;
  if (!quiet?.start || !quiet?.end) return false;
  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const start = toMin(quiet.start);
  const end = toMin(quiet.end);
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  if (start === end) return false;
  return start < end ? now >= start && now < end : now >= start || now < end;
}

/* ── Presentation queue (one at a time, calm, never overlapping) ────── */

let queue: Promise<void> = Promise.resolve();

function notificationTitle(event: CompanionEvent): string {
  switch (event) {
    case "WATER_REMINDER":
      return "Water reminder";
    case "BREAK_REMINDER":
      return "Break reminder";
    case "TASK_COMPLETED":
      return "Task completed";
    default:
      return "Task reminder";
  }
}

async function present(msg: ShowMessage): Promise<void> {
  const w = companionWindow();
  if (!w || w.isDestroyed()) return;
  w.webContents.send("companion:show", msg);
  await runEntrance(msg.entrance, msg.durationMs);
  // Reset the renderer back to a quiet frame after the exit completes.
  w.webContents.send("companion:reset");
}

/**
 * Trigger an event. Respects the desktop/master switches, quiet hours, and
 * whether the companion should appear vs. notify only.
 */
export function trigger(
  event: CompanionEvent,
  taskTitle: string | null = null,
  overrideMessage: string | null = null
): void {
  queue = queue
    .then(() => doTrigger(event, taskTitle, overrideMessage))
    .catch((e) => {
      console.error("Companion appearance failed", e);
    });
}

function doTrigger(
  event: CompanionEvent,
  taskTitle: string | null,
  overrideMessage: string | null
): Promise<void> | undefined {
  const local = localSettings.get();
  const prefs = settings?.notification_preferences ?? {};
  const vm = prefs.virtualMe ?? {};

  // Idle is a "hold" state, not an enter-and-leave appearance.
  if (event === "USER_IDLE") {
    const w = companionWindow();
    w?.webContents?.send("companion:hold", { state: "sleeping" });
    return;
  }

  // The desktop companion switch turns everything off.
  if (vm.desktop === false) return;
  // User chose the character but muted quiet hours; temp skip.
  if (quietSuppressed.has(event) && isQuietNow()) return;

  const spec = EVENT_SPECS[event];
  const message = overrideMessage ?? messageFor(event, vm, taskTitle);
  const showAppearance = vm.enabled !== false && local.showForNotifications;
  const shouldNotify = spec.notify && local.notifications;

  let title = "";
  if (event === "TASK_REMINDER" && taskTitle) title = taskTitle;
  else title = notificationTitle(event);

  if (shouldNotify) notify(title, message);

  // Notification (if any) already raised above; appearance is separate.
  if (!showAppearance) return;

  return present({
    event,
    state: spec.state,
    entrance: spec.entrance,
    message,
    durationMs: spec.durationMs,
    notify: false,
    bubble: vm.speech !== false,
  });
}

/** Used by the tray "Show Virtual Me" to wake the idle companion. */
export function companionEnabled(): boolean {
  const vm = settings?.notification_preferences?.virtualMe ?? {};
  return vm.desktop !== false;
}