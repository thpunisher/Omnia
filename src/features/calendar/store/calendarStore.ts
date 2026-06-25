import { create } from "zustand";
import { CalendarEvent, CreateEventInput } from "../types/event";
import { eventService } from "../services/eventService";

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  addEvent: (input: CreateEventInput) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventService.getAll();
      set({ events, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addEvent: async (input) => {
    try {
      const id = await eventService.create(input);
      set((state) => ({ events: [...state.events, { ...input, id }] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeEvent: async (id) => {
    const prev = get().events;
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    try {
      await eventService.delete(id);
    } catch (error) {
      set({ events: prev, error: (error as Error).message });
    }
  },
}));
