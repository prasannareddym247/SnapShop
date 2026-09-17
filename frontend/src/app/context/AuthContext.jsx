import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const isStorefront = () => /^#\/?store\//.test(window.location.hash);

  const [token, setToken] = useState(() => {
    if (isStorefront()) return null;
    return localStorage.getItem('fk_platform_token');
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentToken) => {
    if (isStorefront()) {
      setLoading(false);
      return;
    }
    try {
      if (currentToken) {
        localStorage.setItem('fk_platform_token', currentToken);
      }
      const data = await api.get('/auth/me');
      setUser(data);
      if (data && data.role === 'Seller') {
        sessionStorage.setItem('active_tenant_id', data.tenantId);
        sessionStorage.setItem('active_store_id', data.storeId);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStorefront()) {
      setLoading(false);
      return;
    }
    if (token) {
      localStorage.setItem('fk_platform_token', token);
      // Only fetch profile if we don't have user data
      // Login already provides user data, so skip fetchProfile after login
      if (!user) {
        fetchProfile(token);
      } else {
        setLoading(false);
      }
    } else {
      localStorage.removeItem('fk_platform_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    // Set tenant/store in sessionStorage BEFORE setting token to avoid race condition
    if (data.user && data.user.role === 'Seller') {
      sessionStorage.setItem('active_tenant_id', data.user.tenantId);
      sessionStorage.setItem('active_store_id', data.user.storeId);
    }
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await api.post('/auth/register', userData);
    return data;
  };

  const sendVerificationOtp = async (email) => {
    return api.post('/auth/send-verification-otp', { email });
  };

  const verifySignupOtp = async (email, otp) => {
    const data = await api.post('/auth/verify-signup-otp', { email, otp });
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const forgotPassword = async (email) => {
    return api.post('/auth/forgot-password', { email });
  };

  const verifyResetOtp = async (email, otp) => {
    return api.post('/auth/verify-reset-otp', { email, otp });
  };

  const resetPassword = async (email, newPassword) => {
    return api.post('/auth/reset-password', { email, newPassword });
  };

  const clearAuthStorage = () => {
    localStorage.removeItem('fk_platform_token');
    localStorage.removeItem('fk_platform_user');
    sessionStorage.removeItem('active_tenant_id');
    sessionStorage.removeItem('active_store_id');
    sessionStorage.removeItem('active_store_slug');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, sendVerificationOtp, verifySignupOtp, forgotPassword, verifyResetOtp, resetPassword, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};