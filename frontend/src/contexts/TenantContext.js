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
    if (!isAuthenticated || !user?.tenant_id) {
      console.log('🔄 TenantContext: Skipping module load - not authenticated or no tenant_id', { isAuthenticated, userId: user?.id, tenantId: user?.tenant_id });
      setModuleConfig(null);
      return;
    }

    console.log('🔄 TenantContext: Starting module config load for tenant', user.tenant_id);
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/platform/experience');
      setModuleConfig(response.data);
      console.log('🎨 TenantContext: Module config loaded successfully!', {
        moduleName: response.data.module_info?.name,
        industry: response.data.module_info?.industry,
        terminologyCount: Object.keys(response.data.terminology || {}).length,
        featuresCount: response.data.features?.length || 0,
        navigationCount: response.data.navigation?.length || 0
      });
    } catch (err) {
      console.error('❌ TenantContext: Failed to load module config:', err);
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
    console.log('🔄 TenantContext: useEffect triggered', { isAuthenticated, userTenantId: user?.tenant_id });
    loadModuleConfig();
  }, [isAuthenticated, user?.tenant_id]);

  // Debug: Log module config when it changes
  useEffect(() => {
    if (moduleConfig) {
      console.log('🎨 TenantContext: Module config loaded successfully!', {
        moduleName: moduleConfig.module_info?.name,
        industry: moduleConfig.module_info?.industry,
        terminologyCount: Object.keys(moduleConfig.terminology || {}).length,
        featuresCount: moduleConfig.features?.length || 0,
        navigationCount: moduleConfig.navigation?.length || 0
      });
      
      // Make available for debugging
      window.moduleConfigForDebugging = moduleConfig;
    }
  }, [moduleConfig]);

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