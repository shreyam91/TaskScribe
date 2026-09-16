import { net } from "electron";

/**
 * Read-only client for the TaskScribe backend.
 *
 * The backend is the source of truth: this client only reads its REST API and
 * advances due reminders by calling its own `process-due` endpoint. No task or
 * reminder business logic is duplicated here.
 */

export interface Settings {
  timezone: string;
  water_reminder_interval: number; // minutes, 0 = off
  break_reminder_interval: number; // minutes, 0 = off
  notification_preferences: Record<string, any>;
}

/** Shape of `virtualMe` inside `notification_preferences`. */
export interface VirtualMePrefs {
  enabled?: boolean;
  character?: "companion" | "instructor" | "coach";
  reminderBehavior?: "gentle" | "direct" | "coaching";
  animations?: boolean;
  speech?: boolean;
  desktop?: boolean;
}

export interface WellnessPrefs {
  quiet?: { start: string; end: string } | null;
}

export interface DueReminder {
  id: string;
  task_id: string | null;
  task_title: string | null;
  trigger_type: string;
  recurrence_pattern: string | null;
  next_trigger_at: string | null;
}

export interface TaskRow {
  id: string;
  title: string;
  is_completed: boolean;
  due_date: string | null;
}

/** Base URL of the TaskScribe backend. Set TASKSCRIBE_API_URL to override. */
export const apiBase =
  process.env.TASKSCRIBE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

async function getJson<T>(url: string): Promise<T> {
  const res = await net.fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}

export const taskScribe = {
  async settings(): Promise<Settings> {
    return getJson<Settings>(`${apiBase}/api/settings`);
  },

  /** Reminders that are due right now (enabled, not completed). */
  async dueReminders(): Promise<DueReminder[]> {
    return getJson<DueReminder[]>(`${apiBase}/api/reminders?due=true`);
  },

  /** Ask the backend to advance every due reminder and return what fired. */
  async processDue(): Promise<{ triggered: DueReminder[] }> {
    const res = await net.fetch(`${apiBase}/api/reminders/process-due`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`process-due -> ${res.status}`);
    return (await res.json()) as { triggered: DueReminder[] };
  },

  async tasks(): Promise<TaskRow[]> {
    return getJson<TaskRow[]>(`${apiBase}/api/tasks`);
  },

  /** First upcoming reminder that has not fired yet, or null. */
  async nextUpcoming(): Promise<DueReminder | null> {
    const all = await getJson<DueReminder[]>(
      `${apiBase}/api/reminders?upcoming=true&limit=1`
    );
    return all[0] ?? null;
  },
};