import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  QrCode,
  CreditCard,
  Building2,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  UserCircle,
  Layers,
  FileText,
  Briefcase,
  Headphones,
} from 'lucide-react';
import { useLanguage, LanguageSelector } from '../i18n';
import { SupportTicketModal } from './SupportTicketModal';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  if (!user) return null;

  const isBusiness = user.role === 'BUSINESS';
  const isAdmin = user.role === 'ADMIN';
  const isEmployee = user.role === 'EMPLOYEE';

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-mobile-overlay ${mobileOpen ? 'overlay--active' : ''}`}
        onClick={closeMobile}
      />

      {/* Mobile toggle button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={t('nav.toggleMenu')}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand" style={{ padding: '1.25rem 1.25rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/naponi-brand.svg" alt="Naponi" style={{ height: '42px', width: 'auto', display: 'block' }} />
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            {user.role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {isBusiness && (
            <>
              <NavItem to="/business/dashboard" icon={<LayoutDashboard size={18} />} label={t('nav.dashboard')} onClick={closeMobile} />
              <NavItem to="/business/profile" icon={<UserCircle size={18} />} label={t('nav.profile')} onClick={closeMobile} />
              <NavItem to="/business/employees" icon={<Users size={18} />} label={t('nav.employees')} onClick={closeMobile} />
              <NavItem to="/business/tables" icon={<UtensilsCrossed size={18} />} label={t('nav.tables')} onClick={closeMobile} />
              <NavItem to="/business/qr" icon={<QrCode size={18} />} label={t('nav.qrCodes')} onClick={closeMobile} />
              <NavItem to="/business/payment-methods" icon={<CreditCard size={18} />} label={t('nav.paymentMethods')} onClick={closeMobile} />
              <NavItem to="/business/payment-account" icon={<Building2 size={18} />} label={t('nav.bankAccount')} onClick={closeMobile} />
              <NavItem to="/business/analytics" icon={<BarChart3 size={18} />} label={t('nav.analytics')} onClick={closeMobile} />
              <NavItem to="/business/settings" icon={<Settings size={18} />} label={t('nav.settings')} onClick={closeMobile} />
              <button
                type="button"
                className="sidebar-nav-item"
                onClick={() => {
                  closeMobile();
                  setSupportOpen(true);
                }}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <Headphones size={18} />
                <span>{t('support.widgetBtn')}</span>
              </button>
            </>
          )}

          {isEmployee && (
            <>
              <NavItem to="/employee/dashboard" icon={<LayoutDashboard size={18} />} label={t('nav.myTipsStats')} onClick={closeMobile} />
              <button
                type="button"
                className="sidebar-nav-item"
                onClick={() => {
                  closeMobile();
                  setSupportOpen(true);
                }}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <Headphones size={18} />
                <span>{t('support.widgetBtn')}</span>
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label={t('nav.adminOverview')} end onClick={closeMobile} />
              <NavItem to="/admin/businesses" icon={<Building2 size={18} />} label={t('nav.businesses')} onClick={closeMobile} />
              <NavItem to="/admin/corporate-applications" icon={<Briefcase size={18} />} label={t('nav.corporateApplications')} onClick={closeMobile} />
              <NavItem to="/admin/support-tickets" icon={<Headphones size={18} />} label={t('nav.supportTickets')} onClick={closeMobile} />
              <NavItem to="/admin/employees" icon={<Users size={18} />} label={t('nav.employees')} onClick={closeMobile} />
              <NavItem to="/admin/qr" icon={<QrCode size={18} />} label={t('nav.qrCodes')} onClick={closeMobile} />
              <NavItem to="/admin/payments" icon={<CreditCard size={18} />} label={t('nav.payments')} onClick={closeMobile} />
              <NavItem to="/admin/payment-providers" icon={<Layers size={18} />} label={t('nav.paymentProviders')} onClick={closeMobile} />
              <NavItem to="/admin/agreements" icon={<FileText size={18} />} label="Sözleşmeler & Onay" onClick={closeMobile} />
              <NavItem to="/admin/statistics" icon={<BarChart3 size={18} />} label={t('nav.platformStats')} onClick={closeMobile} />
              <NavItem to="/admin/audit" icon={<ShieldCheck size={18} />} label={t('nav.auditLogs')} onClick={closeMobile} />
              <NavItem to="/admin/settings" icon={<Settings size={18} />} label={t('nav.profileSecurity')} onClick={closeMobile} />
            </>
          )}
        </nav>

        {/* Language selector strip in sidebar */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            {t('common.currency').slice(0, 4)} / Lang
          </span>
          <LanguageSelector variant="compact" direction="up" />
        </div>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div style={{ overflow: 'hidden', marginRight: '0.5rem', flex: 1 }}>
            <div className="sidebar-user-email">{user.email}</div>
            <div className="sidebar-user-business">{user.business?.name || 'Authorized User'}</div>
          </div>
          <button
            onClick={logout}
            title={t('nav.logout')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <SupportTicketModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </>
  );
};

const NavItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  onClick?: () => void;
}> = ({ to, icon, label, end, onClick }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};
