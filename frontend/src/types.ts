export interface Habit {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
  notes: string | null;
  createdAt: string;
}

export interface HabitWithLogs extends Habit {
  todayLog?: HabitLog;
}

