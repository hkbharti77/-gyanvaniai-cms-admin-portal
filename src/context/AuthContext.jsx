import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from server cookie on load
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      // Initiate CSRF handshake
      await api.getCsrf().catch(() => {});
      const data = await api.getMe();
      setUser(data.user);
      setError(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    const data = await api.login({ email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API notice:', err);
    } finally {
      setUser(null);
    }
  };

  const hasPermission = useCallback((permissionKey) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permissionKey);
  }, [user]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    hasPermission,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
