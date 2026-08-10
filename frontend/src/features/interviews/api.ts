import apiClient from '../../lib/apiClient';

export const getInterviews = async (params?: any) => {
  const { data } = await apiClient.get('/interviews', { params });
  return data;
};

export const getInterview = async (id: string) => {
  const { data } = await apiClient.get(`/interviews/${id}`);
  return data.data;
};

export const createInterview = async (dto: any) => {
  const { data } = await apiClient.post('/interviews', dto);
  return data.data;
};

export const updateInterview = async (id: string, dto: any) => {
  const { data } = await apiClient.patch(`/interviews/${id}`, dto);
  return data.data;
};

export const deleteInterview = async (id: string) => {
  const { data } = await apiClient.delete(`/interviews/${id}`);
  return data.data;
};
