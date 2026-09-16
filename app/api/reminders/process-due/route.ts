import { NextResponse } from 'next/server';
import { processDueReminders } from '@/lib/reminder-engine';

/**
 * Scheduler entry point. Advances every due reminder (recomputing the next
 * occurrence, disabling one-time reminders) and returns the reminders that
 * just triggered so the desktop client can display notifications.
 */
export async function POST() {
  try {
    const triggered = await processDueReminders(new Date());
    return NextResponse.json({ triggered });
  } catch (error) {
    console.error('Error processing due reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}