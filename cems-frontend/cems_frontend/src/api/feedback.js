import apiClient from './client';

export const feedbackApi = {
  submit: (eventId, data) => apiClient.post(`/events/${eventId}/feedback`, data),
  getForEvent: (eventId) => apiClient.get(`/events/${eventId}/feedback`),
  getAverageRating: (eventId) => apiClient.get(`/events/${eventId}/feedback/average`),
};
