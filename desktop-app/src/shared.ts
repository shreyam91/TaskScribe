/**
 * Types shared across the main, preload, and renderer processes.
 * Type-only where possible so Vite strips them from output bundles.
 */

export type CompanionState =
  | "idle"
  | "happy"
  | "talking"
  | "sleeping"
  | "celebrating"
  | "tired";

export type EntranceKind =
  | "slide-left"
  | "slide-right"
  | "drop-top"
  | "pop-bottom"
  | "peek-left"
  | "peek-right";

export type CompanionEvent =
  | "TASK_REMINDER"
  | "TASK_COMPLETED"
  | "TASK_OVERDUE"
  | "WATER_REMINDER"
  | "BREAK_REMINDER"
  | "USER_IDLE"
  | "USER_RETURNED";

/** What the orchestrator hands to the renderer to display. */
export interface ShowMessage {
  event: CompanionEvent;
  state: CompanionState;
  entrance: EntranceKind;
  message: string;
  /** How long the speech bubble stays before the companion exits. */
  durationMs: number;
  /** Also raise an OS notification alongside the appearance. */
  notify: boolean;
  /** Whether to show a speech bubble (respects the speech-on/off setting). */
  bubble: boolean;
}

/** A persistent state the renderer should hold until changed (e.g. sleeping). */
export interface HoldState {
  state: CompanionState;
}