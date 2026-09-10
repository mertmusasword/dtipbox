import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { LanguageProvider } from './i18n';
import { AnalyticsTracker } from './analytics';

// Pages
import { HomePage } from './pages/public/HomePage';
import { TipPage } from './pages/public/TipPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { BusinessProfilePage } from './pages/business/BusinessProfilePage';
import { EmployeesPage } from './pages/business/EmployeesPage';
import { TablesPage } from './pages/business/TablesPage';
import { QrCodesPage } from './pages/business/QrCodesPage';
import { PaymentMethodsPage } from './pages/business/PaymentMethodsPage';
import { PaymentAccountPage } from './pages/business/PaymentAccountPage';
import { AnalyticsPage } from './pages/business/AnalyticsPage';
import { ProfileSettingsPage } from './pages/business/ProfileSettingsPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBusinessesPage } from './pages/admin/AdminBusinessesPage';
import { AdminEmployeesPage } from './pages/admin/AdminEmployeesPage';
import { AdminQrsPage } from './pages/admin/AdminQrsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminPaymentProvidersPage } from './pages/admin/AdminPaymentProvidersPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { Role } from './types';

// Protected Route Guard
const ProtectedLayout: React.FC<{ allowedRoles?: Role[] }> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Authenticating...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee/dashboard" replace />;
    return <Navigate to="/business/dashboard" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AnalyticsTracker />
            <Routes>
              {/* Public Landing & Showcase */}
              <Route path="/" element={<HomePage />} />

              {/* Public Customer Tip Routes */}
              <Route path="/tip/:publicToken" element={<TipPage />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Business Routes */}
              <Route element={<ProtectedLayout allowedRoles={['BUSINESS', 'ADMIN']} />}>
                <Route path="/business/dashboard" element={<BusinessDashboard />} />
                <Route path="/business/profile" element={<BusinessProfilePage />} />
                <Route path="/business/employees" element={<EmployeesPage />} />
                <Route path="/business/tables" element={<TablesPage />} />
                <Route path="/business/qr" element={<QrCodesPage />} />
                <Route path="/business/payment-methods" element={<PaymentMethodsPage />} />
                <Route path="/business/payment-account" element={<PaymentAccountPage />} />
                <Route path="/business/analytics" element={<AnalyticsPage />} />
                <Route path="/business/settings" element={<ProfileSettingsPage />} />
              </Route>

              {/* Legacy route redirects */}
              <Route path="/dashboard" element={<Navigate to="/business/dashboard" replace />} />
              <Route path="/business/qr-codes" element={<Navigate to="/business/qr" replace />} />

              {/* Employee Routes */}
              <Route element={<ProtectedLayout allowedRoles={['EMPLOYEE']} />}>
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedLayout allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/businesses" element={<AdminBusinessesPage />} />
                <Route path="/admin/businesses/:id" element={<AdminBusinessesPage />} />
                <Route path="/admin/employees" element={<AdminEmployeesPage />} />
                <Route path="/admin/qr" element={<AdminQrsPage />} />
                <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                <Route path="/admin/payment-providers" element={<AdminPaymentProvidersPage />} />
                <Route path="/admin/statistics" element={<AdminDashboard />} />
                <Route path="/admin/audit" element={<AdminAuditPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
