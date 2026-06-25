import { query, execute } from "@/shared/services/db";
import { CalendarEvent, CreateEventInput } from "../types/event";
import { v4 as uuidv4 } from "uuid";

export const eventService = {
  getAll: async (): Promise<CalendarEvent[]> => {
    return await query<CalendarEvent>("SELECT * FROM events ORDER BY start_date ASC");
  },

  create: async (input: CreateEventInput): Promise<string> => {
    const id = uuidv4();
    await execute(
      "INSERT INTO events (id, title, start_date, end_date, location, description) VALUES (?, ?, ?, ?, ?, ?)",
      [id, input.title, input.start_date, input.end_date, input.location, input.description]
    );
    return id;
  },

  delete: async (id: string): Promise<void> => {
    await execute("DELETE FROM events WHERE id = ?", [id]);
  }
};
