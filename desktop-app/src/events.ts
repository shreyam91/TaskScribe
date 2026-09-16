import type {
  CompanionEvent,
  CompanionState,
  EntranceKind,
} from "./shared";

/**
 * Presentation metadata per event. Central and simple: each event declares
 * which character state to show, which edge it enters from, whether an OS
 * notification should accompany it, and how long to stay.
 */
export interface EventSpec {
  state: CompanionState;
  entrance: EntranceKind;
  notify: boolean;
  durationMs: number;
}

export const EVENT_SPECS: Record<CompanionEvent, EventSpec> = {
  TASK_REMINDER: { state: "talking", entrance: "slide-right", notify: true, durationMs: 9000 },
  TASK_COMPLETED: { state: "celebrating", entrance: "pop-bottom", notify: false, durationMs: 6000 },
  TASK_OVERDUE: { state: "talking", entrance: "slide-left", notify: false, durationMs: 8000 },
  WATER_REMINDER: { state: "idle", entrance: "peek-left", notify: true, durationMs: 6000 },
  BREAK_REMINDER: { state: "tired", entrance: "drop-top", notify: true, durationMs: 7000 },
  USER_IDLE: { state: "sleeping", entrance: "drop-top", notify: false, durationMs: 3000 },
  USER_RETURNED: { state: "idle", entrance: "peek-right", notify: false, durationMs: 6000 },
};

/** Derived helper: next available entrance for the event. */
export function entranceFor(event: CompanionEvent): EntranceKind {
  return EVENT_SPECS[event].entrance;
}