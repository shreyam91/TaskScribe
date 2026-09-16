import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { findDueReminders, getUserTimezone } from '@/lib/reminder-engine';
import { computeNextTriggerAt } from '@/lib/reminder-recurrence';
import { z } from 'zod';

const reminderSchema = z.object({
  task_id: z.string().uuid().optional().nullable(),
  trigger_type: z.enum(['one_time', 'recurring']),
  recurrence_pattern: z.string().optional().nullable(),
  next_trigger_at: z.string().datetime().optional().nullable(),
  snooze_until: z.string().datetime().optional().nullable(),
  is_enabled: z.boolean().optional(),
  state: z
    .enum(['active', 'snoozed', 'completed'])
    .optional()
    .default('active'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('task_id');
    const due = searchParams.get('due') === 'true';
    const upcoming = searchParams.get('upcoming') === 'true';

    const now = new Date().toISOString();

    // Scheduler preparation: everything due right now.
    if (due) {
      const rows = await findDueReminders(new Date());
      return NextResponse.json(rows);
    }

    // Upcoming: active, enabled reminders that have not fired yet.
    if (upcoming) {
      let sql = `SELECT r.*, t.title AS task_title
                 FROM reminders r
                 LEFT JOIN tasks t ON t.id = r.task_id
                 WHERE r.is_enabled = true AND r.state <> 'completed'
                   AND r.next_trigger_at >= $1`;
      const params: any[] = [now];
      let paramIndex = 2;
      if (taskId) {
        sql += ` AND r.task_id = $${paramIndex++}`;
        params.push(taskId);
      }
      const limit = Number.parseInt(searchParams.get('limit') || '', 10);
      if (Number.isFinite(limit) && limit > 0) {
        sql += ` LIMIT $${paramIndex++}`;
        params.push(limit);
      }
      sql += ' ORDER BY r.next_trigger_at ASC';
      const res = await query(sql, params);
      return NextResponse.json(res.rows);
    }

    // Default: all reminders, optionally filtered by task (backward compatible).
    let sql = 'SELECT r.*, t.title AS task_title FROM reminders r LEFT JOIN tasks t ON t.id = r.task_id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    if (taskId) {
      sql += ` AND r.task_id = $${paramIndex++}`;
      params.push(taskId);
    }
    sql += ' ORDER BY r.next_trigger_at ASC';
    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = reminderSchema.parse(body);

    // Default a recurring reminder's first occurrence to the next interval
    // from now. One-time reminders without an explicit time fire immediately.
    let nextTriggerAt = parsed.next_trigger_at ?? null;
    if (nextTriggerAt == null && parsed.trigger_type === 'recurring') {
      const timezone = await getUserTimezone();
      nextTriggerAt = computeNextTriggerAt(
        'recurring',
        parsed.recurrence_pattern ?? null,
        new Date(),
        timezone
      )?.toISOString() ?? null;
    }

    const res = await query(
      `INSERT INTO reminders
         (task_id, trigger_type, recurrence_pattern, next_trigger_at, snooze_until, is_enabled, state)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [parsed.task_id || null, parsed.trigger_type, parsed.recurrence_pattern || null, nextTriggerAt, parsed.snooze_until || null, parsed.is_enabled ?? true, parsed.state]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}