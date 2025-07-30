import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Set token in API instance
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Check if we have user data in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          logout();
        }
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password, tenantSubdomain) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      }, {
        params: { tenant_subdomain: tenantSubdomain }
      });
      
      const { access_token, user: userData } = response.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tenant_subdomain', tenantSubdomain);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (userData, tenantSubdomain) => {
    try {
      const response = await api.post('/auth/register', userData, {
        params: { tenant_subdomain: tenantSubdomain }
      });
      
      const { access_token, user: newUser } = response.data;
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('tenant_subdomain', tenantSubdomain);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant_subdomain');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token, // Add isAuthenticated computed property
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};