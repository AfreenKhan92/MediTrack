import api from './api';

export const reminderService = {
  getReminders: async (filters = {}) => {
    const { data } = await api.get('/reminders', { params: filters });
    return data;
  },

  getReminderById: async (id) => {
    const { data } = await api.get(`/reminders/${id}`);
    return data;
  },

  createReminder: async (reminderData) => {
    const { data } = await api.post('/reminders', reminderData);
    return data;
  },

  updateReminder: async (id, reminderData) => {
    const { data } = await api.put(`/reminders/${id}`, reminderData);
    return data;
  },

  deleteReminder: async (id) => {
    const { data } = await api.delete(`/reminders/${id}`);
    return data;
  },
};

export default reminderService;
