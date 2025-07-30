import React from 'react';
import AdminLayout from './admin/AdminLayout';

const Layout = ({ children }) => {
  return (
    <AdminLayout level="tenant">
      {children}
    </AdminLayout>
  );
};

export default Layout;