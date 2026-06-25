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

export interface AuthRole {
  id: number;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthApplication {
  id: number;
  appName: string;
  createdAt: string;
  updatedAt: string;
  roles: AuthRole[];
}

export interface UserApplicationsRoles {
  userId: number;
  applications: AuthApplication[];
}

export interface LoginCredentials {
  email: string;
  phone: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  phone: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
  applications?: AuthApplication[];
}

export interface AIInsights {
  period: { startDate: string; endDate: string };
  metrics: {
    habitsCount: number;
    logsCount: number;
    completedCount: number;
    overallCompletionRate: number;
    bestHabit: { id: number; name: string; completionRate: number } | null;
    needsAttentionHabit: { id: number; name: string; completionRate: number } | null;
  };
  narrative: string;
}

