import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { LanguageProvider } from './i18n';
import { AnalyticsTracker } from './analytics';
import { ScrollToTop } from './components/ScrollToTop';
import { FloatingSupportWidget } from './components/FloatingSupportWidget';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Role } from './types';

// ==================== CODE SPLITTING / LAZY LOADED PAGES ====================
// Public Pages
const HomePage = React.lazy(() => import('./pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const TipPage = React.lazy(() => import('./pages/public/TipPage').then((m) => ({ default: m.TipPage })));
const BlogIndexPage = React.lazy(() => import('./pages/public/blog/BlogIndexPage').then((m) => ({ default: m.BlogIndexPage })));
const BlogDetailPage = React.lazy(() => import('./pages/public/blog/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })));
const SolutionPage = React.lazy(() => import('./pages/public/solutions/SolutionPage').then((m) => ({ default: m.SolutionPage })));
const TipCalculatorPage = React.lazy(() => import('./pages/public/tools/TipCalculatorPage').then((m) => ({ default: m.TipCalculatorPage })));
const TipSplitCalculatorPage = React.lazy(() => import('./pages/public/tools/TipSplitCalculatorPage').then((m) => ({ default: m.TipSplitCalculatorPage })));

// Auth Pages
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));

// Business Dashboard Pages
const BusinessDashboard = React.lazy(() => import('./pages/business/BusinessDashboard').then((m) => ({ default: m.BusinessDashboard })));
const BusinessProfilePage = React.lazy(() => import('./pages/business/BusinessProfilePage').then((m) => ({ default: m.BusinessProfilePage })));
const EmployeesPage = React.lazy(() => import('./pages/business/EmployeesPage').then((m) => ({ default: m.EmployeesPage })));
const TablesPage = React.lazy(() => import('./pages/business/TablesPage').then((m) => ({ default: m.TablesPage })));
const QrCodesPage = React.lazy(() => import('./pages/business/QrCodesPage').then((m) => ({ default: m.QrCodesPage })));
const PaymentMethodsPage = React.lazy(() => import('./pages/business/PaymentMethodsPage').then((m) => ({ default: m.PaymentMethodsPage })));
const PaymentAccountPage = React.lazy(() => import('./pages/business/PaymentAccountPage').then((m) => ({ default: m.PaymentAccountPage })));
const AnalyticsPage = React.lazy(() => import('./pages/business/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const FeedbacksPage = React.lazy(() => import('./pages/business/FeedbacksPage').then((m) => ({ default: m.FeedbacksPage })));
const ProfileSettingsPage = React.lazy(() => import('./pages/business/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage })));

// Employee Pages
const EmployeeDashboard = React.lazy(() => import('./pages/employee/EmployeeDashboard').then((m) => ({ default: m.EmployeeDashboard })));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminBusinessesPage = React.lazy(() => import('./pages/admin/AdminBusinessesPage').then((m) => ({ default: m.AdminBusinessesPage })));
const AdminEmployeesPage = React.lazy(() => import('./pages/admin/AdminEmployeesPage').then((m) => ({ default: m.AdminEmployeesPage })));
const AdminQrsPage = React.lazy(() => import('./pages/admin/AdminQrsPage').then((m) => ({ default: m.AdminQrsPage })));
const AdminPaymentsPage = React.lazy(() => import('./pages/admin/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })));
const AdminPaymentProvidersPage = React.lazy(() => import('./pages/admin/AdminPaymentProvidersPage').then((m) => ({ default: m.AdminPaymentProvidersPage })));
const AdminAuditPage = React.lazy(() => import('./pages/admin/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminAgreementsPage = React.lazy(() => import('./pages/admin/AdminAgreementsPage').then((m) => ({ default: m.AdminAgreementsPage })));
const AdminCorporateApplicationsPage = React.lazy(() => import('./pages/admin/AdminCorporateApplicationsPage').then((m) => ({ default: m.AdminCorporateApplicationsPage })));
const AdminSupportTicketsPage = React.lazy(() => import('./pages/admin/AdminSupportTicketsPage').then((m) => ({ default: m.AdminSupportTicketsPage })));

// Page Loading Fallback Spinner
const PageLoader: React.FC = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 1rem' }} />
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Yükleniyor...</div>
    </div>
  </div>
);

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
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
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
            <ScrollToTop />
            <AnalyticsTracker />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Landing & Showcase */}
                <Route path="/" element={<HomePage />} />

                {/* Public Blog & Content Hub */}
                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/blog/category/:category" element={<BlogIndexPage />} />

                {/* Public Industry Solutions */}
                <Route path="/solutions/:sector" element={<SolutionPage />} />

                {/* Public SEO Tools */}
                <Route path="/tools/tip-calculator" element={<TipCalculatorPage />} />
                <Route path="/tools/tip-split-calculator" element={<TipSplitCalculatorPage />} />

                {/* Public Customer Tip Routes */}
                <Route path="/tip/:publicToken" element={<TipPage />} />

                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

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
                  <Route path="/business/feedbacks" element={<FeedbacksPage />} />
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
                  <Route path="/admin/corporate-applications" element={<AdminCorporateApplicationsPage />} />
                  <Route path="/admin/support-tickets" element={<AdminSupportTicketsPage />} />
                  <Route path="/admin/agreements" element={<AdminAgreementsPage />} />
                  <Route path="/admin/statistics" element={<AdminDashboard />} />
                  <Route path="/admin/audit" element={<AdminAuditPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
            <FloatingSupportWidget />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
