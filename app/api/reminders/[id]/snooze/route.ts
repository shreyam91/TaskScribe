import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const snoozeSchema = z
  .object({
    // Predefined snooze options supported by the UI.
    minutes: z.union([z.literal(10), z.literal(30), z.literal(60)]).optional(),
    // Custom absolute time to resume, used when the caller needs it.
    until: z.string().datetime().optional(),
  })
  .refine((v) => v.minutes !== undefined || v.until !== undefined, {
    message: 'Provide either minutes or until',
  });

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = snoozeSchema.parse(body);

    const res = await query(
      parsed.until !== undefined
        ? `UPDATE reminders SET snooze_until = $2, state = 'snoozed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`
        : `UPDATE reminders SET snooze_until = CURRENT_TIMESTAMP + ($2 * INTERVAL '1 minute'), state = 'snoozed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      parsed.until !== undefined ? [params.id, parsed.until] : [params.id, parsed.minutes]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error snoozing reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}