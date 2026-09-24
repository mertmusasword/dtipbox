import React, { useState, useEffect } from 'react';
import { Headphones, X, CheckCircle2, Send } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import '../styles/home.css';

export type SupportCategory =
  | 'POS_INTEGRATION'
  | 'TECHNICAL_SUPPORT'
  | 'ACCOUNT_BILLING'
  | 'GENERAL_INQUIRY'
  | 'FEEDBACK_SUGGESTION'
  | 'TIP_PAYOUT'
  | 'QR_PROFILE';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: SupportCategory;
  initialSubject?: string;
  defaultBusinessName?: string;
  defaultEmail?: string;
  defaultName?: string;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  initialSubject = '',
  defaultBusinessName = '',
  defaultEmail = '',
  defaultName = '',
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isEmployee = user?.role === 'EMPLOYEE';

  const defaultCategory: SupportCategory = initialCategory || (isEmployee ? 'TIP_PAYOUT' : 'POS_INTEGRATION');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: defaultName || (user ? user.email.split('@')[0] : ''),
    email: defaultEmail || user?.email || '',
    phone: '',
    business_name: defaultBusinessName || user?.business?.name || '',
    category: defaultCategory,
    subject: initialSubject,
    message: '',
    _hp: '', // Honeypot spam trap
  });

  // Keep form updated when initialCategory or initialSubject props change
  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        category: initialCategory || (isEmployee ? 'TIP_PAYOUT' : prev.category || 'POS_INTEGRATION'),
        subject: initialSubject || prev.subject,
        business_name: defaultBusinessName || user?.business?.name || prev.business_name,
        email: defaultEmail || user?.email || prev.email,
        name: defaultName || (user ? user.email.split('@')[0] : prev.name),
      }));
    }
  }, [isOpen, initialCategory, initialSubject, defaultBusinessName, defaultEmail, defaultName, user, isEmployee]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (form._hp) {
      setSuccess(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/support-tickets', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        business_name: form.business_name.trim() || undefined,
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
        website_url_hp: form._hp || undefined,
      });

      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t('common.error');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (success) {
      setSuccess(false);
      setForm({
        name: user?.email?.split('@')[0] || '',
        email: user?.email || '',
        phone: '',
        business_name: user?.business?.name || '',
        category: defaultCategory,
        subject: '',
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
              {t('support.successTitle')}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 2rem' }}>
              {t('support.successDesc')}
            </p>
            <button
              type="button"
              className="home-btn-primary"
              style={{ minWidth: 160 }}
              onClick={handleClose}
            >
              {t('support.closeBtn')}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ paddingRight: '2rem' }}>
              <div className="home-corporate-tag" style={{ marginBottom: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8' }}>
                <Headphones size={14} />
                <span>{t('support.widgetBtn')}</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                {isEmployee ? (language === 'tr' ? 'Personel Destek Masası' : 'Staff Support Desk') : t('support.modalTitle')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                {isEmployee
                  ? (language === 'tr'
                    ? 'Bahşiş hakedişleriniz, QR profiliniz veya teknik konularla ilgili destek talebi oluşturun. Ekibimiz en kısa sürede size ulaşacaktır.'
                    : 'Submit a ticket regarding your tips, payouts, QR profile or technical issues.')
                  : t('support.modalSubtitle')}
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
              {/* Honeypot field for anti-bot spam */}
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
                    {t('support.name')} *
                  </label>
                  <input
                    type="text"
                    required
                    className="corporate-form-input"
                    placeholder={t('support.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="corporate-form-label">
                    {t('support.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    className="corporate-form-input"
                    placeholder={t('support.emailPlaceholder')}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="corporate-form-label">
                    {t('support.phone')}
                  </label>
                  <input
                    type="tel"
                    className="corporate-form-input"
                    placeholder={t('support.phonePlaceholder')}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                {isEmployee ? (
                  <div>
                    <label className="corporate-form-label">
                      {language === 'tr' ? 'Bağlı İşletme' : 'Assigned Venue'}
                    </label>
                    <input
                      type="text"
                      disabled
                      className="corporate-form-input"
                      value={form.business_name || user?.business?.name || (language === 'tr' ? 'Mevcut İşletmeniz' : 'Your Venue')}
                      style={{ opacity: 0.75, cursor: 'not-allowed', background: 'rgba(15, 23, 42, 0.5)' }}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="corporate-form-label">
                      {t('support.businessName')}
                    </label>
                    <input
                      type="text"
                      className="corporate-form-input"
                      placeholder={t('support.businessNamePlaceholder')}
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    />
                  </div>
                )}

                <div className="corporate-form-field-full">
                  <label className="corporate-form-label">
                    {t('support.category')} *
                  </label>
                  <select
                    className="corporate-form-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as SupportCategory })}
                    style={{ cursor: 'pointer' }}
                  >
                    {isEmployee ? (
                      <>
                        <option value="TIP_PAYOUT" style={{ background: '#0f172a', color: '#fff' }}>
                          💰 {t('support.categoryPayout')}
                        </option>
                        <option value="QR_PROFILE" style={{ background: '#0f172a', color: '#fff' }}>
                          🪪 {t('support.categoryProfile')}
                        </option>
                        <option value="TECHNICAL_SUPPORT" style={{ background: '#0f172a', color: '#fff' }}>
                          🛠️ {t('support.categoryTech')}
                        </option>
                        <option value="GENERAL_INQUIRY" style={{ background: '#0f172a', color: '#fff' }}>
                          💬 {t('support.categoryGeneral')}
                        </option>
                        <option value="FEEDBACK_SUGGESTION" style={{ background: '#0f172a', color: '#fff' }}>
                          ✨ {t('support.categoryFeedback')}
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="POS_INTEGRATION" style={{ background: '#0f172a', color: '#fff' }}>
                          💳 {t('support.categoryPos')}
                        </option>
                        <option value="TECHNICAL_SUPPORT" style={{ background: '#0f172a', color: '#fff' }}>
                          🛠️ {t('support.categoryTech')}
                        </option>
                        <option value="ACCOUNT_BILLING" style={{ background: '#0f172a', color: '#fff' }}>
                          📄 {t('support.categoryAccount')}
                        </option>
                        <option value="GENERAL_INQUIRY" style={{ background: '#0f172a', color: '#fff' }}>
                          💬 {t('support.categoryGeneral')}
                        </option>
                        <option value="FEEDBACK_SUGGESTION" style={{ background: '#0f172a', color: '#fff' }}>
                          ✨ {t('support.categoryFeedback')}
                        </option>
                      </>
                    )}
                  </select>
                </div>

                <div className="corporate-form-field-full">
                  <label className="corporate-form-label">
                    {t('support.subject')} *
                  </label>
                  <input
                    type="text"
                    required
                    className="corporate-form-input"
                    placeholder={t('support.subjectPlaceholder')}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                <div className="corporate-form-field-full">
                  <label className="corporate-form-label">
                    {t('support.message')} *
                  </label>
                  <textarea
                    required
                    className="corporate-form-textarea"
                    placeholder={t('support.messagePlaceholder')}
                    rows={4}
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
                  <span>{t('support.submitting')}</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{t('support.submitBtn')}</span>
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
