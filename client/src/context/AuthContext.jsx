import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('repx_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load current user profile from backend on app mount
  const refreshUser = async () => {
    const savedToken = localStorage.getItem('repx_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('repx_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.response?.data?.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('repx_token');
      localStorage.removeItem('repx_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await API.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('repx_token', newToken);
        localStorage.setItem('repx_user', JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (name, username, email, password) => {
    try {
      setError(null);
      const res = await API.post('/auth/register', { name, username, email, password });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('repx_token', newToken);
        localStorage.setItem('repx_user', JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      // Continue client cleanup even if network fails
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('repx_token');
    localStorage.removeItem('repx_user');
  };

  const saveOnboarding = async (onboardingData) => {
    try {
      const res = await API.put('/auth/onboarding', onboardingData);
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('repx_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to save onboarding data',
      };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user?._id) return { success: false, message: 'No user logged in' };
      const res = await API.put(`/users/${user._id}`, updates);
      if (res.data?.success) {
        setUser(res.data.data);
        localStorage.setItem('repx_user', JSON.stringify(res.data.data));
        return { success: true, user: res.data.data };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        saveOnboarding,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
