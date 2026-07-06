import axios from 'axios';

export const TOKEN_KEY = 'tht_token';

// Cliente HTTP centralizado. baseURL /api → proxy de Vite hacia el backend (:4000).
const client = axios.create({
  baseURL: '/api',
});

// Interceptor de request: añade el JWT si existe.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: ante 401 limpia el token y redirige a /login.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default client;
