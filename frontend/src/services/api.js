import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor (FIXED)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // 🚫 Skip token for login & register
    const isAuthRoute =
      config.url.includes('/auth/login') ||
      config.url.includes('/auth/register');

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (IMPROVED)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, config } = error.response;

      // 🚫 Don't logout on login/register failure
      const isAuthRoute =
        config.url.includes('/auth/login') ||
        config.url.includes('/auth/register');

      if (status === 401 && !isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect only if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;