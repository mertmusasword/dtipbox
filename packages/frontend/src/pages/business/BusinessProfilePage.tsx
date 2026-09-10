import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { Business } from '../../types';
import { useToast } from '../../components/Toast';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useLanguage } from '../../i18n';
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Coins,
  FileText,
  CheckCircle2,
  Edit3,
  Save,
  X,
} from 'lucide-react';

export const BusinessProfilePage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    country: '',
    currency: '',
    timezone: '',
    locale: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  });

  const loadBusiness = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/business')
      .then((res) => {
        const data = res.data.data;
        setBusiness(data);
        setFormData({
          name: data.name || '',
          logo: data.logo || '',
          country: data.country || '',
          currency: data.currency || '',
          timezone: data.timezone || '',
          locale: data.locale || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          description: data.description || '',
        });
      })
      .catch(() => setError('Failed to load business profile'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/business', formData);
      setBusiness(res.data.data);
      setEditing(false);
      showToast('Business profile updated successfully');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (business) {
      setFormData({
        name: business.name || '',
        logo: business.logo || '',
        country: business.country || '',
        currency: business.currency || '',
        timezone: business.timezone || '',
        locale: business.locale || '',
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        description: business.description || '',
      });
    }
    setEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message="Loading business profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <ErrorState message={error} onRetry={loadBusiness} />
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('business.profileTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('business.profileSubtitle')}
          </p>
        </div>
        <div className="page-header-actions">
          {editing ? (
            <>
              <button className="btn btn-secondary" onClick={handleCancel}>
                <X size={16} /> {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? t('common.saving') : t('common.save')}
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <Edit3 size={16} /> {t('common.edit')}
            </button>
          )}
        </div>
      </div>

      {/* Business Identity Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Logo */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-lg)',
              background: business?.logo
                ? `url(${business.logo}) center/cover`
                : 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}
          >
            {!business?.logo && (
              <Building2 size={36} color="#fff" />
            )}
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            {editing ? (
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="form-input"
                style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}
              />
            ) : (
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                {business?.name}
              </h2>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-accent">
                <Globe size={12} /> {business?.country}
              </span>
              <span className="badge badge-info">
                <Coins size={12} /> {business?.currency}
              </span>
              <span className="badge badge-neutral">
                <Clock size={12} /> {business?.timezone}
              </span>
              <span className={`badge ${business?.is_active ? 'badge-success' : 'badge-danger'}`}>
                {business?.is_active ? `● ${t('common.active')}` : `● ${t('common.inactive')}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      {editing ? (
        <form onSubmit={handleSave}>
          {/* Brand */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <Building2 size={20} className="section-icon" />
              <h3 className="section-title">Brand & Identity</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Logo Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                className="form-input"
              />
              <div className="form-hint">Provide a direct link to your business logo (square recommended)</div>
            </div>

            <div className="form-grid form-grid-3">
              <div className="form-group mb-0">
                <label className="form-label">Country Code</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value.toUpperCase())}
                  className="form-input"
                  placeholder="US"
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Currency</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
                  className="form-input"
                  placeholder="USD"
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Timezone</label>
                <input
                  type="text"
                  required
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="form-input"
                  placeholder="America/New_York"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <Phone size={20} className="section-icon" />
              <h3 className="section-title">Contact Information</h3>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group mb-0">
                <label className="form-label">Public Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="form-input"
                  placeholder="contact@business.com"
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="form-group mt-2 mb-0">
              <label className="form-label">Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="form-input"
                placeholder="123 Main Street, Suite 4B, New York, NY 10001"
              />
            </div>
          </div>

          {/* Description */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <FileText size={20} className="section-icon" />
              <h3 className="section-title">Description & Greeting</h3>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Customer-Facing Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="form-textarea"
                placeholder="A short description that customers see when they scan your QR code..."
              />
              <div className="form-hint">This text is displayed on your public tip page</div>
            </div>
          </div>
        </form>
      ) : (
        /* Read-only view */
        <>
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <Phone size={20} className="section-icon" />
              <h3 className="section-title">Contact & Location</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              <InfoItem icon={<Mail size={16} />} label="Email" value={business?.email || '—'} />
              <InfoItem icon={<Phone size={16} />} label="Phone" value={business?.phone || '—'} />
              <InfoItem icon={<MapPin size={16} />} label="Address" value={business?.address || '—'} />
              <InfoItem icon={<Globe size={16} />} label="Locale" value={business?.locale || 'en-US'} />
            </div>
          </div>

          {business?.description && (
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <div className="section-header">
                <FileText size={20} className="section-icon" />
                <h3 className="section-title">Customer Greeting</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.925rem' }}>
                {business.description}
              </p>
            </div>
          )}

          {/* Payment Account Status */}
          <div className="glass-card">
            <div className="section-header">
              <CheckCircle2 size={20} className="section-icon" />
              <h3 className="section-title">Setup Completion</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <SetupItem done label="Business Profile Created" />
              <SetupItem done={!!business?.email} label="Contact Email Added" />
              <SetupItem done={!!business?.address} label="Physical Address Added" />
              <SetupItem done={!!business?.description} label="Customer Greeting Added" />
              <SetupItem done={!!business?.payment_account} label="Payment Account Configured" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
    <div style={{ color: 'var(--text-muted)', marginTop: '0.1rem', flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.15rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.925rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  </div>
);

const SetupItem: React.FC<{ done: boolean; label: string }> = ({ done, label }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <div style={{
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: done ? 'var(--success-bg)' : 'rgba(255,255,255,0.05)',
      border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-color)',
      flexShrink: 0,
    }}>
      {done && <CheckCircle2 size={14} color="#34d399" />}
    </div>
    <span style={{ fontSize: '0.875rem', color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
  </div>
);
