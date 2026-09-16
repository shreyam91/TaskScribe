import moment from 'moment-timezone';

/**
 * Pure, DB-free logic for computing reminder recurrences and state
 * transitions. Kept separate from the database layer so it can be tested
 * in isolation with Node's type stripping.
 */

export type TriggerType = 'one_time' | 'recurring';
export type ReminderState = 'active' | 'snoozed' | 'completed';

/** The recurrence patterns TaskScribe supports. A numeric string (e.g. "3")
 *  is treated as "every N days" — a light custom recurrence that fits the
 *  existing (free-text) `recurrence_pattern` column. */
export type RecurrencePattern = 'daily' | 'weekly' | 'weekdays' | string;

export interface ReminderLike {
  trigger_type: TriggerType;
  recurrence_pattern: string | null;
  next_trigger_at: Date | string | null;
}

export interface TransitionResult {
  next_trigger_at: Date | null;
  is_enabled: boolean;
  state: ReminderState;
  snooze_until: Date | null;
}

/**
 * Compute the next occurrence of a recurring reminder relative to a
 * reference instant, using calendar units in the user's timezone so the
 * wall-clock time is preserved across DST boundaries.
 *
 * Returns null when there is no sensible next occurrence (one-time
 * reminders, or an unknown custom pattern).
 */
export function computeNextTriggerAt(
  triggerType: TriggerType,
  recurrencePattern: string | null,
  referenceAt: Date | string | number,
  timezone: string
): Date | null {
  if (triggerType !== 'recurring') return null;

  const pattern = recurrencePattern ?? 'daily';
  const m = moment(referenceAt).tz(timezone);

  switch (pattern) {
    case 'daily':
      return m.add(1, 'day').toDate();
    case 'weekly':
      return m.add(1, 'week').toDate();
    case 'weekdays': {
      // Advance one day at a time until the next day is a weekday (Mon-Fri).
      do {
        m.add(1, 'day');
      } while (m.day() === 0 || m.day() === 6);
      return m.toDate();
    }
    default: {
      // Custom recurrence: a positive integer string = every N days.
      const interval = Number.parseInt(pattern, 10);
      if (Number.isFinite(interval) && interval > 0) {
        return m.add(interval, 'days').toDate();
      }
      // Unknown pattern — fall back to a single day so the reminder does
      // not silently stop recurring.
      return m.add(1, 'day').toDate();
    }
  }
}

/**
 * The state a reminder should move into after it triggers.
 * - One-time reminders are disabled and marked completed.
 * - Recurring reminders stay active and are scheduled for their next
 *   occurrence, computed from the occurrence that just fired (not wall-clock
 *   "now") so the cadence stays constant even when processing runs late.
 */
export function transitionsAfterTrigger(
  reminder: ReminderLike,
  timezone: string
): TransitionResult {
  if (reminder.trigger_type === 'one_time') {
    return {
      next_trigger_at: null,
      is_enabled: false,
      state: 'completed',
      snooze_until: null,
    };
  }

  // Reference is the scheduled instant of the occurrence that just fired.
  const reference =
    reminder.next_trigger_at != null
      ? new Date(reminder.next_trigger_at)
      : new Date();

  const next = computeNextTriggerAt(
    'recurring',
    reminder.recurrence_pattern,
    reference,
    timezone
  );

  return {
    next_trigger_at: next,
    is_enabled: true,
    state: 'active',
    snooze_until: null,
  };
}