import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './stores/authStore';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { Layout } from './components/layout/Layout';

// Page Components
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { JobsPage } from './features/jobs/JobsPage';
import { JobDetailPage } from './features/jobs/JobDetailPage';
import { CompaniesPage } from './features/companies/CompaniesPage';
import { CompanyDetailPage } from './features/companies/CompanyDetailPage';
import { InterviewsPage } from './features/interviews/InterviewsPage';
import { DocumentsPage } from './features/documents/DocumentsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { TemplatesPage } from './features/templates/TemplatesPage';

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/companies/:id" element={<CompanyDetailPage />} />
                <Route path="/interviews" element={<InterviewsPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastProvider />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
