import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach JWT token (user or delivery partner) on every request
api.interceptors.request.use((config) => {
  const isDelivery = config.url?.startsWith('/api/delivery');
  const token = isDelivery
    ? (localStorage.getItem('delivery_token') || localStorage.getItem('token'))
    : localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isDeliveryUrl = window.location.pathname.startsWith('/delivery');
      if (isDeliveryUrl) {
        localStorage.removeItem('delivery_token');
        localStorage.removeItem('delivery_partner');
        if (window.location.pathname !== '/delivery/login') {
          window.location.href = '/delivery/login';
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
