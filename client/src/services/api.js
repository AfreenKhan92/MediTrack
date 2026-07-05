import axios from 'axios';
import showToast from '../utils/toast';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add token to headers if present in localstorage
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized error and response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Automatically log out user if token expires or is unauthorized (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }

    // Standardize error message extraction
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const errors = error.response?.data?.errors || null;

    // Trigger error toast automatically unless explicitly skipped
    if (!error.config?.skipToast) {
      showToast.error(message);
    }

    const formattedError = new Error(message);
    formattedError.status = error.response?.status;
    formattedError.errors = errors;
    
    return Promise.reject(formattedError);
  }
);

export default api;
