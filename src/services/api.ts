import axios from 'axios';

/**
 * API Base URL configuration:
 *
 * In development:
 *   - If VITE_API_BASE_URL is set, API calls go directly to that URL
 *   - If VITE_API_BASE_URL is empty, the Vite dev server proxy handles /api → localhost:8080
 *
 * In production (Vercel, Netlify, Docker, etc.):
 *   - Set VITE_API_BASE_URL to your deployed backend URL (e.g. https://api.your-domain.com)
 *   - If not set, /api is resolved relative to the same origin where the frontend is served,
 *     which requires a reverse proxy (Nginx, Vercel rewrites, etc.) to forward /api requests
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('neobank_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('neobank_token');
      localStorage.removeItem('neobank_user');
      // Only redirect if not already on login page to avoid redirect loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
