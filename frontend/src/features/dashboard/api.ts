import apiClient from '../../lib/apiClient';

export const getDashboardStats = async () => {
  const { data } = await apiClient.get('/analytics/dashboard');
  return data.data;
};
