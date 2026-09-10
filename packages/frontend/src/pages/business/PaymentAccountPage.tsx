import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BusinessPaymentAccount } from '../../types';
import { Building2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const PaymentAccountPage: React.FC = () => {
  const [account, setAccount] = useState<BusinessPaymentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  useEffect(() => {
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
      .catch((err) => console.error('Failed to load bank account:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await api.post('/business/payment-account', formData);
      setAccount(res.data.data);
      setSuccessMsg('Payment account details saved successfully. IBAN/Bank payment channel is now ready to activate.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save account details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper"><div style={{ color: 'var(--text-secondary)' }}>Loading bank configuration...</div></div>;
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Business Payment Account</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Direct settlement destination for all tips received by your establishment
        </p>
      </div>

      {successMsg && (
        <div style={{
          background: 'var(--success-bg)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <ShieldCheck size={22} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Direct Settlement Security</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          D-TIPBOX never holds, pools, or acts as a wallet for customer funds. All digital tips transfer directly into your business bank account or linked payment provider. Individual staff members do not have private bank accounts attached.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
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
          <div className="form-group" style={{ marginBottom: 0 }}>
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

        <div className="form-group">
          <label className="form-label">Bank Name</label>
          <input
            type="text"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            placeholder="e.g. JPMorgan Chase, Barclays, Deutsche Bank"
            className="form-input"
          />
        </div>

        {/* Global Bank Details: Both IBAN and Account/Routing supported */}
        <div className="form-group">
          <label className="form-label">IBAN (International Bank Account Number — if applicable)</label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            placeholder="e.g. GB29NWBK60161331926819 or TR33..."
            className="form-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Local Account Number (non-IBAN regions)</label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              placeholder="e.g. 123456789"
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Routing Number / Sort Code / BLZ</label>
            <input
              type="text"
              value={formData.routing_number || formData.sort_code}
              onChange={(e) => setFormData({ ...formData, routing_number: e.target.value, sort_code: e.target.value })}
              placeholder="e.g. 021000021"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
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
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            {saving ? 'Saving...' : 'Save Bank Details'}
          </button>
        </div>
      </form>
    </div>
  );
};
