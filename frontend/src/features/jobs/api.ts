import apiClient from '../../lib/apiClient';

export const getJobs = async (params?: any) => {
  const { data } = await apiClient.get('/jobs', { params });
  return data; // Returns { data: Job[], meta: Pagination }
};

export const getJob = async (id: string) => {
  const { data } = await apiClient.get(`/jobs/${id}`);
  return data.data;
};

export const createJob = async (dto: any) => {
  const { data } = await apiClient.post('/jobs', dto);
  return data.data;
};

export const updateJob = async (id: string, dto: any) => {
  const { data } = await apiClient.patch(`/jobs/${id}`, dto);
  return data.data;
};

export const deleteJob = async (id: string) => {
  const { data } = await apiClient.delete(`/jobs/${id}`);
  return data.data;
};
