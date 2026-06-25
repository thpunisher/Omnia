export interface Habit {
  id: string;
  title: string;
  frequency: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: number;
}

export type CreateHabitInput = Omit<Habit, 'id' | 'created_at'>;
