import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../i18n';
import { Settings as SettingsIcon, Lock, Shield, AlertTriangle, Globe, Split, Users, User, Scale, Percent, CheckCircle, Info } from 'lucide-react';
import { AgreementModal } from '../../components/AgreementModal';
import { TipDistributionMode, PosFeePayer } from '../../types';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

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

  // Tip Distribution & Pool Settings
  const [tipSettings, setTipSettings] = useState({
    tip_distribution_mode: 'INDIVIDUAL' as TipDistributionMode,
    pos_fee_payer: 'STAFF' as PosFeePayer,
    custom_pos_fee_rate: 2.9,
    tax_deduction_enabled: false,
    tax_deduction_rate: 10,
  });
  const [savingTipSettings, setSavingTipSettings] = useState(false);

  const loadSettings = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/business'),
      api.get('/business/tip-distribution-settings').catch(() => null),
    ])
      .then(([bizRes, tipRes]) => {
        const data = bizRes.data.data;
        setBusinessConfig({
          locale: data.locale || 'en-US',
          timezone: data.timezone || 'America/New_York',
          custom_tip_amounts: data.tip_amounts?.join(', ') || '5, 10, 15, 20, 25',
        });

        if (tipRes && tipRes.data?.data) {
          const td = tipRes.data.data;
          setTipSettings({
            tip_distribution_mode: td.tip_distribution_mode || 'INDIVIDUAL',
            pos_fee_payer: td.pos_fee_payer || 'STAFF',
            custom_pos_fee_rate: td.custom_pos_fee_rate !== null && td.custom_pos_fee_rate !== undefined ? Number(td.custom_pos_fee_rate) : 2.9,
            tax_deduction_enabled: Boolean(td.tax_deduction_enabled),
            tax_deduction_rate: td.tax_deduction_rate !== null && td.tax_deduction_rate !== undefined ? Number(td.tax_deduction_rate) : 10,
          });
        }
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

  const handleSaveTipSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTipSettings(true);
    try {
      await api.put('/business/tip-distribution-settings', {
        tip_distribution_mode: tipSettings.tip_distribution_mode,
        pos_fee_payer: tipSettings.pos_fee_payer,
        custom_pos_fee_rate: Number(tipSettings.custom_pos_fee_rate),
        tax_deduction_enabled: tipSettings.tax_deduction_enabled,
        tax_deduction_rate: tipSettings.tax_deduction_enabled ? Number(tipSettings.tax_deduction_rate) : 0,
      });
      showToast('Bahşiş dağıtım ve kesinti ayarları başarıyla kaydedildi');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Ayarlar kaydedilemedi', 'error');
    } finally {
      setSavingTipSettings(false);
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

      {/* Bahşiş Dağıtım ve Havuzlama Ayarları */}
      <form onSubmit={handleSaveTipSettings} className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
          <Split size={20} className="section-icon" style={{ color: 'var(--primary)' }} />
          <div>
            <h3 className="section-title mb-0">Bahşiş Dağıtım & Havuzlama Sistemi</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Toplanan bahşişlerin personele nasıl paylaştırılacağını ve kesintileri yönetin.
            </p>
          </div>
        </div>

        {/* Dağıtım Modelleri */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
            Bahşiş Dağıtım Modeli
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* INDIVIDUAL */}
            <div
              onClick={() => setTipSettings({ ...tipSettings, tip_distribution_mode: 'INDIVIDUAL' })}
              style={{
                cursor: 'pointer',
                padding: '1.1rem',
                borderRadius: '12px',
                border: tipSettings.tip_distribution_mode === 'INDIVIDUAL'
                  ? '2px solid var(--primary)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: tipSettings.tip_distribution_mode === 'INDIVIDUAL'
                  ? 'rgba(99, 102, 241, 0.12)'
                  : 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} style={{ color: tipSettings.tip_distribution_mode === 'INDIVIDUAL' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Bireysel Dağıtım</span>
                </div>
                {tipSettings.tip_distribution_mode === 'INDIVIDUAL' && (
                  <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Her personel, kendi masa veya QR kodundan gelen bahşişi doğrudan kendi hesabına alır.
              </p>
            </div>

            {/* EQUAL_POOL */}
            <div
              onClick={() => setTipSettings({ ...tipSettings, tip_distribution_mode: 'EQUAL_POOL' })}
              style={{
                cursor: 'pointer',
                padding: '1.1rem',
                borderRadius: '12px',
                border: tipSettings.tip_distribution_mode === 'EQUAL_POOL'
                  ? '2px solid var(--primary)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: tipSettings.tip_distribution_mode === 'EQUAL_POOL'
                  ? 'rgba(99, 102, 241, 0.12)'
                  : 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} style={{ color: tipSettings.tip_distribution_mode === 'EQUAL_POOL' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Eşit Havuz (Pool)</span>
                </div>
                {tipSettings.tip_distribution_mode === 'EQUAL_POOL' && (
                  <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Tüm bahşişler ortak bir havuzda toplanır ve gün sonunda aktif çalışanlara kişi başı eşit bölünür.
              </p>
            </div>

            {/* POINT_POOL */}
            <div
              onClick={() => setTipSettings({ ...tipSettings, tip_distribution_mode: 'POINT_POOL' })}
              style={{
                cursor: 'pointer',
                padding: '1.1rem',
                borderRadius: '12px',
                border: tipSettings.tip_distribution_mode === 'POINT_POOL'
                  ? '2px solid var(--primary)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: tipSettings.tip_distribution_mode === 'POINT_POOL'
                  ? 'rgba(99, 102, 241, 0.12)'
                  : 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale size={18} style={{ color: tipSettings.tip_distribution_mode === 'POINT_POOL' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Puan / Rol Ağırlıklı</span>
                </div>
                {tipSettings.tip_distribution_mode === 'POINT_POOL' && (
                  <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Garson (1.0x), Barmen (0.75x), Komi (0.50x) gibi rol ağırlıklarına göre adil havuz paylaşımı yapılır.
              </p>
            </div>
          </div>
        </div>

        {/* POS ve Muhasebe Kesintileri Grid */}
        <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={16} style={{ color: 'var(--primary)' }} />
            POS ve Muhasebe / Stopaj Kesinti Ayarları
          </h4>

          <div className="form-grid form-grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            {/* POS Komisyon Sorumlusu */}
            <div className="form-group mb-0">
              <label className="form-label">POS Komisyonunu Kim Karşılar?</label>
              <select
                value={tipSettings.pos_fee_payer}
                onChange={(e) => setTipSettings({ ...tipSettings, pos_fee_payer: e.target.value as PosFeePayer })}
                className="form-input"
              >
                <option value="STAFF">Personel Bahşişinden Düşülsün (Havuzdan Kesilir)</option>
                <option value="BUSINESS">İşletme Karşılasın (Personele Net Yansır)</option>
                <option value="CUSTOMER">Müşteri Ödesin (Ödeme Ekranına Eklenir)</option>
              </select>
              <div className="form-hint">
                {tipSettings.pos_fee_payer === 'STAFF' && 'Sanal POS komisyonu toplanan bahşişten otomatik tenzil edilir.'}
                {tipSettings.pos_fee_payer === 'BUSINESS' && 'Komisyonu işletme üstlenir, personel brüt tutar üzerinden pay alır.'}
                {tipSettings.pos_fee_payer === 'CUSTOMER' && 'Bahşiş tutarına işlem bedeli olarak ilave edilir.'}
              </div>
            </div>

            {/* POS Komisyon Oranı */}
            <div className="form-group mb-0">
              <label className="form-label">POS Komisyon Oranı (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={tipSettings.custom_pos_fee_rate}
                onChange={(e) => setTipSettings({ ...tipSettings, custom_pos_fee_rate: parseFloat(e.target.value) || 0 })}
                className="form-input"
                placeholder="2.90"
              />
              <div className="form-hint">Bankanızın veya ödeme sağlayıcınızın kestiği komisyon yüzdesi.</div>
            </div>
          </div>

          {/* Stopaj / Vergi Kesintisi */}
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Muhasebe / Stopaj Kesintisi</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Resmi muhasebeleştirme veya stopaj gereksinimleri için havuzdan otomatik vergi karşılığı ayırır.
                </p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={tipSettings.tax_deduction_enabled}
                  onChange={(e) => setTipSettings({ ...tipSettings, tax_deduction_enabled: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: tipSettings.tax_deduction_enabled ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '24px',
                    transition: '0.3s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: '18px',
                      width: '18px',
                      left: tipSettings.tax_deduction_enabled ? '23px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s',
                    }}
                  />
                </span>
              </label>
            </div>

            {tipSettings.tax_deduction_enabled && (
              <div className="form-group mb-0" style={{ maxWidth: '280px', marginTop: '0.5rem' }}>
                <label className="form-label">Vergi / Stopaj Kesinti Oranı (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={tipSettings.tax_deduction_rate}
                  onChange={(e) => setTipSettings({ ...tipSettings, tax_deduction_rate: parseFloat(e.target.value) || 0 })}
                  className="form-input"
                  placeholder="10.0"
                />
                <div className="form-hint">Örn: %10 veya %20 stopaj oranı</div>
              </div>
            )}
          </div>
        </div>

        {/* Bilgilendirme Notu */}
        <div style={{ display: 'flex', gap: '0.6rem', padding: '0.85rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Gün sonu kasa kapatma raporunda; <strong>Brüt Bahşiş → POS Komisyonu → Stopaj Kesintisi = Net Dağıtılabilir Havuz</strong> şeffaf olarak hesaplanır ve personel hak ediş dökümüne yansıtılır.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={savingTipSettings}>
            {savingTipSettings ? 'Kaydediliyor...' : 'Dağıtım Ayarlarını Kaydet'}
          </button>
        </div>
      </form>

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
          <h3 className="section-title">Bölgesel ve Zaman Ayarları</h3>
        </div>

        <div className="form-grid form-grid-2">
          <div className="form-group mb-0">
            <label className="form-label">Dil & Biçim Kodu (Locale)</label>
            <input
              type="text"
              value={businessConfig.locale}
              onChange={(e) => setBusinessConfig({ ...businessConfig, locale: e.target.value })}
              className="form-input"
              placeholder="tr-TR, en-US..."
            />
            <div className="form-hint">Sayı, tarih ve para birimi sembollerinin biçimini belirler (Örn: tr-TR, en-US)</div>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Saat Dilimi (Timezone)</label>
            <input
              type="text"
              value={businessConfig.timezone}
              onChange={(e) => setBusinessConfig({ ...businessConfig, timezone: e.target.value })}
              className="form-input"
              placeholder="Europe/Istanbul"
            />
            <div className="form-hint">Gün sonu devirleri, vardiya kapanışları ve raporlama saat aralıkları için kullanılır</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button type="submit" className="btn btn-primary">
            {t('common.save')}
          </button>
        </div>
      </form>

      {/* Legal Agreement & Compliance Card */}
      <div className="glass-card">
        <div className="section-header">
          <Shield size={20} className="section-icon" />
          <h3 className="section-title">Hukuki Sözleşme ve Dijital Onay</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Naponi platformu üzerinden dijital bahşiş ve ödeme altyapısını kullanırken tarafların hak ve yükümlülüklerini belirleyen çerçeve hizmet sözleşmesi.
        </p>

        <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Naponi İşletme Hizmet ve Kullanım Sözleşmesi</span>
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>v1.0.0</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              HMK m. 193 Uyarınca Kriptografik (SHA-256) İspat ve Onay Protokolü
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAgreementModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            Sözleşmeyi ve Makbuzu Görüntüle
          </button>
        </div>
      </div>

      <AgreementModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
      />

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
