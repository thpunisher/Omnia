export interface NoteFolder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  tags: string | null;
  folder_id: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateNoteInput = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type CreateFolderInput = Omit<NoteFolder, 'id' | 'created_at'>;
