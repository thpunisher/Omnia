import { query, execute } from "@/shared/services/db";
import { Habit, CreateHabitInput, HabitLog } from "../types/habit";
import { v4 as uuidv4 } from "uuid";

export const habitService = {
  getAll: async (): Promise<Habit[]> =>
    query<Habit>("SELECT * FROM habits ORDER BY created_at DESC"),

  getAllLogs: async (): Promise<HabitLog[]> =>
    query<HabitLog>("SELECT * FROM habit_logs ORDER BY date DESC"),

  create: async (input: CreateHabitInput): Promise<string> => {
    const id = uuidv4();
    await execute(
      "INSERT INTO habits (id, title, frequency) VALUES (?, ?, ?)",
      [id, input.title, input.frequency]
    );
    return id;
  },

  logCompletion: async (habit_id: string, date: string): Promise<HabitLog> => {
    const id = uuidv4();
    await execute(
      "INSERT INTO habit_logs (id, habit_id, date, completed) VALUES (?, ?, ?, 1)",
      [id, habit_id, date]
    );
    return { id, habit_id, date, completed: 1 };
  },

  /** Removes today's check-in for a habit, used to let users undo a check-in. */
  unlogToday: async (habit_id: string, isoDay: string): Promise<void> => {
    await execute(
      "DELETE FROM habit_logs WHERE habit_id = ? AND date(date) = date(?)",
      [habit_id, isoDay]
    );
  },

  delete: async (id: string): Promise<void> => {
    await execute("DELETE FROM habits WHERE id = ?", [id]);
    await execute("DELETE FROM habit_logs WHERE habit_id = ?", [id]);
  },
};
