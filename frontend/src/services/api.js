import axios from 'axios';

// Automatyczne wykrywanie środowiska
const API_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.MODE === 'production' 
                  ? 'https://heartfelt-adaptation-production.up.railway.app/api'
                  : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dodaj interceptor dla logowania błędów
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
