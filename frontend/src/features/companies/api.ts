import apiClient from '../../lib/apiClient';

export const getCompanies = async (params?: any) => {
  const { data } = await apiClient.get('/companies', { params });
  return data; // Returns { data: Company[], meta: Pagination }
};

export const getCompany = async (id: string) => {
  const { data } = await apiClient.get(`/companies/${id}`);
  return data.data;
};

export const createCompany = async (dto: any) => {
  const { data } = await apiClient.post('/companies', dto);
  return data.data;
};

export const updateCompany = async (id: string, dto: any) => {
  const { data } = await apiClient.patch(`/companies/${id}`, dto);
  return data.data;
};

export const deleteCompany = async (id: string) => {
  const { data } = await apiClient.delete(`/companies/${id}`);
  return data.data;
};
