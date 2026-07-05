import api from './api';

export const reportService = {
  getReports: async () => {
    const { data } = await api.get('/reports');
    return data;
  },

  uploadReport: async (formData) => {
    const { data } = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteReport: async (id) => {
    const { data } = await api.delete(`/reports/${id}`);
    return data;
  },
};

export default reportService;
