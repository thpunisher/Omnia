import { query, execute } from "@/shared/services/db";
import { Task, CreateTaskInput } from "../types/task";
import { v4 as uuidv4 } from "uuid";

export const taskService = {
  /** All tasks, incomplete ones first (by priority), completed ones last. */
  getAll: async (): Promise<Task[]> =>
    query<Task>(
      `SELECT * FROM tasks ORDER BY
         CASE WHEN status = 'done' THEN 1 ELSE 0 END,
         CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
         created_at DESC`
    ),

  create: async (input: CreateTaskInput): Promise<Task> => {
    const id = uuidv4();
    await execute(
      "INSERT INTO tasks (id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)",
      [id, input.title, input.description, input.status, input.priority, input.due_date]
    );
    return { ...input, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  },

  updateStatus: async (id: string, status: Task["status"]): Promise<void> =>
    execute("UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]),

  delete: async (id: string): Promise<void> =>
    execute("DELETE FROM tasks WHERE id = ?", [id]),
};
