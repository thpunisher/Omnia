-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date    TEXT,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
    id         TEXT PRIMARY KEY NOT NULL,
    title      TEXT NOT NULL,
    content    TEXT,
    tags       TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
    id         TEXT PRIMARY KEY NOT NULL,
    title      TEXT NOT NULL,
    progress   INTEGER NOT NULL DEFAULT 0,
    target     INTEGER NOT NULL DEFAULT 100,
    status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
    id         TEXT PRIMARY KEY NOT NULL,
    title      TEXT NOT NULL,
    frequency  TEXT NOT NULL DEFAULT 'daily',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id        TEXT PRIMARY KEY NOT NULL,
    habit_id  TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date      TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id         TEXT PRIMARY KEY NOT NULL,
    title      TEXT NOT NULL,
    due_date   TEXT NOT NULL,
    completed  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Calendar events
CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY NOT NULL,
    title       TEXT NOT NULL,
    start_date  TEXT NOT NULL,
    end_date    TEXT,
    location    TEXT,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
