import apiClient from '../../lib/apiClient';

export const getReminders = async (params?: any) => {
  const { data } = await apiClient.get('/reminders', { params });
  return data;
};

export const getReminder = async (id: string) => {
  const { data } = await apiClient.get(`/reminders/${id}`);
  return data.data;
};

export const createReminder = async (dto: any) => {
  const { data } = await apiClient.post('/reminders', dto);
  return data.data;
};

export const updateReminder = async (id: string, dto: any) => {
  const { data } = await apiClient.patch(`/reminders/${id}`, dto);
  return data.data;
};

export const deleteReminder = async (id: string) => {
  const { data } = await apiClient.delete(`/reminders/${id}`);
  return data.data;
};

export const completeReminder = async (id: string) => {
  const { data } = await apiClient.patch(`/reminders/${id}/complete`);
  return data.data;
};
