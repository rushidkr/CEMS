import apiClient from './client';

export const eventsApi = {
  create: (data) => apiClient.post('/events', data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  approve: (id) => apiClient.patch(`/events/${id}/approve`),
  reject: (id, reason) => apiClient.patch(`/events/${id}/reject`, { reason }),
  cancel: (id) => apiClient.patch(`/events/${id}/cancel`),
  getById: (id) => apiClient.get(`/events/${id}`),
  getUpcoming: (params) => apiClient.get('/events/public/upcoming', { params }),
  getByOrganizer: (organizerId, params) =>
    apiClient.get(`/events/organizer/${organizerId}`, { params }),
  getByStatus: (status, params) => apiClient.get(`/events/status/${status}`, { params }),
  downloadAttendeesPdf: async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/export-attendees`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendees_event_${eventId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

