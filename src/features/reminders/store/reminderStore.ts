import { create } from "zustand";
import { Reminder, CreateReminderInput } from "../types/reminder";
import { reminderService } from "../services/reminderService";

interface ReminderState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  fetchReminders: () => Promise<void>;
  addReminder: (input: CreateReminderInput) => Promise<void>;
  toggleReminder: (id: string, completed: number) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  isLoading: false,
  error: null,

  fetchReminders: async () => {
    set({ isLoading: true, error: null });
    try {
      const reminders = await reminderService.getAll();
      set({ reminders, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addReminder: async (input) => {
    try {
      await reminderService.create(input);
      const reminders = await reminderService.getAll();
      set({ reminders });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  toggleReminder: async (id, completed) => {
    const prev = get().reminders;
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, completed } : r
      ),
    }));
    try {
      await reminderService.toggleComplete(id, completed);
    } catch (err) {
      set({ reminders: prev, error: (err as Error).message });
    }
  },

  removeReminder: async (id) => {
    const prev = get().reminders;
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
    try {
      await reminderService.delete(id);
    } catch (err) {
      set({ reminders: prev, error: (err as Error).message });
    }
  },
}));
