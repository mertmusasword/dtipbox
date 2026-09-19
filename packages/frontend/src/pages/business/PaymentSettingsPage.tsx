import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import {
  Link2,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Save,
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';

export const PaymentSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // External Payment Link State
  const [externalPaymentUrl, setExternalPaymentUrl] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);

  // Direct Bank Transfer (IBAN) State
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');
  const [country, setCountry] = useState(user?.business?.country || 'TR');
  const [savingBank, setSavingBank] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/business/payment-settings');
      const data = res.data.data;
      if (data) {
        setExternalPaymentUrl(data.externalPaymentUrl || '');
        if (data.paymentAccount) {
          setAccountHolderName(data.paymentAccount.account_holder_name || '');
          setBankName(data.paymentAccount.bank_name || '');
          setIban(data.paymentAccount.iban || '');
          setCountry(data.paymentAccount.country || user?.business?.country || 'TR');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user?.business?.country, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save External Payment URL
  const handleSaveExternalUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = externalPaymentUrl.trim();

    if (trimmed && !trimmed.toLowerCase().startsWith('https://')) {
      showToast(t('payments.httpsRequiredToast'), 'error');
      return;
    }

    try {
      setSavingUrl(true);
      await api.put('/business/payment-settings', {
        externalPaymentUrl: trimmed || null,
      });
      showToast(t('payments.linkSavedToast'));
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setSavingUrl(false);
    }
  };

  // Test / Preview External Payment URL
  const handleTestLink = () => {
    const trimmed = externalPaymentUrl.trim();
    if (!trimmed || !trimmed.toLowerCase().startsWith('https://')) {
      showToast(t('payments.httpsRequiredToast'), 'error');
      return;
    }
    window.open(trimmed, '_blank', 'noopener,noreferrer');
  };

  // Save Direct Bank Transfer (IBAN)
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountHolderName.trim() && !iban.trim()) {
      showToast(t('payments.missingBank'), 'error');
      return;
    }

    try {
      setSavingBank(true);
      await api.post('/business/payment-account', {
        account_holder_name: accountHolderName.trim(),
        bank_name: bankName.trim() || undefined,
        iban: iban.trim().replace(/\s+/g, '') || undefined,
        country: country || user?.business?.country || 'TR',
      });
      showToast(t('payments.bankSavedToast'));
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setSavingBank(false);
    }
  };

  // Country-aware Placeholders
  const activeCountry = (country || user?.business?.country || 'TR').toUpperCase();
  const ibanPlaceholder = activeCountry === 'TR'
    ? 'TR00 0000 0000 0000 0000 0000 00'
    : activeCountry === 'DE'
    ? 'DE89 3704 0044 0532 0130 00'
    : activeCountry === 'FR'
    ? 'FR76 3000 6000 0112 3456 7890 189'
    : activeCountry === 'ES'
    ? 'ES91 2100 0418 4502 0005 1332'
    : activeCountry === 'GB'
    ? 'GB29 NWBK 6016 1331 9268 19'
    : activeCountry === 'SA'
    ? 'SA03 8000 0000 6080 1016 7519'
    : activeCountry === 'AE'
    ? 'AE07 0331 2345 6789 0123 456'
    : t('payments.ibanPlaceholder');

  const bankPlaceholder = activeCountry === 'TR'
    ? 'Örn: Garanti BBVA, İş Bankası, Akbank...'
    : activeCountry === 'DE'
    ? 'z. B. Deutsche Bank, Commerzbank, Sparkasse...'
    : activeCountry === 'FR'
    ? 'Ex : BNP Paribas, Société Générale, Crédit Agricole...'
    : activeCountry === 'ES'
    ? 'Ej: Banco Santander, BBVA, CaixaBank...'
    : t('payments.bankNamePlaceholder');

  const holderPlaceholder = activeCountry === 'TR'
    ? 'Örn: Grand Bistro Cafe Ltd. Şti.'
    : activeCountry === 'DE'
    ? 'z. B. Grand Bistro Gastronomie GmbH'
    : activeCountry === 'FR'
    ? 'Ex : Grand Bistro Restauration SAS'
    : activeCountry === 'ES'
    ? 'Ej: Grand Bistro Hostelería S.L.'
    : t('payments.accountHolderPlaceholder');

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">{t('payments.pageTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('payments.pageSubtitle')}
          </p>
        </div>
      </div>

      {/* CORE REASSURANCE / ARCHITECTURE BANNER */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
          border: '1.5px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#f8fafc' }}>
            {t('payments.naponiDoesNotHoldFundsTitle')}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.55 }}>
            {t('payments.naponiDoesNotHoldFundsDesc')}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* SECTION 1: EXTERNAL PAYMENT LINK */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Link2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  {t('payments.externalLinkTitle')}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {t('payments.externalLinkDesc')}
                </span>
              </div>
            </div>

            {externalPaymentUrl ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> {t('common.active')}
              </span>
            ) : (
              <span className="badge badge-neutral">
                {t('common.inactive')}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {t('payments.externalLinkNotice')}
          </p>

          <form onSubmit={handleSaveExternalUrl}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {t('payments.externalLinkTitle')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  placeholder={t('payments.externalLinkPlaceholder')}
                  value={externalPaymentUrl}
                  onChange={(e) => setExternalPaymentUrl(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.9rem', paddingRight: '6rem' }}
                />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                🔒 {t('payments.httpsRequiredToast')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={savingUrl}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Save size={16} />
                {savingUrl ? t('common.saving') : t('payments.saveLinkBtn')}
              </button>

              {externalPaymentUrl && (
                <button
                  type="button"
                  onClick={handleTestLink}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <ExternalLink size={16} />
                  {t('payments.testLinkBtn')}
                </button>
              )}

              {externalPaymentUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setExternalPaymentUrl('');
                  }}
                  className="btn btn-secondary"
                  style={{ color: '#f87171' }}
                >
                  {t('payments.clearLinkBtn')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SECTION 2: DIRECT BANK TRANSFER (IBAN) */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  {t('payments.directBankTitle')}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {t('payments.directBankDesc')}
                </span>
              </div>
            </div>

            {iban ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> {t('common.active')}
              </span>
            ) : (
              <span className="badge badge-neutral">
                {t('common.inactive')}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {t('payments.directBankNotice')}
          </p>

          <form onSubmit={handleSaveBankDetails}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group mb-0">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  {t('payments.accountHolderName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={holderPlaceholder}
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  {t('payments.bankNameLabel')}
                </label>
                <input
                  type="text"
                  placeholder={bankPlaceholder}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {t('payments.ibanField')} *
              </label>
              <input
                type="text"
                required
                placeholder={ibanPlaceholder}
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase())}
                className="form-input"
                style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
              />
            </div>

            <button
              type="submit"
              disabled={savingBank}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {savingBank ? t('common.saving') : t('payments.saveBankDetailsBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

