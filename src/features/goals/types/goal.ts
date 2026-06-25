export interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export type CreateGoalInput = Omit<Goal, 'id' | 'created_at'>;
