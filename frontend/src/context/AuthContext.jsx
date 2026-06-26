import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getToken, setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Przy starcie: jeśli mamy token, pobierz dane użytkownika
  useEffect(() => {
    let aktywne = true;
    async function init() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (aktywne) setUser(res.data);
      } catch {
        clearToken();
      } finally {
        if (aktywne) setLoading(false);
      }
    }
    init();
    return () => {
      aktywne = false;
    };
  }, []);

  const login = useCallback(async (email, haslo) => {
    const res = await api.post('/auth/login', { email, haslo });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (...role) => !!user && role.includes(user.rola),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth musi być użyte wewnątrz <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
