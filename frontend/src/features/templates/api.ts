import apiClient from '../../lib/apiClient';

export const getTemplates = async () => {
  const { data } = await apiClient.get('/templates');
  return data;
};

export const getTemplate = async (id: string) => {
  const { data } = await apiClient.get(`/templates/${id}`);
  return data.data;
};

export const createTemplate = async (dto: any) => {
  const { data } = await apiClient.post('/templates', dto);
  return data.data;
};

export const updateTemplate = async (id: string, dto: any) => {
  const { data } = await apiClient.patch(`/templates/${id}`, dto);
  return data.data;
};

export const deleteTemplate = async (id: string) => {
  const { data } = await apiClient.delete(`/templates/${id}`);
  return data.data;
};
