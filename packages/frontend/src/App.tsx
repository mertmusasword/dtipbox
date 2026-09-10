import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';

// Pages
import { TipPage } from './pages/public/TipPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BusinessDashboard } from './pages/business/BusinessDashboard';
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
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { Role } from './types';

// Protected Route Guard
const ProtectedLayout: React.FC<{ allowedRoles?: Role[] }> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Authenticating...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on actual role
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Customer Tip Routes */}
          <Route path="/tip/:publicToken" element={<TipPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Business Routes */}
          <Route element={<ProtectedLayout allowedRoles={['BUSINESS', 'ADMIN']} />}>
            <Route path="/dashboard" element={<BusinessDashboard />} />
            <Route path="/business/employees" element={<EmployeesPage />} />
            <Route path="/business/tables" element={<TablesPage />} />
            <Route path="/business/qr-codes" element={<QrCodesPage />} />
            <Route path="/business/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/business/payment-account" element={<PaymentAccountPage />} />
            <Route path="/business/analytics" element={<AnalyticsPage />} />
            <Route path="/business/settings" element={<ProfileSettingsPage />} />
          </Route>

          {/* Employee Routes */}
          <Route element={<ProtectedLayout allowedRoles={['EMPLOYEE']} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedLayout allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/businesses" element={<AdminBusinessesPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
