import { query, execute } from "@/shared/services/db";
import { Goal, CreateGoalInput } from "../types/goal";
import { v4 as uuidv4 } from "uuid";

export const goalService = {
  getAll: async (): Promise<Goal[]> =>
    query<Goal>("SELECT * FROM goals ORDER BY created_at DESC"),

  create: async (input: CreateGoalInput): Promise<string> => {
    const id = uuidv4();
    await execute(
      "INSERT INTO goals (id, title, progress, target, status) VALUES (?, ?, ?, ?, ?)",
      [id, input.title, input.progress, input.target, input.status]
    );
    return id;
  },

  /** Updates progress and recomputes status (active → completed) in one write. */
  updateProgress: async (id: string, progress: number, status: Goal["status"]): Promise<void> => {
    await execute("UPDATE goals SET progress = ?, status = ? WHERE id = ?", [progress, status, id]);
  },

  delete: async (id: string): Promise<void> => {
    await execute("DELETE FROM goals WHERE id = ?", [id]);
  },
};
