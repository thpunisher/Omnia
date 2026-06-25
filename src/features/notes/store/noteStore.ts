import { create } from "zustand";
import { Note, CreateNoteInput, NoteFolder, CreateFolderInput } from "../types/note";
import { noteService } from "../services/noteService";

interface NoteState {
  notes: Note[];
  folders: NoteFolder[];
  activeFolderId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchAllNotes: () => Promise<void>;
  fetchRecentNotes: () => Promise<void>;
  setActiveFolder: (id: string | null) => void;

  addNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, input: Partial<CreateNoteInput>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  moveNote: (noteId: string, folderId: string | null) => Promise<void>;

  fetchFolders: () => Promise<void>;
  addFolder: (input: CreateFolderInput) => Promise<NoteFolder>;
  renameFolder: (id: string, name: string) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  folders: [],
  activeFolderId: null,
  isLoading: false,
  error: null,

  setActiveFolder: (id) => set({ activeFolderId: id }),

  fetchAllNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const [notes, folders] = await Promise.all([noteService.getAll(), noteService.getAllFolders()]);
      set({ notes, folders, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchRecentNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteService.getRecent();
      set({ notes, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addNote: async (input) => {
    try {
      const note = await noteService.create({
        ...input,
        folder_id: input.folder_id ?? get().activeFolderId,
      });
      set((state) => ({ notes: [note, ...state.notes] }));
      return note;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateNote: async (id, input) => {
    const prev = get().notes;
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...input, updated_at: new Date().toISOString() } : n
      ),
    }));
    try {
      await noteService.update(id, input);
    } catch (err) {
      set({ notes: prev, error: (err as Error).message });
    }
  },

  moveNote: async (noteId, folderId) => {
    set((state) => ({
      notes: state.notes.map((n) => n.id === noteId ? { ...n, folder_id: folderId } : n),
    }));
    await noteService.moveToFolder(noteId, folderId);
  },

  removeNote: async (id) => {
    const prev = get().notes;
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    try {
      await noteService.delete(id);
    } catch (err) {
      set({ notes: prev, error: (err as Error).message });
    }
  },

  fetchFolders: async () => {
    const folders = await noteService.getAllFolders();
    set({ folders });
  },

  addFolder: async (input) => {
    const folder = await noteService.createFolder(input);
    set((state) => ({ folders: [...state.folders, folder] }));
    return folder;
  },

  renameFolder: async (id, name) => {
    await noteService.renameFolder(id, name);
    set((state) => ({
      folders: state.folders.map((f) => f.id === id ? { ...f, name } : f),
    }));
  },

  removeFolder: async (id) => {
    await noteService.deleteFolder(id);
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      notes: state.notes.map((n) => n.folder_id === id ? { ...n, folder_id: null } : n),
      activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
    }));
  },
}));
