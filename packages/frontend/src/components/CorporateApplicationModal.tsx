import React, { useState } from 'react';
import { Building2, X, CheckCircle2, Send } from 'lucide-react';
import { useLanguage } from '../i18n';
import '../styles/home.css';

interface CorporateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyName?: string;
  defaultEmail?: string;
}

export const CorporateApplicationModal: React.FC<CorporateApplicationModalProps> = ({
  isOpen,
  onClose,
  defaultCompanyName = '',
  defaultEmail = '',
}) => {
  const { t } = useLanguage();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_name: defaultCompanyName,
    contact_name: '',
    phone: '',
    email: defaultEmail,
    sector: '',
    branch_count: 2,
    message: '',
    _hp: '', // honeypot anti-spam
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot spam check
    if (form._hp) {
      setSuccess(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/corporate-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name.trim(),
          contact_name: form.contact_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          sector: form.sector.trim(),
          branch_count: Number(form.branch_count) || 1,
          message: form.message.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Başvuru gönderilirken bir hata oluştu');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Başvuru gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (success) {
      setSuccess(false);
      setForm({
        company_name: defaultCompanyName,
        contact_name: '',
        phone: '',
        email: defaultEmail,
        sector: '',
        branch_count: 2,
        message: '',
        _hp: '',
      });
    }
    setError(null);
  };

  return (
    <div className="corporate-modal-backdrop" onClick={handleClose}>
      <div className="corporate-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="corporate-modal-close-btn"
          onClick={handleClose}
          aria-label={t('common.close')}
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="corporate-success-view">
            <div className="corporate-success-icon-wrap">
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
              {t('home.applicationSuccessTitle')}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 2rem' }}>
              {t('home.applicationSuccessDesc')}
            </p>
            <button
              type="button"
              className="home-btn-primary"
              style={{ minWidth: 160 }}
              onClick={handleClose}
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ paddingRight: '2rem' }}>
              <div className="home-corporate-tag" style={{ marginBottom: '0.75rem' }}>
                <Building2 size={14} />
                <span>{t('home.corporateBadge')}</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                {t('home.corporateModalTitle')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                {t('home.corporateModalSubtitle')}
              </p>
            </div>

            {error && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.85rem 1rem',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '0.88rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Honeypot field for spam prevention */}
              <input
                type="text"
                name="_hp"
                value={form._hp}
                onChange={(e) => setForm({ ...form, _hp: e.target.value })}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="corporate-form-grid">
                <div>
                  <label className="corporate-form-label">
                    {t('home.companyName')} *
                  </label>
                  <input
                    type="text"
                    required
                    className="corporate-form-input"
                    placeholder="Örn: BigChefs Grubu, Sunset Hospitality"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="corporate-form-label">
                    {t('home.contactName')} *
                  </label>
                  <input
                    type="text"
                    required
                    className="corporate-form-input"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="corporate-form-label">
                    {t('home.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    className="corporate-form-input"
                    placeholder="+90 5XX XXX XX XX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="corporate-form-label">
                    {t('home.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    className="corporate-form-input"
                    placeholder="yetkili@sirket.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="corporate-form-label">
                    {t('home.sector')} *
                  </label>
                  <input
                    type="text"
                    required
                    className="corporate-form-input"
                    placeholder="Restoran, Otel, Kafe, Kuaför, Vale..."
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  />
                </div>

                <div>
                  <label className="corporate-form-label">
                    {t('home.branchCount')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="corporate-form-input"
                    placeholder="Örn: 5"
                    value={form.branch_count}
                    onChange={(e) => setForm({ ...form, branch_count: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="corporate-form-field-full">
                  <label className="corporate-form-label">
                    {t('home.needsMessage')}
                  </label>
                  <textarea
                    className="corporate-form-textarea"
                    placeholder="Özel entegrasyon talepleriniz, şube yapınız veya sormak istedikleriniz..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="corporate-form-submit-btn"
              >
                {submitting ? (
                  <span>{t('common.loading')}</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{t('home.submitApplication')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
