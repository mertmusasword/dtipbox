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
  Sparkles,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        aria-label="Toggle sidebar"
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
              <NavItem to="/business/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={closeMobile} />
              <NavItem to="/business/profile" icon={<UserCircle size={18} />} label="Business Profile" onClick={closeMobile} />
              <NavItem to="/business/employees" icon={<Users size={18} />} label="Employees" onClick={closeMobile} />
              <NavItem to="/business/tables" icon={<UtensilsCrossed size={18} />} label="Tables" onClick={closeMobile} />
              <NavItem to="/business/qr" icon={<QrCode size={18} />} label="QR Codes" onClick={closeMobile} />
              <NavItem to="/business/payment-methods" icon={<CreditCard size={18} />} label="Payment Methods" onClick={closeMobile} />
              <NavItem to="/business/payment-account" icon={<Building2 size={18} />} label="Bank Account" onClick={closeMobile} />
              <NavItem to="/business/analytics" icon={<BarChart3 size={18} />} label="Analytics" onClick={closeMobile} />
              <NavItem to="/business/settings" icon={<Settings size={18} />} label="Settings" onClick={closeMobile} />
            </>
          )}

          {isEmployee && (
            <NavItem to="/employee/dashboard" icon={<LayoutDashboard size={18} />} label="My Tips & Stats" onClick={closeMobile} />
          )}

          {isAdmin && (
            <>
              <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Overview" end onClick={closeMobile} />
              <NavItem to="/admin/businesses" icon={<Building2 size={18} />} label="Businesses" onClick={closeMobile} />
              <NavItem to="/admin/employees" icon={<Users size={18} />} label="Staff Directory" onClick={closeMobile} />
              <NavItem to="/admin/qr" icon={<QrCode size={18} />} label="QR Codes" onClick={closeMobile} />
              <NavItem to="/admin/payments" icon={<CreditCard size={18} />} label="Payments" onClick={closeMobile} />
              <NavItem to="/admin/statistics" icon={<BarChart3 size={18} />} label="Platform Stats" onClick={closeMobile} />
              <NavItem to="/admin/audit" icon={<ShieldCheck size={18} />} label="Audit Logs" onClick={closeMobile} />
              <NavItem to="/admin/settings" icon={<Settings size={18} />} label="Profile & Security" onClick={closeMobile} />
            </>
          )}
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div style={{ overflow: 'hidden', marginRight: '0.5rem' }}>
            <div className="sidebar-user-email">{user.email}</div>
            <div className="sidebar-user-business">{user.business?.name || 'Authorized User'}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
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
