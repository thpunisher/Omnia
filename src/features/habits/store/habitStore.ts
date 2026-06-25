import { create } from "zustand";
import { Habit, CreateHabitInput, HabitLog } from "../types/habit";
import { habitService } from "../services/habitService";
import { isSameDay } from "date-fns";

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (input: CreateHabitInput) => Promise<void>;
  toggleToday: (habitId: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  isDoneToday: (habitId: string) => boolean;
  getStreak: (habitId: string) => number;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const [habits, logs] = await Promise.all([habitService.getAll(), habitService.getAllLogs()]);
      set({ habits, logs, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addHabit: async (input) => {
    try {
      await habitService.create(input);
      const habits = await habitService.getAll();
      set({ habits });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  toggleToday: async (habitId) => {
    const today = new Date();
    const alreadyDone = get().isDoneToday(habitId);

    if (alreadyDone) {
      // Optimistic: drop today's log(s) for this habit locally, then persist.
      const prevLogs = get().logs;
      set((state) => ({
        logs: state.logs.filter((l) => !(l.habit_id === habitId && isSameDay(new Date(l.date), today))),
      }));
      try {
        await habitService.unlogToday(habitId, today.toISOString());
      } catch (err) {
        set({ logs: prevLogs, error: (err as Error).message });
      }
    } else {
      const optimisticLog: HabitLog = { id: `pending-${Date.now()}`, habit_id: habitId, date: today.toISOString(), completed: 1 };
      set((state) => ({ logs: [optimisticLog, ...state.logs] }));
      try {
        const log = await habitService.logCompletion(habitId, today.toISOString());
        set((state) => ({ logs: state.logs.map((l) => (l.id === optimisticLog.id ? log : l)) }));
      } catch (err) {
        set((state) => ({ logs: state.logs.filter((l) => l.id !== optimisticLog.id), error: (err as Error).message }));
      }
    }
  },

  removeHabit: async (id) => {
    const prevHabits = get().habits;
    const prevLogs = get().logs;
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      logs: state.logs.filter((l) => l.habit_id !== id),
    }));
    try {
      await habitService.delete(id);
    } catch (err) {
      set({ habits: prevHabits, logs: prevLogs, error: (err as Error).message });
    }
  },

  isDoneToday: (habitId) => {
    const today = new Date();
    return get().logs.some((l) => l.habit_id === habitId && isSameDay(new Date(l.date), today));
  },

  /** Consecutive-day streak ending today (or yesterday, if today isn't logged yet). */
  getStreak: (habitId) => {
    const dates = get()
      .logs.filter((l) => l.habit_id === habitId)
      .map((l) => new Date(l.date).toDateString());
    const uniqueDays = Array.from(new Set(dates)).map((d) => new Date(d));
    uniqueDays.sort((a, b) => b.getTime() - a.getTime());

    if (uniqueDays.length === 0) return 0;

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    // If today isn't logged, the streak can still count from yesterday backward.
    const hasToday = uniqueDays.some((d) => isSameDay(d, cursor));
    if (!hasToday) cursor.setDate(cursor.getDate() - 1);

    for (const day of uniqueDays) {
      if (isSameDay(day, cursor)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (day.getTime() < cursor.getTime()) {
        break;
      }
    }
    return streak;
  },
}));
