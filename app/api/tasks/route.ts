import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().datetime().optional().nullable(),
  priority: z.number().int().min(0).max(4).optional(),
  is_completed: z.boolean().optional(),
  status: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isCompleted = searchParams.get('is_completed');

    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (isCompleted !== null) {
      sql += ` AND is_completed = $${paramIndex++}`;
      params.push(isCompleted === 'true');
    }

    sql += ' ORDER BY created_at DESC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = taskSchema.parse(body);

    const res = await query(
      `INSERT INTO tasks (title, description, due_date, priority, is_completed, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        parsed.title, 
        parsed.description || null, 
        parsed.due_date || null, 
        parsed.priority || 0, 
        parsed.is_completed || false, 
        parsed.status || 'todo'
      ]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
