import axios from 'axios';

// W produkcji adres backendu MUSI być podany przez VITE_API_URL.
// W developmencie domyślnie korzystamy z proxy Vite ('/api').
const API_URL = import.meta.env.VITE_API_URL || '/api';

if (import.meta.env.MODE === 'production' && !import.meta.env.VITE_API_URL) {
  // Czytelne ostrzeżenie zamiast cichego zaszytego URL-a
  console.warn('VITE_API_URL nie jest ustawione – żądania API mogą nie działać w produkcji.');
}

const TOKEN_KEY = 'bks_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Dołącz token do każdego żądania
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Globalna obsługa błędów + automatyczne wylogowanie przy 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      // Przeładuj do ekranu logowania (HashRouter)
      if (typeof window !== 'undefined' && !window.location.hash.includes('/login')) {
        window.location.hash = '#/login';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
