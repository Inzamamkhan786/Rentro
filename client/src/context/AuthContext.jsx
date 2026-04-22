import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('rentora_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('rentora_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      authAPI.getProfile().then(res => {
        setUser(res.data);
        localStorage.setItem('rentora_user', JSON.stringify(res.data));
      }).catch(() => logout());
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { user: u, token: t } = res.data;
      setUser(u); setToken(t);
      localStorage.setItem('rentora_token', t);
      localStorage.setItem('rentora_user', JSON.stringify(u));
      return u;
    } finally { setLoading(false); }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      const { user: u, token: t } = res.data;
      setUser(u); setToken(t);
      localStorage.setItem('rentora_token', t);
      localStorage.setItem('rentora_user', JSON.stringify(u));
      return u;
    } finally { setLoading(false); }
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('rentora_token');
    localStorage.removeItem('rentora_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
