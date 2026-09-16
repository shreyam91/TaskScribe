import type { Task } from "@/lib/api";
import moment from "moment";

/**
 * Client-side task views. TaskScribe is a single-user app with modest data,
 * so today/overdue/upcoming grouping, search and progress are computed here
 * from the full task set instead of adding server-side filters.
 */

export interface TodayPartition {
  overdue: Task[];
  today: Task[];
  upcoming: Task[];
}

/** Tasks due before the start of the current local "today". */
export function isOverdue(task: Task, now: moment.Moment = moment()): boolean {
  return (
    !!task.due_date &&
    !task.is_completed &&
    moment(task.due_date).isBefore(now.startOf("day"), "day")
  );
}

export function isDueToday(task: Task, now: moment.Moment = moment()): boolean {
  return (
    !!task.due_date &&
    !task.is_completed &&
    moment(task.due_date).isSame(now.startOf("day"), "day")
  );
}

/** Splits the open tasks into overdue / today / upcoming. */
export function partitionToday(tasks: Task[], now: moment.Moment = moment()): TodayPartition {
  const p: TodayPartition = { overdue: [], today: [], upcoming: [] };
  for (const t of tasks) {
    if (isOverdue(t, now)) p.overdue.push(t);
    else if (isDueToday(t, now)) p.today.push(t);
    else if (t.due_date) p.upcoming.push(t);
  }
  return p;
}

/** Groups open tasks by ISO day; keys are contiguous "YYYY-MM-DD" strings. */
export function groupTasksByDay(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (t.is_completed) continue;
    const key = t.due_date ? moment(t.due_date).format("YYYY-MM-DD") : "no-date";
    (groups[key] ||= []).push(t);
  }
  return groups;
}

export function dayLabel(isoKey: string): string {
  const m = moment(isoKey, "YYYY-MM-DD");
  return m.isSame(moment(), "day")
    ? "Today"
    : m.isSame(moment().add(1, "day"), "day")
    ? "Tomorrow"
    : m.format("dddd, MMMM D");
}

/** Open / total counts for a progress indicator. */
export function progress(tasks: Task[]): { done: number; total: number; pct: number } {
  const total = tasks.length;
  const done = tasks.filter((t) => t.is_completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

/** Case-insensitive substring match on title and description. */
export function matchQuery(t: Task, q: string): boolean {
  const hay = `${t.title} ${t.description ?? ""}`.toLowerCase();
  return q.split(/\s+/).every((part) => part && hay.includes(part.toLowerCase()));
}

export const PriorityLabel: Record<number, string> = {
  0: "None",
  1: "High",
  2: "Medium",
  3: "Low",
  4: "No rush",
};

export function priorityTone(p: number): string {
  switch (p) {
    case 1:
      return "bg-[hsl(var(--accent))]";
    case 2:
      return "bg-[hsl(var(--warning))]";
    case 3:
      return "bg-muted-foreground/50";
    default:
      return "bg-muted-foreground/30";
  }
}

/** Deterministic 8-color palette keyed by project name (no backend column). */
const PROJECT_HUES = [
  "16 80% 45%", // sienna
  "38 92% 50%", // amber
  "142 71% 45%", // green
  "199 89% 40%", // blue
  "262 60% 55%", // violet
  "340 65% 45%", // rose
  "204 40% 42%", // teal
  "24 40% 42%", // brown
] as const;

export function projectHue(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PROJECT_HUES[hash % PROJECT_HUES.length];
}

/** Initials monogram for a project given its name. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "·";
}