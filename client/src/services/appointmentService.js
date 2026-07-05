import api from './api';

export const appointmentService = {
  getAppointments: async (filters = {}) => {
    const { data } = await api.get('/appointments', { params: filters });
    return data;
  },

  getAppointmentById: async (id) => {
    const { data } = await api.get(`/appointments/${id}`);
    return data;
  },

  createAppointment: async (appointmentData) => {
    const { data } = await api.post('/appointments', appointmentData);
    return data;
  },

  updateAppointment: async (id, appointmentData) => {
    const { data } = await api.put(`/appointments/${id}`, appointmentData);
    return data;
  },

  deleteAppointment: async (id) => {
    const { data } = await api.delete(`/appointments/${id}`);
    return data;
  },
};

export default appointmentService;
