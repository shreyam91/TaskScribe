-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'todo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('one_time', 'recurring')),
    recurrence_pattern TEXT, -- e.g., 'daily', 'weekly', 'weekdays'
    next_trigger_at TIMESTAMP WITH TIME ZONE,
    snooze_until TIMESTAMP WITH TIME ZONE,
    is_enabled BOOLEAN DEFAULT true,
    state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'snoozed', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add the state column to existing databases (no-op on fresh installs).
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'active'
    CHECK (state IN ('active', 'snoozed', 'completed'));

-- Settings Table (Single Row Expected)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timezone TEXT DEFAULT 'UTC',
    water_reminder_interval INTEGER DEFAULT 60, -- minutes
    break_reminder_interval INTEGER DEFAULT 60, -- minutes
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_next_trigger_at ON reminders(next_trigger_at);
