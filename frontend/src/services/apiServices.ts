import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
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

export const login = async (credentials: { email: string; phone: string; password: string }) => {
  // Login endpoint uses a different port (4501)
  const authApi = axios.create({
    baseURL: 'http://localhost:4501/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const response = await authApi.post('/auth/login', credentials);
  return response.data;
};

