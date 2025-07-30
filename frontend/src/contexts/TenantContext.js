import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tenantSubdomain, setTenantSubdomain] = useState(
    localStorage.getItem('tenant_subdomain') || 'demo'
  );
  const [moduleConfig, setModuleConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('tenant_subdomain');
    if (stored) {
      setTenantSubdomain(stored);
    }
  }, []);

  // Load tenant module configuration
  const loadModuleConfig = async () => {
    if (!isAuthenticated || !user) {
      setModuleConfig(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/platform/experience');
      setModuleConfig(response.data);
      console.log('🎨 Loaded module config:', response.data.module_info);
    } catch (err) {
      console.error('Failed to load module config:', err);
      setError('Failed to load tenant configuration');
      // Set fallback config for graceful degradation
      setModuleConfig({
        module_info: { name: 'Claude Platform', industry: 'general' },
        terminology: {},
        features: [],
        navigation: [],
        color_scheme: {
          primary: '#3B82F6',
          secondary: '#1E40AF'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Load module config when user changes
  useEffect(() => {
    loadModuleConfig();
  }, [isAuthenticated, user?.tenant_id]);

  // Translate term using module terminology
  const translateTerm = (term) => {
    if (!moduleConfig?.terminology) return term;
    return moduleConfig.terminology[term] || term;
  };

  // Translate multiple terms
  const translateTerms = (terms) => {
    return terms.map(term => translateTerm(term));
  };

  // Translate object recursively
  const translateObject = (obj) => {
    if (!moduleConfig?.terminology) return obj;
    
    if (typeof obj === 'string') {
      return translateTerm(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => translateObject(item));
    } else if (obj && typeof obj === 'object') {
      const translated = {};
      for (const [key, value] of Object.entries(obj)) {
        translated[key] = translateObject(value);
      }
      return translated;
    }
    return obj;
  };

  // Check if feature is enabled
  const isFeatureEnabled = (featureName) => {
    if (!moduleConfig?.features) return false;
    return moduleConfig.features.includes(featureName);
  };

  // Get module-specific navigation
  const getNavigation = () => {
    return moduleConfig?.navigation || [];
  };

  // Get dashboard configuration
  const getDashboardConfig = () => {
    return moduleConfig?.dashboard || {};
  };

  // Get color scheme
  const getColorScheme = () => {
    return moduleConfig?.color_scheme || {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#EF4444',
      background: '#F9FAFB',
      text: '#111827'
    };
  };

  // Get module info
  const getModuleInfo = () => {
    return moduleConfig?.module_info || {
      name: 'Claude Platform',
      industry: 'general'
    };
  };

  // Get booking rules
  const getBookingRules = () => {
    return moduleConfig?.booking_rules || {};
  };

  // Get resource types
  const getResourceTypes = () => {
    return moduleConfig?.resource_types || [];
  };

  const value = {
    tenantSubdomain,
    setTenantSubdomain,
    moduleConfig,
    loading,
    error,
    translateTerm,
    translateTerms,
    translateObject,
    isFeatureEnabled,
    getNavigation,
    getDashboardConfig,
    getColorScheme,
    getModuleInfo,
    getBookingRules,
    getResourceTypes,
    reloadConfig: loadModuleConfig
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};