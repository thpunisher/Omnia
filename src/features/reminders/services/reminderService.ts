import { query, execute } from "@/shared/services/db";
import { Reminder, CreateReminderInput } from "../types/reminder";
import { v4 as uuidv4 } from "uuid";

export const reminderService = {
  /** Returns all reminders (both active and completed) — the page itself
   *  decides how to group/display them. Previously this hardcoded a
   *  WHERE completed = 0 filter, which silently hid every completed
   *  reminder from the UI permanently after the next fetch/reload. */
  getAll: async (): Promise<Reminder[]> =>
    query<Reminder>("SELECT * FROM reminders ORDER BY due_date ASC"),

  create: async (input: CreateReminderInput): Promise<string> => {
    const id = uuidv4();
    await execute(
      "INSERT INTO reminders (id, title, due_date) VALUES (?, ?, ?)",
      [id, input.title, input.due_date]
    );
    return id;
  },

  toggleComplete: async (id: string, completed: number): Promise<void> => {
    await execute("UPDATE reminders SET completed = ? WHERE id = ?", [completed, id]);
  },

  delete: async (id: string): Promise<void> => {
    await execute("DELETE FROM reminders WHERE id = ?", [id]);
  },
};
