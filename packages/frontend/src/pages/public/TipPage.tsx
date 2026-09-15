import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../../api/client';
import { TipPageDetails, PaymentMethodType } from '../../types';
import {
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Heart,
  Copy,
  Check,
  Star,
  Wifi,
  Gift,
  MessageSquareText,
  Mail,
  QrCode as QrIcon,
  ShieldCheck,
  Tag,
  Send,
  Lock,
} from 'lucide-react';
import { useLanguage, LanguageSelector } from '../../i18n';
import {
  trackQrScanned,
  trackTipFlowStarted,
  trackTipAmountSelected,
  trackPaymentStarted,
  trackPaymentSuccess,
  trackPaymentFailed,
} from '../../analytics';

export type SmartTab = 'tip' | 'wifi' | 'campaigns' | 'feedback' | 'signup';

export const TipPage: React.FC = () => {
  const { publicToken } = useParams<{ publicToken: string }>();
  const { t, formatCurrency, dir, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<TipPageDetails | null>(null);

  // Smart QR Navigation State
  const [activeSmartTab, setActiveSmartTab] = useState<SmartTab>('tip');
  const [wifiQrUrl, setWifiQrUrl] = useState<string>('');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Standalone Feedback State (from Smart QR Hub)
  const [standaloneRating, setStandaloneRating] = useState<number>(0);
  const [standaloneHover, setStandaloneHover] = useState<number>(0);
  const [standaloneComment, setStandaloneComment] = useState('');
  const [standaloneSubmitting, setStandaloneSubmitting] = useState(false);
  const [standaloneSubmitted, setStandaloneSubmitted] = useState(false);

  // Standalone VIP Lead Signup State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');

  // Processing & Confirmation State
  const [submitting, setSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);

  // Post-tip Feedback State
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackSkipped, setFeedbackSkipped] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    setLoading(true);
    api
      .get(`/tip/${publicToken}`)
      .then((res) => {
        const d: TipPageDetails = res.data.data;
        setDetails(d);
        trackQrScanned(publicToken, d.business?.currency);
        trackTipFlowStarted(d.business?.currency, (d.employees?.length || 0) > 0);
        if (d.presetAmounts?.length > 0) {
          setSelectedAmount(d.presetAmounts[1] || d.presetAmounts[0]);
        }
        if (d.activePaymentMethods?.length > 0) {
          setSelectedPaymentMethod(d.activePaymentMethods[0].type);
        }

        // Auto-select first available tab if tips disabled
        const sq = d.smartQr;
        if (sq?.isSmartEnabled) {
          if (sq.enableTips === false) {
            if (sq.enableWifi) setActiveSmartTab('wifi');
            else if (sq.enableCampaigns) setActiveSmartTab('campaigns');
            else if (sq.enableFeedback) setActiveSmartTab('feedback');
            else if (sq.enableSignup) setActiveSmartTab('signup');
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || t('tip.invalidQr'));
      })
      .finally(() => setLoading(false));
  }, [publicToken, t]);

  // Generate Wi-Fi QR Code if credentials available
  useEffect(() => {
    if (details?.smartQr?.enableWifi && details.smartQr.wifiSsid) {
      const enc = details.smartQr.wifiEncryption || 'WPA';
      const pwd = details.smartQr.wifiPassword || '';
      const wifiString = `WIFI:T:${enc};S:${details.smartQr.wifiSsid};P:${pwd};;`;
      QRCode.toDataURL(wifiString, {
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then(setWifiQrUrl)
        .catch(() => {});
    }
  }, [details?.smartQr?.enableWifi, details?.smartQr?.wifiSsid, details?.smartQr?.wifiPassword, details?.smartQr?.wifiEncryption]);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      alert(t('tip.noPaymentMethods'));
      return;
    }
    if (effectiveAmount <= 0) {
      alert(t('tip.selectAmountTitle'));
      return;
    }

    trackPaymentStarted(selectedPaymentMethod, effectiveAmount, details?.business?.currency || 'USD');
    setSubmitting(true);
    try {
      const res = await api.post(`/tip/${publicToken}`, {
        employeeId: selectedEmployeeId || undefined,
        amount: effectiveAmount,
        paymentMethod: selectedPaymentMethod,
        customerName: customerName.trim() || undefined,
        customerMessage: customerMessage.trim() || undefined,
      });
      trackPaymentSuccess(
        res.data.data?.tip?.payment_method || selectedPaymentMethod,
        res.data.data?.tip?.id,
        effectiveAmount,
        details?.business?.currency || 'USD'
      );
      setPaymentResult(res.data.data);
    } catch (err: any) {
      trackPaymentFailed(selectedPaymentMethod, err.response?.data?.error || 'Payment failed');
      alert(err.response?.data?.error || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating < 1 || !publicToken) return;
    setFeedbackSubmitting(true);
    try {
      await api.post(`/tip/${publicToken}/feedback`, {
        tipId: paymentResult?.tip?.id,
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      });
      setFeedbackSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.error || t('common.error'));
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleTabChange = (tab: SmartTab) => {
    setActiveSmartTab(tab);
    if (!publicToken) return;
    if (tab === 'wifi') {
      api.post(`/smart-qr/public/${publicToken}/event`, { event_type: 'WIFI_CLICK' }).catch(() => {});
    } else if (tab === 'campaigns') {
      api.post(`/smart-qr/public/${publicToken}/event`, { event_type: 'CAMPAIGN_CLICK' }).catch(() => {});
    } else if (tab === 'tip') {
      api.post(`/smart-qr/public/${publicToken}/event`, { event_type: 'TIP_CLICK' }).catch(() => {});
    }
  };

  const copyWifiPassword = (pwd: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedWifi(true);
    if (publicToken) {
      api.post(`/smart-qr/public/${publicToken}/event`, { event_type: 'WIFI_CLICK' }).catch(() => {});
    }
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    if (publicToken) {
      api.post(`/smart-qr/public/${publicToken}/event`, { event_type: 'CAMPAIGN_CLICK', metadata: { code } }).catch(() => {});
    }
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleStandaloneFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (standaloneRating < 1 || !publicToken) return;
    setStandaloneSubmitting(true);
    try {
      await api.post(`/smart-qr/public/${publicToken}/feedback`, {
        rating: standaloneRating,
        comment: standaloneComment.trim() || undefined,
      });
      setStandaloneSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.error || t('common.error'));
    } finally {
      setStandaloneSubmitting(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!leadEmail && !leadPhone) || !publicToken) {
      alert(language === 'tr' ? 'Lütfen e-posta veya telefon giriniz.' : 'Please enter an email or phone number.');
      return;
    }
    setLeadSubmitting(true);
    try {
      await api.post(`/smart-qr/public/${publicToken}/lead`, {
        name: leadName.trim() || undefined,
        email: leadEmail.trim() || undefined,
        phone: leadPhone.trim() || undefined,
        consent_marketing: leadConsent,
      });
      setLeadSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.error || t('common.error'));
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin" size={36} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
          <div style={{ color: 'var(--text-secondary)' }}>{t('tip.loadingDetails')}</div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: dir === 'rtl' ? 'auto' : '1rem', left: dir === 'rtl' ? '1rem' : 'auto' }}>
          <LanguageSelector variant="compact" />
        </div>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('tip.invalidQr')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error || t('tip.inactiveBusiness')}</p>
          <Link to="/" className="btn btn-secondary">
            {t('tip.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  // --- Payment Confirmation Screen ---
  if (paymentResult) {
    const isIban =
      paymentResult.tip?.payment_method === 'IBAN_TRANSFER' ||
      paymentResult.payment?.paymentMethod === 'IBAN_TRANSFER' ||
      Boolean(paymentResult.payment?.ibanDetails);
    const ibanDetails = paymentResult.payment?.ibanDetails;
    const paymentStatus = paymentResult.payment?.status || paymentResult.tip?.status || (isIban ? 'UNVERIFIED' : 'SUCCESS');
    const isSuccess = paymentStatus === 'SUCCESS';
    const isFailed = paymentStatus === 'FAILED';
    const isCancelled = paymentStatus === 'CANCELLED';
    const isPending = paymentStatus === 'PENDING';
    const isUnverified = isIban || paymentStatus === 'UNVERIFIED';
    const paymentUrl = paymentResult.payment?.paymentUrl;

    return (
      <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: dir === 'rtl' ? 'auto' : '1rem', left: dir === 'rtl' ? '1rem' : 'auto' }}>
          <LanguageSelector variant="compact" />
        </div>

        <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          {/* Status Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isUnverified
              ? 'rgba(245, 158, 11, 0.15)'
              : isSuccess
              ? 'rgba(16, 185, 129, 0.15)'
              : isFailed
              ? 'rgba(239, 68, 68, 0.15)'
              : isCancelled
              ? 'rgba(107, 114, 128, 0.15)'
              : 'rgba(59, 130, 246, 0.15)',
            color: isUnverified
              ? '#f59e0b'
              : isSuccess
              ? '#10b981'
              : isFailed
              ? '#ef4444'
              : isCancelled
              ? '#9ca3af'
              : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            {isUnverified ? (
              <Building2 size={32} />
            ) : isSuccess ? (
              <CheckCircle2 size={32} />
            ) : isFailed ? (
              <AlertCircle size={32} />
            ) : isCancelled ? (
              <AlertCircle size={32} />
            ) : (
              <Sparkles size={32} />
            )}
          </div>

          {/* Status Title & Subtitle */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {isUnverified
              ? t('tip.transferInstructions')
              : isSuccess
              ? t('tip.successTitle')
              : isFailed
              ? 'Ödeme Tamamlanamadı'
              : isCancelled
              ? 'Ödeme İptal Edildi'
              : 'Ödeme Bekleniyor'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {isUnverified
              ? t('tip.bankNotice')
              : isSuccess
              ? t('tip.successSubtitle')
              : isFailed
              ? 'Ödeme işlemi onaylanamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.'
              : isCancelled
              ? 'Ödeme işlemi iptal edildi.'
              : paymentUrl
              ? 'Lütfen güvenli ödeme bağlantısını kullanarak ödemenizi tamamlayınız.'
              : 'Ödeme provizyonu bekleniyor.'}
          </p>

          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: dir === 'rtl' ? 'right' : 'left',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('common.amount')}:</span>
              <span style={{ fontWeight: 700 }}>
                {formatCurrency(paymentResult.tip.amount, details.business.currency)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('common.status')}:</span>
              <span className={`badge ${
                isSuccess
                  ? 'badge-success'
                  : isUnverified || isPending
                  ? 'badge-warning'
                  : isCancelled
                  ? 'badge-neutral'
                  : 'badge-danger'
              }`}>
                {isUnverified
                  ? 'Doğrulama Bekliyor (Banka Transferi)'
                  : isSuccess
                  ? t('common.success')
                  : isPending
                  ? 'İşlem Bekleniyor'
                  : isCancelled
                  ? 'İptal Edildi'
                  : 'Başarısız'}
              </span>
            </div>

            {isUnverified && ibanDetails && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('tip.accountHolder')}</div>
                  <div style={{ fontWeight: 600 }}>{ibanDetails.accountHolderName}</div>
                </div>
                {ibanDetails.iban && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('tip.ibanLabel')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <code style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ibanDetails.iban}</code>
                      <button type="button" onClick={() => copyToClipboard(ibanDetails.iban!)} style={{ color: 'var(--accent-primary)', padding: '4px' }}>
                        {copiedIban ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                {ibanDetails.bankName && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('tip.bankName')}</div>
                    <div style={{ fontWeight: 600 }}>{ibanDetails.bankName}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('tip.refCodeLabel')}</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{ibanDetails.referenceCode}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('tip.refCodeNotice')}</div>
                </div>
              </div>
            )}
          </div>

          {paymentUrl && isPending && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              Ödemeyi Tamamla <ArrowRight size={16} />
            </a>
          )}

          {/* Customer Feedback Card (Post-Tip) */}
          {(isSuccess || isUnverified) && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}>
              {feedbackSubmitted ? (
                <div style={{ padding: '0.5rem 0' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                  }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', color: '#10b981' }}>
                    {t('feedback.thankYouTitle')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {t('feedback.thankYouSubtitle')}
                  </p>
                </div>
              ) : feedbackSkipped ? null : (
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {t('feedback.satisfactionQuestion')}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {t('feedback.ratingLabel')}
                  </p>

                  {/* 1-5 Star Interactive Selector */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || feedbackRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'transform 0.15s ease',
                            transform: (hoverRating || feedbackRating) === star ? 'scale(1.15)' : 'scale(1)',
                          }}
                          aria-label={`${star} star`}
                        >
                          <Star
                            size={32}
                            style={{
                              color: isActive ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                              fill: isActive ? '#f59e0b' : 'transparent',
                              transition: 'all 0.15s ease',
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional comment textarea (appears once rating is selected) */}
                  {feedbackRating > 0 && (
                    <div style={{ marginBottom: '1rem', animation: 'fadeIn 0.2s ease-in-out' }}>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value.slice(0, 500))}
                        placeholder={t('feedback.commentPlaceholder')}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                          resize: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {feedbackComment.length}/500
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleFeedbackSubmit}
                      disabled={feedbackRating < 1 || feedbackSubmitting}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        opacity: feedbackRating < 1 ? 0.5 : 1,
                        cursor: feedbackRating < 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {feedbackSubmitting ? t('feedback.submitting') : t('feedback.submit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackSkipped(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        textDecoration: 'underline',
                      }}
                    >
                      {t('feedback.skip')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className={isSuccess || isUnverified ? "btn btn-primary" : "btn btn-secondary"}
            style={{ width: '100%' }}
            onClick={() => {
              setPaymentResult(null);
              setCustomAmount('');
              setFeedbackRating(0);
              setFeedbackComment('');
              setFeedbackSubmitted(false);
              setFeedbackSkipped(false);
            }}
          >
            {isSuccess || isUnverified ? 'Yeni Bir Bahşiş Gönder' : t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  // --- Main 4-Step Tip Form ---
  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Top Floating Language Selector */}
      <div style={{ alignSelf: 'flex-end', maxWidth: '480px', width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <LanguageSelector variant="compact" />
      </div>

      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Business Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {details.business.logo ? (
            <img
              src={details.business.logo}
              alt={details.business.name}
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '20px',
                margin: '0 auto 1rem',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            }}>
              <Heart size={30} />
            </div>
          )}
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            {details.business.name}
          </h1>
          {details.table && (
            <div className="badge badge-neutral" style={{ marginTop: '0.35rem' }}>
              {details.table.name}
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {t('home.heroHighlight')} • {t('tip.pageTitle')}
          </p>

          {/* Smart QR Custom Welcome Message */}
          {details.smartQr?.welcomeMessage && (
            <div style={{
              margin: '0.75rem auto 0',
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#e0e7ff',
              fontSize: '0.88rem',
              fontWeight: 500,
              maxWidth: '380px',
              lineHeight: 1.4,
            }}>
              ✨ {details.smartQr.welcomeMessage}
            </div>
          )}
        </div>

        {/* Smart QR Hub Navigation Tabs (Only rendered when multi-features are active) */}
        {(() => {
          const sq = details.smartQr;
          const isSmart = Boolean(sq?.isSmartEnabled);
          const hasWifi = Boolean(isSmart && sq?.enableWifi && sq?.wifiSsid);
          const hasCampaigns = Boolean(isSmart && sq?.enableCampaigns && (sq?.campaigns?.length || 0) > 0);
          const hasFeedback = Boolean(isSmart && sq?.enableFeedback);
          const hasSignup = Boolean(isSmart && sq?.enableSignup);
          const hasTips = sq?.enableTips !== false;
          const hasAnyExtra = hasWifi || hasCampaigns || hasFeedback || hasSignup;

          if (!hasAnyExtra) return null;

          return (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              marginBottom: '1.5rem',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {hasTips && (
                <button
                  type="button"
                  onClick={() => handleTabChange('tip')}
                  style={{
                    flex: '1 0 auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    background: activeSmartTab === 'tip'
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : 'rgba(255, 255, 255, 0.04)',
                    borderColor: activeSmartTab === 'tip' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                    color: activeSmartTab === 'tip' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: activeSmartTab === 'tip' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none',
                  }}
                >
                  <Star size={16} fill={activeSmartTab === 'tip' ? '#ffffff' : 'none'} />
                  {language === 'tr' ? 'Bahşiş' : 'Tip'}
                </button>
              )}

              {hasWifi && (
                <button
                  type="button"
                  onClick={() => handleTabChange('wifi')}
                  style={{
                    flex: '1 0 auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    background: activeSmartTab === 'wifi'
                      ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                      : 'rgba(255, 255, 255, 0.04)',
                    borderColor: activeSmartTab === 'wifi' ? '#0ea5e9' : 'rgba(255, 255, 255, 0.1)',
                    color: activeSmartTab === 'wifi' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: activeSmartTab === 'wifi' ? '0 4px 12px rgba(14, 165, 233, 0.35)' : 'none',
                  }}
                >
                  <Wifi size={16} />
                  Wi-Fi
                </button>
              )}

              {hasCampaigns && (
                <button
                  type="button"
                  onClick={() => handleTabChange('campaigns')}
                  style={{
                    flex: '1 0 auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    background: activeSmartTab === 'campaigns'
                      ? 'linear-gradient(135deg, #ec4899, #db2777)'
                      : 'rgba(255, 255, 255, 0.04)',
                    borderColor: activeSmartTab === 'campaigns' ? '#ec4899' : 'rgba(255, 255, 255, 0.1)',
                    color: activeSmartTab === 'campaigns' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: activeSmartTab === 'campaigns' ? '0 4px 12px rgba(236, 72, 153, 0.35)' : 'none',
                  }}
                >
                  <Gift size={16} />
                  {language === 'tr' ? 'Fırsatlar' : 'Offers'}
                  <span style={{
                    fontSize: '0.72rem',
                    background: activeSmartTab === 'campaigns' ? 'rgba(255,255,255,0.3)' : '#ec4899',
                    color: '#fff',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px',
                  }}>
                    {sq?.campaigns?.length}
                  </span>
                </button>
              )}

              {hasFeedback && (
                <button
                  type="button"
                  onClick={() => handleTabChange('feedback')}
                  style={{
                    flex: '1 0 auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    background: activeSmartTab === 'feedback'
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'rgba(255, 255, 255, 0.04)',
                    borderColor: activeSmartTab === 'feedback' ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                    color: activeSmartTab === 'feedback' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: activeSmartTab === 'feedback' ? '0 4px 12px rgba(245, 158, 11, 0.35)' : 'none',
                  }}
                >
                  <MessageSquareText size={16} />
                  {language === 'tr' ? 'Değerlendir' : 'Feedback'}
                </button>
              )}

              {hasSignup && (
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  style={{
                    flex: '1 0 auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    background: activeSmartTab === 'signup'
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'rgba(255, 255, 255, 0.04)',
                    borderColor: activeSmartTab === 'signup' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                    color: activeSmartTab === 'signup' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: activeSmartTab === 'signup' ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
                  }}
                >
                  <Mail size={16} />
                  VIP
                </button>
              )}
            </div>
          );
        })()}

        {/* TAB 1: TIPPING (PRESERVED COMPLETE ENGINE) */}
        {activeSmartTab === 'tip' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Step 1: Select Employee */}
            {details.employees.length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    1. {t('tip.selectStaffTitle')}
                  </span>
                  {selectedEmployeeId && (
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeId(undefined)}
                      style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}
                    >
                      {t('tip.wholeTeam')}
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.75rem',
                }}>
                  {details.employees.map((emp) => {
                    const isSelected = selectedEmployeeId === emp.id;
                    return (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedEmployeeId(emp.id)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)'}`,
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={emp.first_name}
                            style={{ width: '44px', height: '44px', borderRadius: '50%', margin: '0 auto 0.5rem', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem',
                            fontWeight: 700,
                          }}>
                            {emp.first_name[0]}
                          </div>
                        )}
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.first_name} {emp.last_name}</div>
                        {emp.position && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.position}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Amount */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
                2. {t('tip.selectAmountTitle')}
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {details.presetAmounts.map((amt) => {
                  const isSelected = selectedAmount === amt && !customAmount;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                        trackTipAmountSelected(amt, details.business.currency);
                      }}
                      style={{
                        padding: '0.85rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)'}`,
                        background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {formatCurrency(amt, details.business.currency)}
                    </button>
                  );
                })}
              </div>

              <div>
                <input
                  type="number"
                  placeholder={t('tip.customAmountLabel') || t('tip.customAmountPlaceholder') || '0.00'}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) {
                      trackTipAmountSelected(parseFloat(e.target.value) || 0, details.business.currency);
                    }
                  }}
                  className="input"
                  style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
                  min="1"
                />
              </div>
            </div>

            {/* Optional Note & Customer Info */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
                {t('tip.customerMessageLabel') || t('tip.optionalMessageTitle')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder={t('tip.customerNamePlaceholder') || t('tip.namePlaceholder')}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input"
                  maxLength={100}
                />
                <textarea
                  placeholder={t('tip.customerMessagePlaceholder') || t('tip.messagePlaceholder')}
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  className="input"
                  rows={2}
                  maxLength={500}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
                3. {t('tip.paymentMethodTitle')}
              </span>

              {!details.hasAvailablePaymentMethod ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#f59e0b' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('tip.noPaymentMethods')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {t('tip.noPaymentMethodsHelp')}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {['CARD', 'IBAN_TRANSFER', 'APPLE_PAY', 'GOOGLE_PAY'].map((methodKey) => {
                    const catalogItem = details.paymentMethodsCatalog?.find((c) => c.type === methodKey);
                    const isAvailable = catalogItem ? catalogItem.isUsable : details.activePaymentMethods.some((m) => m.type === methodKey);
                    const reason = catalogItem?.reason;
                    const isSelected = selectedPaymentMethod === methodKey;

                    let label = t('tip.creditCard');
                    let icon = <CreditCard size={18} />;
                    if (methodKey === 'IBAN_TRANSFER') {
                      label = t('tip.bankTransfer');
                      icon = <Building2 size={18} />;
                    } else if (methodKey === 'APPLE_PAY') {
                      label = t('tip.applePay');
                      icon = <Smartphone size={18} />;
                    } else if (methodKey === 'GOOGLE_PAY') {
                      label = t('tip.googlePay');
                      icon = <Smartphone size={18} />;
                    }

                    return (
                      <div
                        key={methodKey}
                        onClick={() => isAvailable && setSelectedPaymentMethod(methodKey as PaymentMethodType)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                          border: isSelected
                            ? '2px solid var(--accent-primary)'
                            : isAvailable
                            ? '1px solid var(--border-color)'
                            : '1px solid rgba(255, 255, 255, 0.04)',
                          opacity: isAvailable ? 1 : 0.5,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: isAvailable ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                            {icon}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                            {!isAvailable && reason && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{reason}</div>
                            )}
                          </div>
                        </div>
                        <div>
                          {isAvailable ? (
                            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>🟢 {t('common.active')}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                              {t('common.inactive')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 4: Submit Button */}
            <button
              type="submit"
              disabled={submitting || !details.hasAvailablePaymentMethod || effectiveAmount <= 0}
              className="btn btn-primary"
              style={{
                padding: '1.1rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                opacity: submitting || !details.hasAvailablePaymentMethod || effectiveAmount <= 0 ? 0.6 : 1,
              }}
            >
              {submitting ? (
                t('common.loading')
              ) : (
                <>
                  {t('tip.payBtn')} {formatCurrency(effectiveAmount || 0, details.business.currency)}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: SMART WI-FI CONNECT */}
        {activeSmartTab === 'wifi' && details.smartQr && (
          <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(2, 132, 199, 0.1))',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <Wifi size={28} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {language === 'tr' ? 'Misafir Wi-Fi Ağı' : 'Guest Wi-Fi Network'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              {language === 'tr'
                ? 'İşletmemize özel yüksek hızlı kablosuz internete bağlanın.'
                : 'Connect to our high-speed guest Wi-Fi network.'}
            </p>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                {language === 'tr' ? 'AĞ ADI (SSID)' : 'NETWORK NAME (SSID)'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{details.smartQr.wifiSsid}</span>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>2.4G / 5G</span>
              </div>
            </div>

            {details.smartQr.wifiPassword && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    {language === 'tr' ? 'Wİ-Fİ ŞİFRESİ' : 'WI-FI PASSWORD'}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.05em', color: '#38bdf8' }}>
                    {details.smartQr.wifiPassword}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyWifiPassword(details.smartQr?.wifiPassword || '')}
                  className="btn btn-primary"
                  style={{
                    padding: '0.55rem 1rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: copiedWifi ? '#10b981' : undefined,
                    borderColor: copiedWifi ? '#10b981' : undefined,
                  }}
                >
                  {copiedWifi ? <Check size={16} /> : <Copy size={16} />}
                  {copiedWifi ? (language === 'tr' ? 'Kopyalandı' : 'Copied') : (language === 'tr' ? 'Şifreyi Kopyala' : 'Copy Password')}
                </button>
              </div>
            )}

            {wifiQrUrl && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'inline-block',
              }}>
                <img
                  src={wifiQrUrl}
                  alt="Wi-Fi QR"
                  style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '10px',
                    display: 'block',
                    margin: '0 auto',
                    background: '#fff',
                    padding: '8px',
                  }}
                />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
                  {language === 'tr'
                    ? 'Kameranızı tutarak doğrudan bağlanın'
                    : 'Point camera to join automatically'}
                </div>
              </div>
            )}

            <div style={{
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              borderRadius: '12px',
              padding: '0.9rem',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: '#bae6fd',
              lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={15} />
                {language === 'tr' ? 'Hızlı Bağlantı Adımları' : 'Quick Connect Instructions'}
              </div>
              <div>1. {language === 'tr' ? '"Şifreyi Kopyala" butonuna dokunun.' : 'Tap "Copy Password" above.'}</div>
              <div>2. {language === 'tr' ? `Ayarlar > Wi-Fi bölümünden "${details.smartQr.wifiSsid}" ağını seçip yapıştırın.` : `Go to Settings > Wi-Fi, select "${details.smartQr.wifiSsid}" and paste.`}</div>
            </div>
          </div>
        )}

        {/* TAB 3: SMART CAMPAIGNS & OFFERS */}
        {activeSmartTab === 'campaigns' && details.smartQr && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {details.smartQr.campaigns.map((camp) => (
              <div
                key={camp.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  position: 'relative',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(15, 23, 42, 0.8))',
                }}
              >
                {camp.badge && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    color: '#fff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    marginBottom: '0.75rem',
                  }}>
                    <Tag size={12} />
                    {camp.badge}
                  </div>
                )}

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', color: '#f8fafc' }}>
                  {camp.title}
                </h3>
                {camp.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {camp.description}
                  </p>
                )}

                {camp.discountCode && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px dashed rgba(236, 72, 153, 0.4)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {language === 'tr' ? 'KAMPANYA KODU' : 'PROMO CODE'}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.08em', color: '#f472b6' }}>
                        {camp.discountCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCouponCode(camp.discountCode || '')}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {copiedCoupon === camp.discountCode ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      {copiedCoupon === camp.discountCode ? (language === 'tr' ? 'Kopyalandı' : 'Copied') : (language === 'tr' ? 'Kodu Al' : 'Copy')}
                    </button>
                  </div>
                )}

                {camp.expiresAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    ⏳ {language === 'tr' ? 'Son geçerlilik:' : 'Valid until:'} {new Date(camp.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: STANDALONE INSTANT FEEDBACK */}
        {activeSmartTab === 'feedback' && (
          <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
            {standaloneSubmitted ? (
              <div style={{ padding: '1rem 0' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginBottom: '0.4rem' }}>
                  {language === 'tr' ? 'Geri Bildiriminiz Alındı!' : 'Feedback Received!'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                  {language === 'tr'
                    ? 'Değerli görüşleriniz doğrudan işletme yönetimine iletilmiştir. Teşekkür ederiz.'
                    : 'Your valuable feedback has been submitted to management. Thank you!'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleStandaloneFeedbackSubmit}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}>
                  <MessageSquareText size={26} />
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  {language === 'tr' ? 'Deneyiminizi Nasıl Buldunuz?' : 'How was your experience?'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  {language === 'tr'
                    ? 'Görüşleriniz hizmet kalitemizi artırmamız için çok değerlidir.'
                    : 'Your review helps us maintain and improve our quality of service.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = (standaloneHover || standaloneRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStandaloneRating(star)}
                        onMouseEnter={() => setStandaloneHover(star)}
                        onMouseLeave={() => setStandaloneHover(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.35rem',
                          color: isActive ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
                          transition: 'transform 0.15s, color 0.15s',
                          transform: isActive ? 'scale(1.2)' : 'scale(1)',
                        }}
                      >
                        <Star size={34} fill={isActive ? '#f59e0b' : 'none'} />
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={3}
                  value={standaloneComment}
                  onChange={(e) => setStandaloneComment(e.target.value)}
                  placeholder={language === 'tr' ? 'Görüş veya önerinizi yazabilirsiniz (isteğe bağlı)...' : 'Write your comment or suggestion (optional)...'}
                  maxLength={500}
                  className="input"
                  style={{ marginBottom: '1.25rem', resize: 'vertical' }}
                />

                <button
                  type="submit"
                  disabled={standaloneRating < 1 || standaloneSubmitting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    fontWeight: 700,
                    opacity: standaloneRating < 1 || standaloneSubmitting ? 0.5 : 1,
                  }}
                >
                  {standaloneSubmitting
                    ? (language === 'tr' ? 'Gönderiliyor...' : 'Submitting...')
                    : (language === 'tr' ? 'Geri Bildirimi Gönder' : 'Submit Feedback')}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 5: VIP SIGNUP / LEAD COLLECTION */}
        {activeSmartTab === 'signup' && details.smartQr && (
          <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
            {leadSubmitted ? (
              <div style={{ padding: '1rem 0' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginBottom: '0.4rem' }}>
                  {language === 'tr' ? 'Aramıza Hoş Geldiniz!' : 'Welcome to the Club!'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                  {language === 'tr'
                    ? 'Kaydınız başarıyla tamamlandı. Özel ikram ve fırsatlar ilk size ulaşacak!'
                    : 'You are now enrolled. Look out for VIP perks and invitations!'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ textAlign: 'left' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}>
                    <Mail size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', color: '#f8fafc' }}>
                    {details.smartQr.signupTitle || (language === 'tr' ? 'VIP Ayrıcalık Kulübü' : 'VIP Member Club')}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                    {details.smartQr.signupReward || (language === 'tr'
                      ? 'Özel ikramlar, doğum günü hediyeleri ve indirimlerden haberdar olun.'
                      : 'Enjoy complimentary rewards and exclusive invitations.')}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      {language === 'tr' ? 'Adınız Soyadınız' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder={language === 'tr' ? 'Örn: Ahmet Yılmaz' : 'e.g. John Doe'}
                      className="input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      {language === 'tr' ? 'E-posta Adresiniz' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="adiniz@ornek.com"
                      className="input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      {language === 'tr' ? 'Telefon Numaranız (İsteğe Bağlı)' : 'Phone Number (Optional)'}
                    </label>
                    <input
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="+90 5XX XXX XX XX"
                      className="input"
                    />
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.5rem',
                    lineHeight: 1.4,
                  }}>
                    <input
                      type="checkbox"
                      checked={leadConsent}
                      onChange={(e) => setLeadConsent(e.target.checked)}
                      style={{ marginTop: '0.15rem', accentColor: '#10b981', width: '16px', height: '16px' }}
                    />
                    <span>
                      {language === 'tr'
                        ? 'İşletmenin özel teklif, duyuru ve promosyon bildirimlerini almayı (KVKK kapsamında) onaylıyorum.'
                        : 'I agree to receive special offers and updates in accordance with privacy laws.'}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={(!leadEmail && !leadPhone) || leadSubmitting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderColor: '#10b981',
                    opacity: (!leadEmail && !leadPhone) || leadSubmitting ? 0.5 : 1,
                  }}
                >
                  {leadSubmitting
                    ? (language === 'tr' ? 'Kaydediliyor...' : 'Enrolling...')
                    : (language === 'tr' ? 'Ayrıcalıklara Katıl' : 'Join VIP Club')}
                </button>
              </form>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.25rem', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <img src="/naponi-brand.svg" alt="Naponi" style={{ height: '28px', width: 'auto', opacity: 0.9 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('home.footerTagline')}</span>
        </div>
      </div>
    </div>
  );
};
