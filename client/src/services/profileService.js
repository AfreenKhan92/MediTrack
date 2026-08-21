import api from './api';

export const profileService = {
  getProfile: async () => {
    const { data } = await api.get('/profile');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/profile', profileData);
    return data;
  },

  changePassword: async (passwordData) => {
    const { data } = await api.put('/auth/change-password', passwordData);
    return data;
  },
};

export default profileService;
