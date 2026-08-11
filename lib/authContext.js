'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    const { token, user: userData } = response.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
    router.push('/admin/dashboard');
    return response.data;
  };

  const loginStaff = async (login, password, preventRedirect = false) => {
    const response = await api.post('/auth/staff/login', { login, password });
    const { token, user: userData } = response.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
    if (!preventRedirect) {
      router.push('/portal/dashboard');
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, loginStaff, logout, checkUserLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
