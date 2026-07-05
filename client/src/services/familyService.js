import api from './api';

export const familyService = {
  getMembers: async () => {
    const { data } = await api.get('/family');
    return data;
  },

  getMemberById: async (id) => {
    const { data } = await api.get(`/family/${id}`);
    return data;
  },

  createMember: async (memberData) => {
    const { data } = await api.post('/family', memberData);
    return data;
  },

  updateMember: async (id, memberData) => {
    const { data } = await api.put(`/family/${id}`, memberData);
    return data;
  },

  deleteMember: async (id) => {
    const { data } = await api.delete(`/family/${id}`);
    return data;
  },
};

export default familyService;
