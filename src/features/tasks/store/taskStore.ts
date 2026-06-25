import { create } from "zustand";
import { Task, CreateTaskInput } from "../types/task";
import { taskService } from "../services/taskService";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  /** Loads every task (active and done) — the single source of truth.
   *  Consumers filter client-side for what they need (e.g. the dashboard
   *  only displays active ones). Previously this loaded only active tasks
   *  via getActive(), which meant the Tasks page's "Done" and "All" filter
   *  tabs could never actually show completed tasks. */
  fetchTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getAll();
      set({ tasks, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addTask: async (input) => {
    try {
      const task = await taskService.create(input);
      // Optimistic: prepend immediately, no re-fetch
      set((state) => ({ tasks: [task, ...state.tasks] }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === "done" ? "todo" : "done";

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    }));

    try {
      await taskService.updateStatus(id, newStatus);
    } catch (err) {
      // Revert on failure
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: task.status } : t)),
        error: (err as Error).message,
      }));
    }
  },

  removeTask: async (id) => {
    const prev = get().tasks;
    // Optimistic remove
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));

    try {
      await taskService.delete(id);
    } catch (err) {
      // Revert on failure
      set({ tasks: prev, error: (err as Error).message });
    }
  },
}));
