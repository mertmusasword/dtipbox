import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Business } from '../../types';
import { CheckCircle2, Settings as SettingsIcon } from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    country: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
    locale: 'en-US',
    phone: '',
    email: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    api
      .get('/business')
      .then((res) => {
        if (res.data.data) {
          setBusiness(res.data.data);
          setFormData({
            name: res.data.data.name || '',
            logo: res.data.data.logo || '',
            country: res.data.data.country || 'US',
            currency: res.data.data.currency || 'USD',
            timezone: res.data.data.timezone || 'America/New_York',
            locale: res.data.data.locale || 'en-US',
            phone: res.data.data.phone || '',
            email: res.data.data.email || '',
            address: res.data.data.address || '',
            description: res.data.data.description || '',
          });
        }
      })
      .catch((err) => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await api.put('/business', formData);
      setBusiness(res.data.data);
      setSuccessMsg('Business settings updated successfully.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper"><div style={{ color: 'var(--text-secondary)' }}>Loading settings...</div></div>;
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Business Profile & Settings</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Manage your brand identity, contact details, and localization preferences
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

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Establishment Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Logo Image URL</label>
          <input
            type="url"
            placeholder="https://..."
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            className="form-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Country Code</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Operating Currency</label>
            <input
              type="text"
              required
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Timezone</label>
            <input
              type="text"
              required
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Public Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Public Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Physical Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Short Description / Customer Greeting</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-textarea"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            {saving ? 'Saving...' : 'Update Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
