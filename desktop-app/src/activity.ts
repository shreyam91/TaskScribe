import { powerMonitor } from "electron";

/**
 * Local activity awareness. Uses only the OS's system-wide idle measure — no
 * screenshots, no screen/content reads, nothing leaves the machine. It feeds
 * productivity/wellness behavior only: sleeping on idle, a welcome on return,
 * and a continuous-focus counter used for break nudges.
 */

interface ActivityHandlers {
  onIdle: () => void;
  onReturned: () => void;
  onTick: (focusSeconds: number, active: boolean) => void;
}

const POLL_MS = 15000;

/**
 * Start watching system idle time. `idleThresholdSeconds` is how long without
 * input before the user is considered idle.
 */
export function startActivityWatcher(
  idleThresholdSeconds: number,
  handlers: ActivityHandlers
): () => void {
  let idle = false;
  let focusSeconds = 0;

  const tick = () => {
    // powerMonitor can complain before the system is ready; treat as active.
    let since = 0;
    try {
      since = powerMonitor.getSystemIdleTime();
    } catch {
      since = 0;
    }

    const nowIdle = since >= idleThresholdSeconds;
    if (nowIdle && !idle) {
      idle = true;
      focusSeconds = 0;
      handlers.onIdle();
    } else if (!nowIdle && idle) {
      idle = false;
      focusSeconds = 0;
      handlers.onReturned();
    } else if (!nowIdle) {
      focusSeconds += POLL_MS / 1000;
    }
    handlers.onTick(focusSeconds, !nowIdle);
  };

  const timer = setInterval(tick, POLL_MS);
  tick();
  return () => clearInterval(timer);
}