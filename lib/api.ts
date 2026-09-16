import useSWR, { useSWRConfig } from "swr";

/**
 * Typed REST client over TaskScribe's direct-PostgreSQL API routes.
 * Every interface maps 1:1 to the snake_case rows the routes return.
 */

/* ── Types ─────────────────────────────────────────────────────────── */

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: number; // 0–4
  is_completed: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export type ReminderTrigger = "one_time" | "recurring";
export type ReminderState = "active" | "snoozed" | "completed";

export interface Reminder {
  id: string;
  task_id: string | null;
  trigger_type: ReminderTrigger;
  recurrence_pattern: string | null;
  next_trigger_at: string | null;
  snooze_until: string | null;
  is_enabled: boolean;
  state: ReminderState;
  task_title?: string | null;
  created_at: string;
  updated_at: string;
}

export type SettingsNotificationPrefs = Record<string, any>;

export interface Settings {
  id: string;
  timezone: string;
  water_reminder_interval: number;
  break_reminder_interval: number;
  notification_preferences: SettingsNotificationPrefs;
  created_at: string;
  updated_at: string;
}

/* ── Fetch helpers ─────────────────────────────────────────────────── */

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body as T;
}

/* ── Read hooks (SWR) ──────────────────────────────────────────────── */

export function useAllTasks() {
  const swr = useSWR<Task[]>("/api/tasks", { fallbackData: [] });
  return { ...swr, data: swr.data as Task[] };
}

export function useTasks(opts: { projectId?: string | null; completed?: boolean } = {}) {
  const params = new URLSearchParams();
  if (opts.projectId) params.set("project_id", opts.projectId);
  if (opts.completed !== undefined) params.set("is_completed", String(opts.completed));
  const qs = params.toString();
  const swr = useSWR<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`, {
    fallbackData: [],
  });
  return { ...swr, data: swr.data as Task[] };
}


export function useSettings() {
  return useSWR<Settings>("/api/settings");
}

export function useReminders(opts: { upcoming?: boolean; due?: boolean } = {}) {
  const qs = opts.upcoming ? "?upcoming=true" : opts.due ? "?due=true" : "";
  const swr = useSWR<Reminder[]>(`/api/reminders${qs}`, { fallbackData: [] });
  return { ...swr, data: swr.data as Reminder[] };
}

export function useReminder(id: string | null) {
  return useSWR<Reminder>(id ? `/api/reminders/${id}` : null);
}

/**
 * Revalidates every SWR key. Cheap for a single-user app and keeps every
 * screen consistent after a mutation.
 */
export function useRefresh() {
  const { mutate } = useSWRConfig();
  return () => mutate(() => true);
}

/* ── Mutations ─────────────────────────────────────────────────────── */

export interface TaskInput {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: number;
  status?: string;
}

export const tasksApi = {
  create(input: TaskInput) {
    return json<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) });
  },
  update(id: string, patch: Partial<TaskInput> & { is_completed?: boolean }) {
    return json<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  },
  remove(id: string) {
    return json<{ success: boolean }>(`/api/tasks/${id}`, { method: "DELETE" });
  },
};

export interface ReminderInput {
  task_id?: string | null;
  trigger_type: ReminderTrigger;
  recurrence_pattern?: string | null;
  next_trigger_at?: string;
  is_enabled?: boolean;
}

export const remindersApi = {
  create(input: ReminderInput) {
    return json<Reminder>("/api/reminders", { method: "POST", body: JSON.stringify(input) });
  },
  update(id: string, patch: Partial<ReminderInput>) {
    return json<Reminder>(`/api/reminders/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  },
  remove(id: string) {
    return json<{ success: boolean }>(`/api/reminders/${id}`, { method: "DELETE" });
  },
  snooze(id: string, body: { minutes?: 10 | 30 | 60; until?: string }) {
    return json<Reminder>(`/api/reminders/${id}/snooze`, { method: "POST", body: JSON.stringify(body) });
  },
  processDue() {
    return json<{ triggered: any[] }>("/api/reminders/process-due", { method: "POST" });
  },
};

export const settingsApi = {
  update(patch: Partial<Pick<Settings, "timezone" | "water_reminder_interval" | "break_reminder_interval">> & {
    notification_preferences?: SettingsNotificationPrefs;
  }) {
    return json<Settings>("/api/settings", { method: "PUT", body: JSON.stringify(patch) });
  },
};