import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../i18n';
import { Settings as SettingsIcon, Lock, Shield, AlertTriangle, Globe } from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Account settings
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Business config
  const [businessConfig, setBusinessConfig] = useState({
    locale: 'en-US',
    timezone: 'America/New_York',
    custom_tip_amounts: '',
  });

  const loadSettings = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/business')
      .then((res) => {
        const data = res.data.data;
        setBusinessConfig({
          locale: data.locale || 'en-US',
          timezone: data.timezone || 'America/New_York',
          custom_tip_amounts: data.tip_amounts?.join(', ') || '5, 10, 15, 20, 25',
        });
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordData.new_password.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/auth/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      showToast('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/business', {
        locale: businessConfig.locale,
        timezone: businessConfig.timezone,
      });
      showToast('Settings updated');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message="Loading settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <ErrorState message={error} onRetry={loadSettings} />
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('nav.settings')}</h1>
          <p className="page-subtitle mb-0">
            {t('nav.profileSecurity')}
          </p>
        </div>
      </div>

      {/* Account Info (Read Only) */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header">
          <Shield size={20} className="section-icon" />
          <h3 className="section-title">{t('common.details')}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div className="form-label">{t('auth.emailLabel')}</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 600 }}>{user?.email}</div>
          </div>
          <div>
            <div className="form-label">{t('common.status')}</div>
            <span className="badge badge-accent">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <form onSubmit={handlePasswordChange} className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header">
          <Lock size={20} className="section-icon" />
          <h3 className="section-title">{t('auth.passwordLabel')}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group mb-0">
            <label className="form-label">{t('auth.currentPasswordLabel')}</label>
            <input
              type="password"
              required
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group mb-0">
              <label className="form-label">{t('auth.newPasswordLabel')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">{t('auth.confirmPasswordLabel')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-secondary" disabled={changingPassword}>
              {changingPassword ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </form>

      {/* Locale / Timezone Config */}
      <form onSubmit={handleSaveConfig} className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header">
          <Globe size={20} className="section-icon" />
          <h3 className="section-title">{t('nav.settings')}</h3>
        </div>

        <div className="form-grid form-grid-2">
          <div className="form-group mb-0">
            <label className="form-label">{t('common.details')}</label>
            <input
              type="text"
              value={businessConfig.locale}
              onChange={(e) => setBusinessConfig({ ...businessConfig, locale: e.target.value })}
              className="form-input"
              placeholder="en-US"
            />
            <div className="form-hint">Controls number, date, and currency formatting</div>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">{t('common.time')}</label>
            <input
              type="text"
              value={businessConfig.timezone}
              onChange={(e) => setBusinessConfig({ ...businessConfig, timezone: e.target.value })}
              className="form-input"
              placeholder="America/New_York"
            />
            <div className="form-hint">Used for daily reset and analytics time ranges</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button type="submit" className="btn btn-primary">
            {t('common.save')}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <div className="section-header">
          <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
          <h3 className="section-title" style={{ color: '#f87171' }}>Danger Zone</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
          These actions are permanent and cannot be reversed. Contact support if you need to deactivate your business or export all data before deletion.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-danger" disabled>
            Deactivate Business
          </button>
          <button className="btn btn-danger" disabled>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
