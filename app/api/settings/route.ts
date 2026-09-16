import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const settingsUpdateSchema = z.object({
  timezone: z.string().optional(),
  water_reminder_interval: z.number().int().min(0).optional(),
  break_reminder_interval: z.number().int().min(0).optional(),
  notification_preferences: z.record(z.any()).optional(),
});

export async function GET() {
  try {
    const res = await query('SELECT * FROM settings LIMIT 1');
    
    if (res.rowCount === 0) {
      // Create default settings if none exist
      const insertRes = await query(
        'INSERT INTO settings DEFAULT VALUES RETURNING *'
      );
      return NextResponse.json(insertRes.rows[0]);
    }
    
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsed = settingsUpdateSchema.parse(body);

    if (Object.keys(parsed).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updates = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(parsed)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(key === 'notification_preferences' ? JSON.stringify(value) : value);
      paramIndex++;
    }

    // Since it's a single row, we just update all rows (which is 1)
    const sql = `UPDATE settings SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP RETURNING *`;

    const res = await query(sql, values);

    if (res.rowCount === 0) {
      // If by some chance no row existed, insert with these values
      const insertKeys = Object.keys(parsed).join(', ');
      const insertPlaceholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const insertRes = await query(`INSERT INTO settings (${insertKeys}) VALUES (${insertPlaceholders}) RETURNING *`, values);
      return NextResponse.json(insertRes.rows[0]);
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
