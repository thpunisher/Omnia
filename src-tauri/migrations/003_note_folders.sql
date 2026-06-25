CREATE TABLE IF NOT EXISTS note_folders (
    id         TEXT PRIMARY KEY NOT NULL,
    name       TEXT NOT NULL,
    parent_id  TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES note_folders(id) ON DELETE SET NULL
);

-- SQLite requires separate ALTER TABLE statements
ALTER TABLE notes ADD COLUMN folder_id TEXT REFERENCES note_folders(id) ON DELETE SET NULL;
ALTER TABLE notes ADD COLUMN icon TEXT;

CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
