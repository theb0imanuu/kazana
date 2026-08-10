import apiClient from '../../lib/apiClient';

export const getProfile = async () => {
  const { data } = await apiClient.get('/users/profile');
  return data.data;
};

export const updateProfile = async (dto: any) => {
  const { data } = await apiClient.patch('/users/profile', dto);
  return data.data;
};

export const changePassword = async (dto: any) => {
  const { data } = await apiClient.post('/users/profile/password', dto);
  return data.data;
};
