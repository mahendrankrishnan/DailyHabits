import axios from 'axios';
import { LoginCredentials, LoginResponse } from '../types';

const AUTH_TOKEN_KEY = 'authToken';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_API_BASE_URL = 'http://localhost:4501/api';
const AUTH_LOGIN_URL = `${AUTH_API_BASE_URL}/auth/login`;

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function createAuthError(status: number, data: unknown): Error & {
  response?: { status: number; data: Record<string, string> };
} {
  const body =
    data && typeof data === 'object'
      ? (data as Record<string, string>)
      : {};
  const message =
    body.error ||
    body.message ||
    (status === 401
      ? 'Invalid email, password, or phone number.'
      : `Login failed (${status}).`);

  const error = new Error(message) as Error & {
    response?: { status: number; data: Record<string, string> };
  };
  error.response = { status, data: body };
  return error;
}

const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function clearAuthSession(): void {
  setAuthToken(null);
}

authApi.interceptors.request.use((config) => {
  const path = config.url ?? '';
  const isPublicAuthRoute =
    path.includes('/auth/login') || path.includes('/auth/register');

  if (isPublicAuthRoute) {
    delete config.headers.Authorization;
    return config;
  }

  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getHabits = async (search?: string) => {
  const params = search ? { search } : {};
  const response = await api.get('/habits', { params });
  return response.data;
};

export const getHabit = async (id: number) => {
  const response = await api.get(`/habits/${id}`);
  return response.data;
};

export const createHabit = async (habit: { name: string; description?: string; color?: string }) => {
  const response = await api.post('/habits', habit);
  return response.data;
};

export const updateHabit = async (id: number, habit: { name?: string; description?: string; color?: string }) => {
  const response = await api.put(`/habits/${id}`, habit);
  return response.data;
};

export const deleteHabit = async (id: number) => {
  await api.delete(`/habits/${id}`);
};

export const getHabitLogs = async (habitId: number) => {
  const response = await api.get(`/habits/${habitId}/logs`);
  return response.data;
};

export const logHabit = async (habitId: number, log: { date: string; completed: boolean; notes?: string }) => {
  const response = await api.post(`/habits/${habitId}/logs`, log);
  return response.data;
};

export const askAI = async (question: string) => {
  const response = await api.post('/ai/ask', { question });
  return response.data;
};

export const getAIInsights = async (startDate?: string, endDate?: string) => {
  const params = startDate && endDate ? { startDate, endDate } : {};
  const response = await api.get('/ai/insights', { params });
  return response.data;
};

export const getPredefinedHabits = async () => {
  const response = await api.get('/predefined-habits');
  return response.data;
};

export const getLogsForDateRange = async (startDate: string, endDate: string) => {
  const response = await api.get('/logs', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  clearAuthSession();

  const payload = {
    email: credentials.email.trim(),
    phone: normalizePhone(credentials.phone),
    password: credentials.password,
  };

  const response = await fetch(AUTH_LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as LoginResponse &
    Record<string, string>;

  if (!response.ok) {
    throw createAuthError(response.status, data);
  }

  if (data.token) {
    setAuthToken(data.token);
  }

  return data;
};

export const getUserApplicationsRoles = async (userId: number, token?: string) => {
  const authToken = token ?? getAuthToken();
  const response = await authApi.get(`/users/${userId}/applications-roles`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });
  return response.data;
};

