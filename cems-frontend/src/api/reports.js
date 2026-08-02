import apiClient from './client';

export const reportsApi = {
  getDashboardStats: () => apiClient.get('/reports/dashboard'),
};
