import pool from '@/lib/db';
import {
  transitionsAfterTrigger,
  type ReminderState,
  type TriggerType,
} from '@/lib/reminder-recurrence';

/**
 * Database layer for the reminder engine. Thin functions over direct,
 * parameterized PostgreSQL queries. Pure recurrence/state math lives in
 * `lib/reminder-recurrence` and is reused here — never duplicated.
 */

/** Row shape returned by the JOIN in `findDueReminders`. */
export interface DueReminder {
  id: string;
  task_id: string | null;
  task_title: string | null;
  trigger_type: TriggerType;
  recurrence_pattern: string | null;
  next_trigger_at: string | null;
  snooze_until: string | null;
  is_enabled: boolean;
  state: ReminderState;
}

/** The single-user app stores its timezone in the settings table. */
export async function getUserTimezone(): Promise<string> {
  const res = await pool.query(
    `SELECT timezone FROM settings ORDER BY created_at DESC LIMIT 1`
  );
  return (res.rows[0]?.timezone as string | undefined) || 'UTC';
}

/**
 * Scheduler preparation: everything that is due right now.
 *
 * A reminder is due when it is enabled, not completed, and its next firing
 * point has arrived. The firing point is `snooze_until` while a reminder is
 * snoozed, otherwise `next_trigger_at`.
 */
export async function findDueReminders(now: Date = new Date()): Promise<DueReminder[]> {
  const res = await pool.query(
    `SELECT
       r.id,
       r.task_id,
       r.trigger_type,
       r.recurrence_pattern,
       r.next_trigger_at,
       r.snooze_until,
       r.is_enabled,
       r.state,
       t.title AS task_title
     FROM reminders r
     LEFT JOIN tasks t ON t.id = r.task_id
     WHERE r.is_enabled = true
       AND r.state <> 'completed'
       AND COALESCE(r.snooze_until, r.next_trigger_at) <= $1
     ORDER BY r.next_trigger_at ASC`,
    [now.toISOString()]
  );
  return res.rows as DueReminder[];
}

/**
 * Advance every due reminder: recompute and store the next occurrence
 * (disabling one-time reminders) and return the triggered reminders for
 * the desktop client to display as notifications.
 */
export async function processDueReminders(now: Date = new Date()) {
  const timezone = await getUserTimezone();
  const due = await findDueReminders(now);
  if (due.length === 0) return [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const triggered: Array<{
      id: string;
      task_id: string | null;
      task_title: string | null;
      trigger_type: TriggerType;
      recurrence_pattern: string | null;
      next_trigger_at: Date | null;
    }> = [];

    for (const reminder of due) {
      const t = transitionsAfterTrigger(reminder, timezone);
      await client.query(
        `UPDATE reminders
         SET next_trigger_at = $1, is_enabled = $2, state = $3,
             snooze_until = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [t.next_trigger_at, t.is_enabled, t.state, t.snooze_until, reminder.id]
      );
      triggered.push({
        id: reminder.id,
        task_id: reminder.task_id,
        task_title: reminder.task_title,
        trigger_type: reminder.trigger_type,
        recurrence_pattern: reminder.recurrence_pattern,
        next_trigger_at: t.next_trigger_at,
      });
    }

    await client.query('COMMIT');
    return triggered;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}