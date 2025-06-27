import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('[API] baseURL utilisé :', baseURL);

const api = axios.create({
  baseURL
});

// Intercepteur pour logger les requêtes
api.interceptors.request.use((config) => {
  console.log(`[API][REQUEST] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
  if (config.headers) {
    console.log('[API][REQUEST][headers]:', config.headers);
  }
  if (config.data) {
    console.log('[API][REQUEST][data]:', config.data);
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[API][REQUEST][ERROR]', error);
  return Promise.reject(error);
});

// Intercepteur pour logger les réponses
api.interceptors.response.use((response) => {
  console.log(`[API][RESPONSE] ${response.status} ${response.config.baseURL || ''}${response.config.url}`);
  console.log('[API][RESPONSE][data]:', response.data);
  return response;
}, (error) => {
  if (error.response) {
    console.error(`[API][ERROR] ${error.response.status} ${error.response.config.baseURL || ''}${error.response.config.url}`);
    console.error('[API][ERROR][data]:', error.response.data);
  } else if (error.request) {
    console.error('[API][ERROR][NO RESPONSE]', error.request);
  } else {
    console.error('[API][ERROR][SETUP]', error.message);
  }
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    window.location = '/connexion';
  }
  return Promise.reject(error);
});

export default api;