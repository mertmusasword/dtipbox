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
  AlertCircle,
  HelpCircle,
  Check,
  Copy,
} from 'lucide-react';
import { useLanguage } from '../../i18n';

export const PaymentSettingsPage: React.FC = () => {
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
  const [country, setCountry] = useState('TR');
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
          setCountry(data.paymentAccount.country || 'TR');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || (language === 'tr' ? 'Ödeme ayarları yüklenemedi' : 'Failed to load payment settings'));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save External Payment URL
  const handleSaveExternalUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = externalPaymentUrl.trim();

    if (trimmed && !trimmed.toLowerCase().startsWith('https://')) {
      showToast(
        language === 'tr'
          ? 'Güvenlik nedeniyle ödeme bağlantısı zorunlu olarak "https://" ile başlamalıdır.'
          : 'Payment link must start with secure "https://"',
        'error'
      );
      return;
    }

    try {
      setSavingUrl(true);
      await api.put('/business/payment-settings', {
        externalPaymentUrl: trimmed || null,
      });
      showToast(language === 'tr' ? 'Güvenli ödeme bağlantısı kaydedildi!' : 'External payment link saved!');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || (language === 'tr' ? 'Kayıt başarısız oldu' : 'Failed to save'), 'error');
    } finally {
      setSavingUrl(false);
    }
  };

  // Test / Preview External Payment URL
  const handleTestLink = () => {
    const trimmed = externalPaymentUrl.trim();
    if (!trimmed || !trimmed.toLowerCase().startsWith('https://')) {
      showToast(language === 'tr' ? 'Lütfen geçerli bir https:// bağlantısı giriniz.' : 'Please enter a valid https:// URL.', 'error');
      return;
    }
    window.open(trimmed, '_blank', 'noopener,noreferrer');
  };

  // Save Direct Bank Transfer (IBAN)
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountHolderName.trim() && !iban.trim()) {
      showToast(language === 'tr' ? 'Lütfen hesap sahibi ve IBAN giriniz.' : 'Please enter account holder name and IBAN.', 'error');
      return;
    }

    try {
      setSavingBank(true);
      await api.post('/business/payment-account', {
        account_holder_name: accountHolderName.trim(),
        bank_name: bankName.trim() || undefined,
        iban: iban.trim().replace(/\s+/g, '') || undefined,
        country: country || 'TR',
      });
      showToast(language === 'tr' ? 'Banka (IBAN) bilgileri kaydedildi!' : 'Bank account details saved!');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || (language === 'tr' ? 'Kayıt başarısız oldu' : 'Failed to save'), 'error');
    } finally {
      setSavingBank(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message={language === 'tr' ? 'Ödeme ayarları yükleniyor...' : 'Loading payment settings...'} />
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
          <h1 className="page-title">{language === 'tr' ? 'Ödeme Ayarları' : 'Payment Settings'}</h1>
          <p className="page-subtitle mb-0">
            {language === 'tr'
              ? 'Müşterilerinizin bahşiş ödemelerini doğrudan işletmenize yapmasını sağlayacak bağlantı ve hesap ayarları.'
              : 'Configure your direct checkout links and bank account for seamless, non-custodial tipping.'}
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
            {language === 'tr' ? 'Naponi ödeme almaz.' : 'Naponi does not collect or hold funds.'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.55 }}>
            {language === 'tr'
              ? 'Müşterileriniz ödeme yapmak istediğinde doğrudan işletmenizin belirlediği güvenli ödeme sayfasına veya banka hesabınıza yönlendirilir. Ödeme, seçtiğiniz ödeme sağlayıcısı veya banka hesabınız üzerinden gerçekleşir. Naponi müşteri kart bilgilerini almaz ve müşteri parasını kendi hesabında tutmaz.'
              : 'When guests tip, they are directed straight to your designated secure checkout link or direct bank account. Payment occurs through your provider or bank. Naponi never collects or stores card details and never holds customer funds.'}
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
                  {language === 'tr' ? '1. Harici Güvenli Ödeme Bağlantısı' : '1. External Secure Payment Link'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {language === 'tr' ? 'Kartlı ödemeler için işletmenizin checkout linki' : 'Your hosted checkout link for card payments'}
                </span>
              </div>
            </div>

            {externalPaymentUrl ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> {language === 'tr' ? 'Aktif' : 'Active'}
              </span>
            ) : (
              <span className="badge badge-neutral">
                {language === 'tr' ? 'Tanımlanmadı' : 'Not configured'}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {language === 'tr'
              ? 'Kullandığınız ödeme sağlayıcısından (PayTR, iyzico, Stripe Payment Link, SumUp veya işletmenize ait güvenli ödeme sayfası) aldığınız bağlantıyı buraya girin. Müşterileriniz kartla bahşiş vermek istediğinde aynı sekmede doğrudan bu bağlantıya yönlendirilir.'
              : 'Enter the hosted checkout link provided by your payment provider (e.g. Stripe Payment Link, PayTR, iyzico, SumUp, or your own secure checkout). Tipping guests will be forwarded directly to this link.'}
          </p>

          <form onSubmit={handleSaveExternalUrl}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {language === 'tr' ? 'Güvenli Ödeme Bağlantınız' : 'Secure Payment Link URL'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  placeholder="https://odeme-sayfaniz.com/link..."
                  value={externalPaymentUrl}
                  onChange={(e) => setExternalPaymentUrl(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.9rem', paddingRight: '6rem' }}
                />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                {language === 'tr'
                  ? '🔒 Güvenlik gereği sadece "https://" ile başlayan güvenli bağlantılar kabul edilir.'
                  : '🔒 For security, only URLs beginning with "https://" are permitted.'}
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
                {savingUrl ? (language === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (language === 'tr' ? 'Bağlantıyı Kaydet' : 'Save Link')}
              </button>

              {externalPaymentUrl && (
                <button
                  type="button"
                  onClick={handleTestLink}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <ExternalLink size={16} />
                  {language === 'tr' ? 'Bağlantıyı Test Et' : 'Test Link'}
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
                  {language === 'tr' ? 'Bağlantıyı Temizle' : 'Clear'}
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
                  {language === 'tr' ? '2. Doğrudan Banka Transferi (IBAN)' : '2. Direct Bank Transfer (IBAN)'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {language === 'tr' ? 'İşletmenizin banka hesabına havale / FAST' : 'Direct bank transfer to venue account'}
                </span>
              </div>
            </div>

            {iban ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> {language === 'tr' ? 'Aktif' : 'Active'}
              </span>
            ) : (
              <span className="badge badge-neutral">
                {language === 'tr' ? 'Tanımlanmadı' : 'Not configured'}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {language === 'tr'
              ? 'Bahşişleri doğrudan işletmenizin banka hesabına almak için IBAN bilginizi ekleyin. Müşterileriniz doğrudan sizin banka hesabınıza transfer yapar. Naponi para transferi yapmaz veya tutmaz.'
              : 'Add your IBAN details for direct bank transfers (wire/FAST). Guests transfer directly to your venue bank account. Naponi does not touch or mediate the funds.'}
          </p>

          <form onSubmit={handleSaveBankDetails}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group mb-0">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  {language === 'tr' ? 'Hesap Sahibi (Alıcı Adı)' : 'Account Holder Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Grand Bistro Cafe Ltd. Şti."
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  {language === 'tr' ? 'Banka Adı' : 'Bank Name'}
                </label>
                <input
                  type="text"
                  placeholder="Örn: Garanti BBVA, İş Bankası, Chase..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {language === 'tr' ? 'IBAN Numarası' : 'IBAN / Account Number'} *
              </label>
              <input
                type="text"
                required
                placeholder="TR00 0000 0000 0000 0000 0000 00"
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
              {savingBank ? (language === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (language === 'tr' ? 'Banka Bilgilerini Kaydet' : 'Save Bank Details')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
