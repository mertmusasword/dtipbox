import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { BusinessPaymentAccount } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import { Building2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n';

export const PaymentAccountPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [account, setAccount] = useState<BusinessPaymentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    country: 'US',
    account_holder_name: '',
    bank_name: '',
    iban: '',
    account_number: '',
    routing_number: '',
    sort_code: '',
    swift_bic: '',
  });

  const loadAccount = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/business/payment-account')
      .then((res) => {
        if (res.data.data) {
          setAccount(res.data.data);
          setFormData({
            country: res.data.data.country || 'US',
            account_holder_name: res.data.data.account_holder_name || '',
            bank_name: res.data.data.bank_name || '',
            iban: res.data.data.iban || '',
            account_number: res.data.data.account_number || '',
            routing_number: res.data.data.routing_number || '',
            sort_code: res.data.data.sort_code || '',
            swift_bic: res.data.data.swift_bic || '',
          });
        }
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.post('/business/payment-account', formData);
      setAccount(res.data.data);
      showToast(t('common.saved') || t('common.success'));
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

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
        <ErrorState message={error} onRetry={loadAccount} />
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('payments.bankDetailsTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('payments.bankDetailsSubtitle')}
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header">
          <ShieldCheck size={20} className="section-icon" />
          <h3 className="section-title">Direct Settlement Security</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {t('payments.bankSecurityNotice')}
        </p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">{t('payments.bankCountry')}</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                placeholder="US, DE, TR, GB..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('payments.accountHolderName')}</label>
              <input
                type="text"
                required
                value={formData.account_holder_name}
                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                placeholder="e.g. The Grand Lounge LLC"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('payments.bankNameLabel')}</label>
            <input
              type="text"
              required
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              placeholder="e.g. JPMorgan Chase, Deutsche Bank, Garanti BBVA"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('payments.ibanField')}</label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
              placeholder="e.g. TR00 0000 0000 0000 0000 0000 00"
              className="form-input"
            />
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">{t('payments.localAccountNumber')}</label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Required for non-IBAN regions"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('payments.routingNumber')}</label>
              <input
                type="text"
                value={formData.routing_number}
                onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                placeholder="ABA / Sort code"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('payments.swiftBic')}</label>
            <input
              type="text"
              value={formData.swift_bic}
              onChange={(e) => setFormData({ ...formData, swift_bic: e.target.value.toUpperCase() })}
              placeholder="e.g. CHASUS33"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ minWidth: '160px' }}>
              <Building2 size={16} /> {saving ? t('common.saving') : t('payments.saveBankBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
