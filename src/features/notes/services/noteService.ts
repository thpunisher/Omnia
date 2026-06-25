import { query, execute } from "@/shared/services/db";
import { Note, CreateNoteInput, NoteFolder, CreateFolderInput } from "../types/note";
import { v4 as uuidv4 } from "uuid";

export const noteService = {
  // ─── Folders ────────────────────────────────────────────────────────────
  getAllFolders: async (): Promise<NoteFolder[]> =>
    query<NoteFolder>("SELECT * FROM note_folders ORDER BY name ASC"),

  createFolder: async (input: CreateFolderInput): Promise<NoteFolder> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    await execute(
      "INSERT INTO note_folders (id, name, parent_id) VALUES (?, ?, ?)",
      [id, input.name, input.parent_id]
    );
    return { id, name: input.name, parent_id: input.parent_id, created_at: now };
  },

  renameFolder: async (id: string, name: string): Promise<void> =>
    execute("UPDATE note_folders SET name = ? WHERE id = ?", [name, id]),

  deleteFolder: async (id: string): Promise<void> => {
    // Move notes in this folder to root before deleting
    await execute("UPDATE notes SET folder_id = NULL WHERE folder_id = ?", [id]);
    await execute("DELETE FROM note_folders WHERE id = ?", [id]);
  },

  // ─── Notes ──────────────────────────────────────────────────────────────
  getAll: async (): Promise<Note[]> =>
    query<Note>("SELECT * FROM notes ORDER BY updated_at DESC"),

  getByFolder: async (folderId: string | null): Promise<Note[]> => {
    if (folderId === null) {
      return query<Note>("SELECT * FROM notes WHERE folder_id IS NULL ORDER BY updated_at DESC");
    }
    return query<Note>("SELECT * FROM notes WHERE folder_id = ? ORDER BY updated_at DESC", [folderId]);
  },

  getRecent: async (limit = 5): Promise<Note[]> =>
    query<Note>("SELECT * FROM notes ORDER BY updated_at DESC LIMIT ?", [limit]),

  getById: async (id: string): Promise<Note | null> => {
    const rows = await query<Note>("SELECT * FROM notes WHERE id = ?", [id]);
    return rows[0] ?? null;
  },

  create: async (input: CreateNoteInput): Promise<Note> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    await execute(
      "INSERT INTO notes (id, title, content, tags, folder_id, icon) VALUES (?, ?, ?, ?, ?, ?)",
      [id, input.title, input.content, input.tags, input.folder_id ?? null, input.icon ?? null]
    );
    return { ...input, id, folder_id: input.folder_id ?? null, icon: input.icon ?? null, created_at: now, updated_at: now };
  },

  update: async (id: string, input: Partial<CreateNoteInput>): Promise<void> => {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (input.title !== undefined)     { fields.push("title = ?");     values.push(input.title); }
    if (input.content !== undefined)   { fields.push("content = ?");   values.push(input.content); }
    if (input.tags !== undefined)      { fields.push("tags = ?");      values.push(input.tags); }
    if (input.folder_id !== undefined) { fields.push("folder_id = ?"); values.push(input.folder_id); }
    if (input.icon !== undefined)      { fields.push("icon = ?");      values.push(input.icon); }
    if (!fields.length) return;
    values.push(id);
    await execute(
      `UPDATE notes SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  },

  moveToFolder: async (noteId: string, folderId: string | null): Promise<void> =>
    execute("UPDATE notes SET folder_id = ? WHERE id = ?", [folderId, noteId]),

  delete: async (id: string): Promise<void> =>
    execute("DELETE FROM notes WHERE id = ?", [id]),
};
