import apiClient from './client';

export const venuesApi = {
  create: (data) => apiClient.post('/venues', data),
  update: (id, data) => apiClient.put(`/venues/${id}`, data),
  deactivate: (id) => apiClient.delete(`/venues/${id}`),
  getById: (id) => apiClient.get(`/venues/${id}`),
  getAllActive: () => apiClient.get('/venues/public/active'),
  getAvailable: (start, end) =>
    apiClient.get('/venues/available', { params: { start, end } }),
};
