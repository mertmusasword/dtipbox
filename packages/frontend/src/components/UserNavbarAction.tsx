import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n';
import '../styles/home.css';

interface UserNavbarActionProps {
  variant?: 'desktop' | 'mobile-bar' | 'mobile-drawer';
  onRegisterClick?: () => void;
  onItemClick?: () => void;
}

export const UserNavbarAction: React.FC<UserNavbarActionProps> = ({
  variant = 'desktop',
  onRegisterClick,
  onItemClick,
}) => {
  const { user, loading, logout } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language !== 'tr';

  // Fallback while initial auth state resolves from localStorage token
  if (loading) {
    if (variant === 'mobile-bar') {
      return (
        <span className="home-btn-primary home-btn-mobile-cta" style={{ opacity: 0.6 }}>
          {t('nav.getStarted')}
        </span>
      );
    }
    if (variant === 'mobile-drawer') {
      return null;
    }
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem' }}>
        <span className="home-btn-ghost" style={{ opacity: 0.6 }}>{t('nav.login')}</span>
        <span className="home-btn-primary" style={{ opacity: 0.6 }}>
          {t('nav.getStarted')} <ArrowRight size={16} />
        </span>
      </div>
    );
  }

  // Target dashboard path based on authenticated user role
  const targetPath =
    user?.role === 'ADMIN'
      ? '/admin'
      : user?.role === 'EMPLOYEE'
      ? '/employee/dashboard'
      : '/business/dashboard';

  // Localized role label
  const roleLabel =
    user?.role === 'ADMIN'
      ? (isEn ? 'Admin' : 'Yönetici')
      : user?.role === 'EMPLOYEE'
      ? (isEn ? 'Staff' : 'Personel')
      : (isEn ? 'Business' : 'İşletme');

  // Display Name: prioritize business name for venues, employee name for staff, or email prefix
  const displayName =
    user?.role === 'BUSINESS' && user.business?.name
      ? user.business.name
      : user?.role === 'EMPLOYEE' && (user.employee?.first_name || user.employee?.last_name)
      ? `${user.employee?.first_name || ''} ${user.employee?.last_name || ''}`.trim()
      : user?.email
      ? user.email.split('@')[0]
      : isEn
      ? 'My Account'
      : 'Hesabım';

  const avatarInitial = (displayName[0] || 'N').toUpperCase();
  const dashboardLabel = t('nav.dashboard') || (isEn ? 'Dashboard' : 'Panelim');

  // -------------------------------------------------------------
  // VARIANT 1: Mobile top bar next to toggle button
  // -------------------------------------------------------------
  if (variant === 'mobile-bar') {
    if (!user) {
      return (
        <Link
          to="/register"
          className="home-btn-primary home-btn-mobile-cta"
          onClick={onRegisterClick}
        >
          {t('nav.getStarted')}
        </Link>
      );
    }

    return (
      <Link
        to={targetPath}
        className="home-btn-primary home-btn-mobile-cta"
        onClick={onItemClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.42rem 0.85rem',
        }}
      >
        <LayoutDashboard size={13} />
        <span>{dashboardLabel}</span>
      </Link>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 2: Mobile drawer menu (inside hamburger)
  // -------------------------------------------------------------
  if (variant === 'mobile-drawer') {
    if (!user) {
      return (
        <div className="home-mobile-menu-top-actions">
          <Link
            to="/login"
            className="home-btn-ghost home-mobile-action-btn"
            onClick={onItemClick}
          >
            <LogIn size={15} />
            <span>{t('nav.login')}</span>
          </Link>
          <Link
            to="/register"
            className="home-btn-primary home-mobile-action-btn"
            onClick={() => {
              if (onRegisterClick) onRegisterClick();
              if (onItemClick) onItemClick();
            }}
          >
            <span>{t('nav.getStarted')}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      );
    }

    return (
      <div className="home-nav-user-mobile-card">
        <div className="home-nav-user-mobile-top">
          <div className="home-nav-user-avatar">
            {avatarInitial}
          </div>
          <div className="home-nav-user-text">
            <span className="home-nav-user-name">{displayName}</span>
            <span className="home-nav-user-badge">{roleLabel}</span>
          </div>
        </div>

        <div className="home-nav-user-mobile-actions">
          <Link
            to={targetPath}
            className="home-btn-primary home-nav-user-mobile-btn"
            onClick={onItemClick}
          >
            <LayoutDashboard size={15} />
            <span>{dashboardLabel}</span>
            <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            className="home-btn-ghost home-nav-user-logout-btn"
            onClick={async () => {
              if (onItemClick) onItemClick();
              await logout();
            }}
            title={isEn ? 'Log out' : 'Çıkış Yap'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 3: Default Desktop Header Actions
  // -------------------------------------------------------------
  if (!user) {
    return (
      <>
        <Link to="/login" className="home-btn-ghost">
          {t('nav.login')}
        </Link>
        <Link to="/register" className="home-btn-primary" onClick={onRegisterClick}>
          {t('nav.getStarted')} <ArrowRight size={16} />
        </Link>
      </>
    );
  }

  return (
    <div className="home-nav-user-cluster">
      <Link
        to={targetPath}
        className="home-nav-user-chip"
        title={`${displayName} (${roleLabel})`}
        onClick={onItemClick}
      >
        <div className="home-nav-user-avatar">
          {avatarInitial}
        </div>
        <div className="home-nav-user-text">
          <span className="home-nav-user-name">{displayName}</span>
          <span className="home-nav-user-badge">{roleLabel}</span>
        </div>
      </Link>

      <Link
        to={targetPath}
        className="home-btn-primary home-nav-dashboard-btn"
        onClick={onItemClick}
      >
        <LayoutDashboard size={14} />
        <span>{dashboardLabel}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};
