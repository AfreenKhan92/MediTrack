import api from './api';

export const timelineService = {
  getTimeline: async () => {
    const { data } = await api.get('/timeline');
    return data;
  },
};

export default timelineService;
