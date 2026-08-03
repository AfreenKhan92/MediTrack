import api from './api';

export const emergencyContactService = {
  getContacts: async () => {
    const { data } = await api.get('/emergency-contacts');
    return data;
  },

  getContactById: async (id) => {
    const { data } = await api.get(`/emergency-contacts/${id}`);
    return data;
  },

  createContact: async (contactData) => {
    const { data } = await api.post('/emergency-contacts', contactData);
    return data;
  },

  updateContact: async (id, contactData) => {
    const { data } = await api.put(`/emergency-contacts/${id}`, contactData);
    return data;
  },

  deleteContact: async (id) => {
    const { data } = await api.delete(`/emergency-contacts/${id}`);
    return data;
  },
};

export default emergencyContactService;
