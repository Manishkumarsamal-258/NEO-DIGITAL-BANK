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
 *
 * Demo mode (VITE_DEMO_MODE=true):
 *   - No backend needed! All API calls are intercepted and served from localStorage mock data.
 *   - Works on Vercel, Netlify, or any static host with zero backend configuration.
 *   - Login with seed credentials: alice@neobank.com / password123, admin@neobank.com / admin123
 */
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
// When VITE_API_BASE_URL is set (production), append /api to match backend controller paths.
// In development without VITE_API_BASE_URL, the Vite proxy handles /api → localhost:8080.
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = VITE_API_BASE_URL ? `${VITE_API_BASE_URL.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

import { mockAdapter } from './mockAdapter';

// ── Demo Mode: Mock Adapter ──────────────────────────────
// When VITE_DEMO_MODE=true, all API calls are handled entirely in the browser
// using localStorage data seeded from src/lib/mockData.ts.
//
// Vite inlines import.meta.env at build time, so when VITE_DEMO_MODE=false,
// this entire block is tree-shaken and mockAdapter.ts is excluded from the bundle.

if (DEMO_MODE) {
  api.defaults.adapter = mockAdapter;
}

// ── Request Interceptor: Attach JWT ───────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('neobank_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Handle Auth Errors ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('neobank_token');
      localStorage.removeItem('neobank_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
