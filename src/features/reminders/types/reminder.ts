export interface Reminder {
  id: string;
  title: string;
  due_date: string;
  completed: number;
  created_at: string;
}

export type CreateReminderInput = Omit<Reminder, 'id' | 'created_at' | 'completed'>;
