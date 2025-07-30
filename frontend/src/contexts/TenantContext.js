import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenantSubdomain, setTenantSubdomain] = useState(
    localStorage.getItem('tenant_subdomain') || 'demo'
  );

  useEffect(() => {
    // In a real implementation, you might extract this from the current domain
    // For now, we'll use localStorage or default to 'demo'
    const stored = localStorage.getItem('tenant_subdomain');
    if (stored) {
      setTenantSubdomain(stored);
    }
  }, []);

  const value = {
    tenantSubdomain,
    setTenantSubdomain,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};