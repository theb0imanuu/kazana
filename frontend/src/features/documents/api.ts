import apiClient from '../../lib/apiClient';

export const getDocuments = async () => {
  const { data } = await apiClient.get('/documents');
  return data;
};

export const getDocument = async (id: string) => {
  const { data } = await apiClient.get(`/documents/${id}`);
  return data.data;
};

export const deleteDocument = async (id: string) => {
  const { data } = await apiClient.delete(`/documents/${id}`);
  return data.data;
};

export const toggleDefaultDocument = async (id: string) => {
  const { data } = await apiClient.patch(`/documents/${id}/default`);
  return data.data;
};

export const uploadDocument = async (formData: FormData, onProgress?: (progress: number) => void) => {
  const { data } = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return data.data;
};
