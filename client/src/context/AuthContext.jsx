import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('earnflow_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount or token change
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setWallet(null);
        setLoading(false);
        return;
      }

      try {
        const data = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          setWallet(data.wallet);
          setUnreadNotifications(data.unreadNotifications || 0);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Failed to load authenticated user:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('earnflow_token', data.token);
      setToken(data.token);
      setUser(data.user);
      // Fetch me to populate wallet
      try {
        const meData = await api.get('/auth/me');
        if (meData.success) {
          setWallet(meData.wallet);
          setUnreadNotifications(meData.unreadNotifications || 0);
        }
      } catch (e) {}
    }
    return data;
  };

  const register = async (formData) => {
    const data = await api.post('/auth/register', formData);
    if (data.success && data.token) {
      localStorage.setItem('earnflow_token', data.token);
      setToken(data.token);
      setUser(data.user);
      // Fetch me
      try {
        const meData = await api.get('/auth/me');
        if (meData.success) {
          setWallet(meData.wallet);
          setUnreadNotifications(meData.unreadNotifications || 0);
        }
      } catch (e) {}
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('earnflow_token');
    setToken(null);
    setUser(null);
    setWallet(null);
    setUnreadNotifications(0);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const data = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        setWallet(data.wallet);
        setUnreadNotifications(data.unreadNotifications || 0);
      }
    } catch (err) {
      console.warn('Error refreshing user:', err);
    }
  };

  const value = {
    user,
    wallet,
    token,
    loading,
    unreadNotifications,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
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
