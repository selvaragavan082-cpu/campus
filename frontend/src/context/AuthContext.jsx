import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('campus_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('campus_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      authService
        .getMe()
        .then((res) => {
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('campus_user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.data && res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem('campus_token', userData.token);
        localStorage.setItem('campus_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      console.error('Login Error:', err.response?.data || err.message);
      const message =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot connect to backend server. Please check your internet connection or backend URL.'
          : err.message || 'Login failed');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await authService.register(formData);
      if (res.data && res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem('campus_token', userData.token);
        localStorage.setItem('campus_user', JSON.stringify(userData));
        return { success: true, user: userData, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      console.error('Registration Error Details:', err.response?.data || err.message);
      const message =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Network Error: Cannot connect to backend server (https://campus-swp1.onrender.com). Please ensure backend is active.'
          : err.message || 'Registration failed.');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role) => {
    const credentials = {
      admin: { email: 'admin@campus.edu', password: 'Admin@123' },
      staff: { email: 'staff@campus.edu', password: 'Staff@123' },
      student: { email: 'student@campus.edu', password: 'Student@123' },
    };
    const cred = credentials[role] || credentials.student;
    return await login(cred.email, cred.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('campus_user', JSON.stringify({ ...user, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        quickLogin,
        logout,
        updateUserProfile,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
        isStudent: user?.role === 'student',
      }}
    >
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
