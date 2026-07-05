import api from './api';

export const vaccineService = {
  getVaccines: async (filters = {}) => {
    const { data } = await api.get('/vaccinations', { params: filters });
    return data;
  },

  getVaccineById: async (id) => {
    const { data } = await api.get(`/vaccinations/${id}`);
    return data;
  },

  createVaccine: async (vaccineData) => {
    const { data } = await api.post('/vaccinations', vaccineData);
    return data;
  },

  updateVaccine: async (id, vaccineData) => {
    const { data } = await api.put(`/vaccinations/${id}`, vaccineData);
    return data;
  },

  deleteVaccine: async (id) => {
    const { data } = await api.delete(`/vaccinations/${id}`);
    return data;
  },
};

export default vaccineService;
