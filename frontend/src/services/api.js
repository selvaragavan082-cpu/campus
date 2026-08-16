import axios from 'axios';

// Smart URL resolver ensuring proper /api suffix without double slashes
export const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL;

  // If running locally without explicit VITE_API_URL, use local /api proxy
  if (!envUrl) {
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return '/api';
    }
    // Default fallback to Render backend
    envUrl = 'https://campus-swp1.onrender.com';
  }

  let clean = envUrl.trim().replace(/\/+$/, '');

  // If clean is simply '/api', return it as-is for local dev proxy
  if (clean === '/api') return '/api';

  // Ensure /api suffix exists on absolute URLs
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  return clean;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Avoid preflight issues with wildcard CORS
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiry & clean error parsing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        localStorage.removeItem('campus_token');
        localStorage.removeItem('campus_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUsers: (params) => api.get('/auth/users', { params }),
};

// Announcement Services
export const announcementService = {
  getAll: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Event Services
export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Resource Services
export const resourceService = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  upload: (formData) =>
    api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/resources/${id}`),
  trackDownload: (id) => api.post(`/resources/${id}/download`),
};

// Timetable Services
export const timetableService = {
  get: (params) => api.get('/timetable', { params }),
  save: (data) => api.post('/timetable', data),
  getFacultySchedule: () => api.get('/timetable/faculty/my-schedule'),
};

// Stats Services
export const statsService = {
  getAdminStats: () => api.get('/stats/admin'),
  getStaffStats: () => api.get('/stats/staff'),
  getStudentStats: () => api.get('/stats/student'),
};

// AI Chat Services
export const aiService = {
  askAI: (data) => api.post('/ai/ask', data),
};

export default api;
