import apiClient from '../../lib/apiClient';

export const getContacts = async () => {
  const { data } = await apiClient.get('/contacts');
  return data;
};

export const getContact = async (id: string) => {
  const { data } = await apiClient.get(`/contacts/${id}`);
  return data.data;
};

export const createContact = async (dto: any) => {
  const { data } = await apiClient.post('/contacts', dto);
  return data.data;
};

export const updateContact = async (id: string, dto: any) => {
  const { data } = await apiClient.patch(`/contacts/${id}`, dto);
  return data.data;
};

export const deleteContact = async (id: string) => {
  const { data } = await apiClient.delete(`/contacts/${id}`);
  return data.data;
};
