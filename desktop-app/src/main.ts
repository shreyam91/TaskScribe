import { app, shell } from "electron";
import started from "electron-squirrel-startup";

import { apiBase, taskScribe, type TaskRow } from "./api";
import { startActivityWatcher } from "./activity";
import * as companion from "./companion";
import { createTray, type TrayActions } from "./tray";
import {
  companionWindow,
  configureMenuActions,
  createCompanionWindow,
  hideCompanion,
  showIdle,
} from "./window";
import { localSettings } from "./store";

app.setName("TaskScribe");

if (started) {
  app.quit();
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

/* ── Reminder/wellness state ────────────────────────────────────────── */

let waterIntervalSeconds = 0;
let breakIntervalSeconds = 0;
let lastWater = 0;
let lastBreak = 0;

/* ── Startup ────────────────────────────────────────────────────────── */

app.whenReady().then(() => {
  createCompanionWindow(() => {
    // Show a calm idle frame so a manual "Show Virtual Me" isn't blank.
    companionWindow()?.webContents.send("companion:hold", { state: "idle" });
  });

  configureCompanionMenuActions();

  const trayActions: TrayActions = {
    onShow: () => {
      void showIdle();
      companionWindow()?.webContents.send("companion:hold", { state: "idle" });
    },
    onHide: hideCompanion,
    onToday: () => void shell.openExternal(`${apiBase}/loggedin/today`),
    onNext: () => void showNextReminder(),
    onOpen: () => void shell.openExternal(apiBase),
    onSettings: () => void shell.openExternal(`${apiBase}/loggedin/settings`),
  };
  createTray(trayActions);

  startActivityWatcher(localSettings.get().idleThresholdSeconds, {
    onIdle: () => {
      resetWellnessTimers();
      companion.trigger("USER_IDLE");
    },
    onReturned: () => {
      resetWellnessTimers();
      companion.trigger("USER_RETURNED");
    },
    onTick: (focusSeconds, active) => handleWellness(active, focusSeconds),
  });

  startTick();
});

/* ── Companion context-menu actions ─────────────────────────────────── */

function configureCompanionMenuActions() {
  configureMenuActions({
    onToggleNotifications: () => {
      const next = !localSettings.get().notifications;
      localSettings.update({ notifications: next });
    },
  });
}

/* ── Wellness (water/break) ─────────────────────────────────────────── */

function resetWellnessTimers() {
  lastWater = Date.now();
  lastBreak = Date.now();
}

function handleWellness(active: boolean, _focusSeconds: number) {
  if (!active) return; // no accumulation while idle; baselines reset on idle
  const now = Date.now();
  if (waterIntervalSeconds > 0 && now - lastWater >= waterIntervalSeconds * 1000) {
    companion.trigger("WATER_REMINDER");
    lastWater = now;
  }
  if (breakIntervalSeconds > 0 && now - lastBreak >= breakIntervalSeconds * 1000) {
    companion.trigger("BREAK_REMINDER");
    lastBreak = now;
  }
}

/* ── Polling loop ───────────────────────────────────────────────────── */

const TICK_MS = 20000;
let tickCount = 0;

function startTick() {
  const run = () => {
    tickCount++;
    const chain: Promise<void> = (async () => {
      if (tickCount % 2 === 1) await refreshSettings();
      await checkDueReminders();
      await checkTasks();
    })();
    chain.catch((e) => console.error("Poll error", e));
  };
  run();
  setInterval(run, TICK_MS);
}

async function refreshSettings() {
  try {
    const s = await taskScribe.settings();
    companion.updateBackendSettings(s);
    waterIntervalSeconds = (s.water_reminder_interval || 0) * 60;
    breakIntervalSeconds = (s.break_reminder_interval || 0) * 60;
    if (waterIntervalSeconds === 0) lastWater = Date.now();
    if (breakIntervalSeconds === 0) lastBreak = Date.now();
  } catch {
    /* backend not reachable right now; try again next tick */
  }
}

async function checkDueReminders() {
  try {
    const due = await taskScribe.dueReminders();
    if (due.length === 0) return;
    companion.trigger("TASK_REMINDER", due[0].task_title ?? null);
    // Let the backend advance every due reminder; the companion only delivers.
    await taskScribe.processDue();
  } catch {
    /* ignore transient failures */
  }
}

/** Track the newest completion and any newly-overdue task, once each. */
async function checkTasks() {
  try {
    const tasks = await taskScribe.tasks();
    const dayKey = new Date().toISOString().slice(0, 10);

    // Forget yesterday's overdue reports so today can re-surface them gently.
    for (const [id, day] of reportedOverdue) if (day !== dayKey) reportedOverdue.delete(id);

    const newlyCompleted = tasks.filter(
      (t) => t.is_completed && !lastTasks.get(t.id)?.is_completed
    );
    if (newlyCompleted.length > 0) {
      companion.trigger(
        "TASK_COMPLETED",
        newlyCompleted.length === 1 ? newlyCompleted[0].title : null
      );
    }

    for (const t of tasks) {
      if (!t.is_completed && t.due_date) {
        const dueDt = new Date(t.due_date);
        if (dueDt < new Date() && !reportedOverdue.has(t.id)) {
          reportedOverdue.set(t.id, dayKey);
          companion.trigger("TASK_OVERDUE", t.title);
          break; // one gentle nudge per tick
        }
      }
    }

    lastTasks = new Map(tasks.map((t) => [t.id, t]));
  } catch {
    /* ignore transient failures */
  }
}

const reportedOverdue = new Map<string, string>();
let lastTasks = new Map<string, TaskRow>();

/* ── Tray "Next Reminder" ───────────────────────────────────────────── */

async function showNextReminder() {
  try {
    const next = await taskScribe.nextUpcoming();
    if (next?.task_title) {
      companion.trigger("TASK_REMINDER", next.task_title);
    } else {
      companion.trigger("TASK_REMINDER", null, "Nothing scheduled right now.");
    }
  } catch {
    companion.trigger("TASK_REMINDER", null, "TaskScribe isn’t reachable.");
  }
}

/* ── Lifecycle ──────────────────────────────────────────────────────── */

app.on("second-instance", () => {
  void showIdle();
});

// Keep running in the tray; the overlay window is hidden, not closed.
app.on("window-all-closed", () => {
  /* intentionally retained */
});

app.on("activate", () => {
  void showIdle();
});