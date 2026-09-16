import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const reminderUpdateSchema = z.object({
  trigger_type: z.enum(['one_time', 'recurring']).optional(),
  recurrence_pattern: z.string().optional().nullable(),
  next_trigger_at: z.string().datetime().optional().nullable(),
  snooze_until: z.string().datetime().optional().nullable(),
  is_enabled: z.boolean().optional(),
  state: z.enum(['active', 'snoozed', 'completed']).optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const res = await query('SELECT * FROM reminders WHERE id = $1', [id]);
    
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const parsed = reminderUpdateSchema.parse(body);

    if (Object.keys(parsed).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updates = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(parsed)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    values.push(id);
    const sql = `UPDATE reminders SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;

    const res = await query(sql, values);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const res = await query('DELETE FROM reminders WHERE id = $1 RETURNING id', [id]);
    
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
