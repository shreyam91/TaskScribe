import type { Project, Reminder, Task } from "@/lib/api";
import { PriorityLabel } from "@/lib/task-view";

/**
 * Recurring patterns we know how to render. "custom" is a raw integer string
 * ("3") meaning "every N days" and is surfaced as Custom.
 */
export type RecurrenceKind = "none" | "daily" | "weekdays" | "weekly" | "custom";

export function recurrenceKind(pattern: string | null): RecurrenceKind {
  if (!pattern) return "none";
  const p = pattern.toLowerCase();
  if (p === "daily") return "daily";
  if (p === "weekdays") return "weekdays";
  if (p === "weekly") return "weekly";
  if (/^\d+$/.test(p)) return "custom";
  return "custom";
}

export function recurrenceLabel(pattern: string | null): string {
  const p = pattern?.toLowerCase() || "";
  switch (p) {
    case "daily":
      return "Daily";
    case "weekdays":
      return "Weekdays";
    case "weekly":
      return "Weekly";
    default:
      return /^\d+$/.test(p) ? `Every ${p} day${p === "1" ? "" : "s"}` : "One-time";
  }
}

/** Builds a UTC ISO string from a native "YYYY-MM-DD" date and optional "HH:mm" time. */
export function partsToIso(dateStr: string | null, timeStr: string | null): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr || "").split(":").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, 0, 0);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

export { PriorityLabel };

export type { Project, Reminder, Task };