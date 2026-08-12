import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle token expiry or invalidation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && (error.response.status === 401 || error.response.status === 403)) {
      // If the error comes from an auth route, let authContext handle it
      if (!error.config?.url?.includes('/auth/me')) {
        // Do not aggressively wipe unless unauthenticated
      }
    }
    return Promise.reject(error);
  }
);

export default api;
