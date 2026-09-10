import React from 'react';
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
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isBusiness = user.role === 'BUSINESS';
  const isAdmin = user.role === 'ADMIN';
  const isEmployee = user.role === 'EMPLOYEE';

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand Header */}
      <div style={{ padding: '1.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px var(--accent-glow)',
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.025em', color: '#fff' }}>
            D-TIPBOX
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {user.role} PANEL
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {isBusiness && (
          <>
            <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem to="/business/employees" icon={<Users size={18} />} label="Employees" />
            <NavItem to="/business/tables" icon={<UtensilsCrossed size={18} />} label="Tables" />
            <NavItem to="/business/qr-codes" icon={<QrCode size={18} />} label="QR Codes" />
            <NavItem to="/business/payment-methods" icon={<CreditCard size={18} />} label="Payment Methods" />
            <NavItem to="/business/payment-account" icon={<Building2 size={18} />} label="Bank Account" />
            <NavItem to="/business/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
            <NavItem to="/business/settings" icon={<Settings size={18} />} label="Settings" />
          </>
        )}

        {isEmployee && (
          <>
            <NavItem to="/employee/dashboard" icon={<LayoutDashboard size={18} />} label="My Tips & Stats" />
          </>
        )}

        {isAdmin && (
          <>
            <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Overview" />
            <NavItem to="/admin/businesses" icon={<Building2 size={18} />} label="Businesses" />
            <NavItem to="/admin/audit" icon={<ShieldCheck size={18} />} label="Audit Logs" />
          </>
        )}
      </nav>

      {/* User Footer */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{ overflow: 'hidden', marginRight: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user.email}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {user.business?.name || 'Authorized User'}
          </div>
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
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard' || to === '/admin'}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.65rem 0.9rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: isActive ? '#fff' : 'var(--text-secondary)',
        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
        transition: 'all 0.15s ease',
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};
