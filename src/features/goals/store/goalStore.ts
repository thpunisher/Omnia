import { create } from "zustand";
import { Goal, CreateGoalInput } from "../types/goal";
import { goalService } from "../services/goalService";

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  addGoal: (input: CreateGoalInput) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await goalService.getAll();
      set({ goals, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addGoal: async (input) => {
    try {
      await goalService.create(input);
      const goals = await goalService.getAll();
      set({ goals });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateGoalProgress: async (id, progress) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;

    const clamped = Math.max(0, progress);
    const status: typeof goal.status = clamped >= goal.target ? "completed" : "active";

    // Optimistic update
    const prev = get().goals;
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, progress: clamped, status } : g)),
    }));
    try {
      await goalService.updateProgress(id, clamped, status);
    } catch (err) {
      set({ goals: prev, error: (err as Error).message });
    }
  },

  removeGoal: async (id) => {
    const prev = get().goals;
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    try {
      await goalService.delete(id);
    } catch (err) {
      set({ goals: prev, error: (err as Error).message });
    }
  },
}));
