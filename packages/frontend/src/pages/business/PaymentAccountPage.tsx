import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { BusinessPaymentAccount } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import { Building2, ShieldCheck } from 'lucide-react';

export const PaymentAccountPage: React.FC = () => {
  const { showToast } = useToast();
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
      .catch(() => setError('Failed to load bank account'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.post('/business/payment-account', formData);
      setAccount(res.data.data);
      showToast('Payment account saved. IBAN payment channel is ready to activate.');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save account details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message="Loading bank configuration..." />
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
          <h1 className="page-title">Business Payment Account</h1>
          <p className="page-subtitle mb-0">
            Direct settlement destination for all tips received by your establishment
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header">
          <ShieldCheck size={20} className="section-icon" />
          <h3 className="section-title">Direct Settlement Security</h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          D-TIPBOX never holds, pools, or acts as a wallet for customer funds. All digital tips transfer directly into your business bank account or linked payment provider. Individual staff members do not have private bank accounts attached.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-grid form-grid-2">
          <div className="form-group mb-0">
            <label className="form-label">Bank Country</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
              placeholder="e.g. US, DE, GB, TR"
              className="form-input"
            />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Account Holder / Entity Name</label>
            <input
              type="text"
              required
              value={formData.account_holder_name}
              onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
              placeholder="e.g. Acme Hospitality LLC"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group mb-0">
          <label className="form-label">Bank Name</label>
          <input
            type="text"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            placeholder="e.g. JPMorgan Chase, Barclays, Deutsche Bank"
            className="form-input"
          />
        </div>

        <div className="form-group mb-0">
          <label className="form-label">IBAN (International Bank Account Number)</label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            placeholder="e.g. GB29NWBK60161331926819 or TR33..."
            className="form-input"
          />
        </div>

        <div className="form-grid form-grid-2">
          <div className="form-group mb-0">
            <label className="form-label">Local Account Number (non-IBAN regions)</label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              placeholder="e.g. 123456789"
              className="form-input"
            />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Routing Number / Sort Code</label>
            <input
              type="text"
              value={formData.routing_number || formData.sort_code}
              onChange={(e) => setFormData({ ...formData, routing_number: e.target.value, sort_code: e.target.value })}
              placeholder="e.g. 021000021"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group mb-0">
          <label className="form-label">SWIFT / BIC Code (for cross-border routing)</label>
          <input
            type="text"
            value={formData.swift_bic}
            onChange={(e) => setFormData({ ...formData, swift_bic: e.target.value })}
            placeholder="e.g. CHASUS33"
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
            {saving ? 'Saving...' : 'Save Bank Details'}
          </button>
        </div>
      </form>
    </div>
  );
};
