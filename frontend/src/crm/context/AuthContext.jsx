import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_CRM_API_URL || import.meta.env.VITE_API_URL || '/api';
const API_URL = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL.replace(/\/$/, '')}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('--- AUTH CHECK ON MOUNT ---');
      console.log('Stored Token Found:', !!token);
      console.log('Stored User Found:', !!storedUser);

      // If either is missing but the other exists, clear both to avoid inconsistent state
      if (!token || !storedUser) {
        if (token || storedUser) {
          console.log('Inconsistent auth state found. Clearing storage.');
          localStorage.clear();
        }
        setUser(null);
      } else {
        try {
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          localStorage.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    console.log('>>>> AUTH_CONTEXT: login() called');
    console.log('>>>> DATA RECEIVED: email:', email, 'passwordExists:', !!password);

    console.log('VITE_CRM_API_URL ENV VALUE:', import.meta.env.VITE_CRM_API_URL);
    console.log('VITE_API_URL ENV VALUE:', import.meta.env.VITE_API_URL);
    console.log('FINAL RESOLVED API URL:', `${API_URL}/auth/login`);
    console.log('REQUEST PAYLOAD SENT TO BACKEND:', { email, password: '***' });

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      console.log('<<<< BACKEND RESPONSE RECEIVED:', response.data);

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        console.log('<<<< TOKEN RECEIVED:', !!token);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      console.log('<<<< LOGIN API REQUEST FAILED');
      console.error('Error details:', error.response?.data || error.message);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const updateUserImage = (url) => {
    if (user) {
      const updatedUser = { ...user, profile_image: url };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateUserProfileDetails = (details) => {
    if (user) {
      const updatedUser = { ...user, ...details };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    console.log('>>>> LOGOUT CALLED');
    localStorage.clear();
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserImage, updateUserProfileDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
