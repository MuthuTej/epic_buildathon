import React, { createContext, useContext, useState, useCallback } from 'react';
import { engineers, getEngineerById } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((engineerId) => {
    const e = getEngineerById(engineerId);
    if (e) setUser(e);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = {
    user,
    role: user ? user.role : null,
    isAuthenticated: !!user,
    engineers,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
