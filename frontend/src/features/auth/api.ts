import apiClient from '../../lib/apiClient';

export const registerUser = async (dto: any) => {
  const { data } = await apiClient.post('/auth/register', dto);
  return data.data;
};

export const loginUser = async (dto: any) => {
  const { data } = await apiClient.post('/auth/login', dto);
  return data.data; // { accessToken, user }
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data.data;
};
