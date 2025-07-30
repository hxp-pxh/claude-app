import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import PublicHomepage from './pages/PublicHomepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CMSPages from './pages/cms/Pages';
import PageEditor from './pages/cms/PageEditor';
import Forms from './pages/Forms';
import FormBuilder from './pages/FormBuilder';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Tours from './pages/Tours';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <BrowserRouter>
          <AuthProvider>
            <TenantProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/cms/pages" element={<CMSPages />} />
                          <Route path="/cms/pages/new" element={<PageEditor />} />
                          <Route path="/cms/pages/:pageId/edit" element={<PageEditor />} />
                          <Route path="/forms" element={<Forms />} />
                          <Route path="/forms/new" element={<FormBuilder />} />
                          <Route path="/forms/:formId/edit" element={<FormBuilder />} />
                          <Route path="/leads" element={<Leads />} />
                          <Route path="/leads/:leadId" element={<LeadDetail />} />
                          <Route path="/tours" element={<Tours />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </TenantProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;