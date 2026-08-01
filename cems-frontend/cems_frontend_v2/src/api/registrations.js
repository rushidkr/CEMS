import apiClient from './client';

export const registrationsApi = {
  register: (eventId) => apiClient.post(`/events/${eventId}/register`),
  cancel: (eventId) => apiClient.delete(`/events/${eventId}/register`),
  checkIn: (eventId, studentId) =>
    apiClient.patch(`/events/${eventId}/check-in/${studentId}`),
  getForStudent: (studentId, params) =>
    apiClient.get(`/students/${studentId}/registrations`, { params }),
  getForEvent: (eventId) => apiClient.get(`/events/${eventId}/registrations`),
  downloadTicketPdf: async (registrationId) => {
    const response = await apiClient.get(`/registrations/${registrationId}/ticket`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `event_ticket_${registrationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

