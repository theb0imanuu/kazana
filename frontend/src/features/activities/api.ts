import apiClient from '../../lib/apiClient';

export const getActivities = async () => {
  const { data } = await apiClient.get('/activities');
  return data;
};

export const getJobActivities = async (jobId: string) => {
  const { data } = await apiClient.get(`/jobs/${jobId}/activities`);
  return data;
};

export const createNoteActivity = async (dto: any) => {
  const { data } = await apiClient.post('/activities/notes', dto);
  return data.data;
};
