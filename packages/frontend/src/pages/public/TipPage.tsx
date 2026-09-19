import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
  X,
  UtensilsCrossed,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Globe,
  MessageCircle,
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
  const navigate = useNavigate();
  const location = useLocation();
  const { t, formatCurrency, dir, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<TipPageDetails | null>(null);

  // Smart QR Navigation State
  const [activeSmartTab, setActiveSmartTab] = useState<SmartTab>('tip');
  const [activeModal, setActiveModal] = useState<SmartTab | null>(null);
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
  const [copiedReviewText, setCopiedReviewText] = useState(false);

  const handleOpenGoogleReview = (url: string, text?: string) => {
    if (text && text.trim()) {
      navigator.clipboard.writeText(text.trim());
      setCopiedReviewText(true);
      setTimeout(() => setCopiedReviewText(false), 3000);
    }
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

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

        // Smart QR primary routing & auto-selection
        const sq = d.smartQr;
        if (sq?.isSmartEnabled) {
          const searchParams = new URLSearchParams(window.location.search);
          const forceTipView = searchParams.get('view') === 'tip';
          const isNativeMenu = sq?.menuMode === 'NATIVE' || sq?.hasNativeMenu;

          if (!forceTipView && isNativeMenu && sq?.enableMenu) {
            if (sq.primaryAction === 'MENU' || sq.enableTips === false) {
              navigate(`/menu/${publicToken}${window.location.search}`, { replace: true });
              return;
            }
          }

          if (sq.enableTips === false) {
            if (sq.enableWifi) setActiveSmartTab('wifi');
            else if (sq.enableCampaigns) setActiveSmartTab('campaigns');
            else if (sq.enableFeedback) setActiveSmartTab('feedback');
            else if (sq.enableSignup) setActiveSmartTab('signup');
          }
        }
      })
      .catch((err) => {
        const rawError = err.response?.data?.error;
        const errorMessage =
          typeof rawError === 'string'
            ? rawError
          : typeof rawError?.message === 'string'
            ? rawError.message
            : t('tip.invalidQr');
        setError(errorMessage);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    if (activeModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  const openSmartModal = (tab: SmartTab) => {
    setActiveModal(tab);
    if (!publicToken) return;
    if (tab === 'wifi') {
      api.post(`/smart-qr/public/${publicToken}/event`, { event_type: 'WIFI_CLICK' }).catch(() => {});
    } else if (tab === 'campaigns') {
      api.post(`/smart-qr/public/${publicToken}/event`, { event_type: 'CAMPAIGN_CLICK' }).catch(() => {});
    }
  };

  const handleMenuClick = () => {
    const sq = details?.smartQr;
    if (!sq) return;

    if (publicToken) {
      api.post(`/smart-qr/public/${publicToken}/event`, { event_type: 'MENU_CLICK' }).catch(() => {});
    }

    const isNative = sq.menuMode === 'NATIVE' || sq.hasNativeMenu;
    if (isNative && publicToken) {
      navigate(`/menu/${publicToken}${window.location.search}`);
      return;
    }

    if (sq.menuUrl) {
      let url = sq.menuUrl.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
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
      <div className="theme-warm-light" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6', color: '#1C1917' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin" size={36} style={{ color: '#059669', margin: '0 auto 1rem' }} />
          <div style={{ color: '#78716C', fontWeight: 600 }}>{t('tip.loadingDetails')}</div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="theme-warm-light" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', background: '#FAF9F6', color: '#1C1917' }}>
        <div style={{ position: 'absolute', top: '1rem', right: dir === 'rtl' ? 'auto' : '1rem', left: dir === 'rtl' ? '1rem' : 'auto' }}>
          <LanguageSelector variant="compact" theme="light" />
        </div>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem', background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', color: '#1C1917' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1C1917', fontWeight: 800 }}>{t('tip.invalidQr')}</h2>
          <p style={{ color: '#78716C', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error || t('tip.inactiveBusiness')}</p>
          <Link to="/" className="btn btn-secondary">
            {t('tip.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  // --- Social Media & Contact Links Renderer ---
  const renderSocialLinks = () => {
    const sq = details?.smartQr;
    const sl = sq?.socialLinks || {
      instagram: sq?.socialInstagram,
      facebook: sq?.socialFacebook,
      tiktok: sq?.socialTiktok,
      twitter: sq?.socialTwitter,
      youtube: sq?.socialYoutube,
      whatsapp: sq?.socialWhatsapp,
      website: sq?.socialWebsite,
    };

    const platforms = [
      {
        id: 'instagram',
        name: 'Instagram',
        url: sl?.instagram,
        color: '#E1306C',
        bg: 'rgba(225, 48, 108, 0.08)',
        border: 'rgba(225, 48, 108, 0.22)',
        icon: <Instagram size={19} />,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        url: sl?.facebook,
        color: '#1877F2',
        bg: 'rgba(24, 119, 242, 0.08)',
        border: 'rgba(24, 119, 242, 0.22)',
        icon: <Facebook size={19} />,
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        url: sl?.tiktok,
        color: '#000000',
        bg: 'rgba(0, 0, 0, 0.06)',
        border: 'rgba(0, 0, 0, 0.16)',
        icon: (
          <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-6.61 6.35 6.34 6.34 0 0 0 6.35 6.33c3.5 0 6.34-2.84 6.34-6.33V9a8.28 8.28 0 0 0 4.78 1.5v-3.45a4.85 4.85 0 0 1-1.6-.36z" />
          </svg>
        ),
      },
      {
        id: 'twitter',
        name: 'X',
        url: sl?.twitter,
        color: '#0f1419',
        bg: 'rgba(15, 20, 25, 0.06)',
        border: 'rgba(15, 20, 25, 0.18)',
        icon: <Twitter size={18} />,
      },
      {
        id: 'youtube',
        name: 'YouTube',
        url: sl?.youtube,
        color: '#FF0000',
        bg: 'rgba(255, 0, 0, 0.07)',
        border: 'rgba(255, 0, 0, 0.22)',
        icon: <Youtube size={19} />,
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        url: sl?.whatsapp,
        color: '#25D366',
        bg: 'rgba(37, 211, 102, 0.09)',
        border: 'rgba(37, 211, 102, 0.26)',
        icon: <MessageCircle size={19} />,
      },
      {
        id: 'website',
        name: language === 'tr' ? 'Web Sitesi' : 'Website',
        url: sl?.website,
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.08)',
        border: 'rgba(5, 150, 105, 0.22)',
        icon: <Globe size={18} />,
      },
    ].filter((p): p is typeof p & { url: string } => Boolean(p.url && p.url.trim()));

    if (platforms.length === 0) return null;

    return (
      <div
        style={{
          marginTop: '1.75rem',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#E7E5E4' }} />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#78716C',
            }}
          >
            {language === 'tr' ? 'Bizi Takip Edin' : 'Connect With Us'}
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E7E5E4' }} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.65rem',
            padding: '0.25rem 0',
          }}
        >
          {platforms.map((p) => {
            let finalUrl = p.url.trim();
            if (p.id === 'instagram') {
              const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
              finalUrl = `https://instagram.com/${handle}`;
            } else if (p.id === 'tiktok') {
              const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
              finalUrl = `https://tiktok.com/@${handle}`;
            } else if (p.id === 'facebook') {
              const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?facebook\.com\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
              finalUrl = `https://facebook.com/${handle}`;
            } else if (p.id === 'twitter') {
              const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
              finalUrl = `https://x.com/${handle}`;
            } else if (p.id === 'youtube') {
              const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?youtube\.com\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
              finalUrl = (handle.startsWith('channel/') || handle.startsWith('c/') || handle.startsWith('user/'))
                ? `https://youtube.com/${handle}`
                : `https://youtube.com/@${handle}`;
            } else if (p.id === 'whatsapp') {
              const digits = finalUrl.replace(/[\s\-\(\)\+]/g, '').replace(/^(?:https?:\/\/)?(?:www\.)?wa\.me\/?/i, '');
              finalUrl = `https://wa.me/${digits}`;
            } else if (!/^https?:\/\//i.test(finalUrl)) {
              finalUrl = `https://${finalUrl}`;
            }

            return (
              <a
                key={p.id}
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (publicToken) {
                    api.post(`/smart-qr/public/${publicToken}/event`, {
                      event_type: 'SOCIAL_CLICK',
                      metadata: { platform: p.id, url: finalUrl },
                    }).catch(() => {});
                  }
                }}
                title={p.name}
                aria-label={p.name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  color: p.color,
                  textDecoration: 'none',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                }}
              >
                {p.icon}
              </a>
            );
          })}
        </div>
      </div>
    );
  };

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
      <div className="theme-warm-light" style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#FAF9F6', color: '#1C1917' }}>
        <div style={{ position: 'absolute', top: '1rem', right: dir === 'rtl' ? 'auto' : '1rem', left: dir === 'rtl' ? '1rem' : 'auto' }}>
          <LanguageSelector variant="compact" theme="light" />
        </div>

        <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)', color: '#1C1917' }}>
          {/* Status Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isUnverified
              ? 'rgba(245, 158, 11, 0.15)'
              : isSuccess
              ? 'rgba(5, 150, 105, 0.15)'
              : isFailed
              ? 'rgba(239, 68, 68, 0.15)'
              : isCancelled
              ? 'rgba(120, 113, 108, 0.15)'
              : 'rgba(2, 132, 199, 0.15)',
            color: isUnverified
              ? '#D97706'
              : isSuccess
              ? '#059669'
              : isFailed
              ? '#ef4444'
              : isCancelled
              ? '#78716C'
              : '#0284C7',
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1C1917' }}>
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
          <p style={{ color: '#78716C', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
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
            background: '#F5F5F4',
            border: '1px solid #E7E5E4',
            borderRadius: '14px',
            padding: '1.25rem',
            textAlign: dir === 'rtl' ? 'right' : 'left',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#1C1917',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#78716C' }}>{t('common.amount')}:</span>
              <span style={{ fontWeight: 700, color: '#1C1917' }}>
                {formatCurrency(paymentResult.tip.amount, details.business.currency)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#78716C', flexShrink: 0 }}>{t('common.status')}:</span>
              <span className={`badge ${
                isSuccess
                  ? 'badge-success'
                  : isUnverified || isPending
                  ? 'badge-warning'
                  : isCancelled
                  ? 'badge-neutral'
                  : 'badge-danger'
              }`} style={{ whiteSpace: 'normal', textAlign: 'right', maxWidth: '75%', lineHeight: 1.25 }}>
                {isUnverified
                  ? (language === 'tr' ? 'Havale Bekleniyor' : 'Transfer Pending')
                  : isSuccess
                  ? t('common.success')
                  : isPending
                  ? (language === 'tr' ? 'İşlem Bekleniyor' : 'Pending')
                  : isCancelled
                  ? (language === 'tr' ? 'İptal Edildi' : 'Cancelled')
                  : (language === 'tr' ? 'Başarısız' : 'Failed')}
              </span>
            </div>

            {isUnverified && ibanDetails && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #E7E5E4', paddingTop: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{t('tip.accountHolder')}</div>
                  <div style={{ fontWeight: 600, color: '#1C1917' }}>{ibanDetails.accountHolderName}</div>
                </div>
                {ibanDetails.iban && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{t('tip.ibanLabel')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <code style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1C1917', background: '#E7E5E4', padding: '2px 6px', borderRadius: '6px' }}>{ibanDetails.iban}</code>
                      <button type="button" onClick={() => copyToClipboard(ibanDetails.iban!)} style={{ color: '#059669', padding: '4px' }}>
                        {copiedIban ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                {ibanDetails.bankName && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{t('tip.bankName')}</div>
                    <div style={{ fontWeight: 600, color: '#1C1917' }}>{ibanDetails.bankName}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{t('tip.refCodeLabel')}</div>
                  <div style={{ fontWeight: 700, color: '#059669', fontSize: '1.1rem' }}>{ibanDetails.referenceCode}</div>
                  <div style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '0.2rem' }}>{t('tip.refCodeNotice')}</div>
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
              background: '#F5F5F4',
              border: '1px solid #E7E5E4',
              borderRadius: '16px',
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
                    background: 'rgba(5, 150, 105, 0.15)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                  }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', color: '#059669' }}>
                    {t('feedback.thankYouTitle')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#78716C', margin: 0 }}>
                    {t('feedback.thankYouSubtitle')}
                  </p>

                  {/* Google Review Gating Card (5 Stars Only) */}
                  {feedbackRating === 5 && details?.smartQr?.googleReviewUrl && (
                    <div style={{
                      marginTop: '1.25rem',
                      padding: '1.25rem',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(66, 133, 244, 0.08))',
                      border: '1.5px solid rgba(245, 158, 11, 0.3)',
                      textAlign: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginBottom: '0.45rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={15} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        ))}
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1C1917', marginBottom: '0.35rem' }}>
                        {language === 'tr' ? 'Bizi Çok Mutlu Ettiniz! 🎉' : 'You Made Our Day! 🎉'}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#57534E', lineHeight: 1.45, marginBottom: '0.9rem' }}>
                        {language === 'tr'
                          ? `${details?.business?.name || 'Ekibimize'} destek olmak için 5 yıldızlı değerlendirmenizi Google Haritalar'da da paylaşmak ister misiniz?`
                          : `Would you like to support ${details?.business?.name || 'our team'} by posting your 5-star review on Google Maps?`}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleOpenGoogleReview(details.smartQr!.googleReviewUrl!, feedbackComment)}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
                          borderColor: '#4285f4',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          boxShadow: '0 4px 14px rgba(66, 133, 244, 0.35)',
                        }}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span>
                          {feedbackComment.trim()
                            ? (language === 'tr' ? 'Yorumu Kopyala & Google\'da Paylaş' : 'Copy Review & Post on Google')
                            : (language === 'tr' ? 'Google\'da 5 Yıldız Ver' : 'Post 5 Stars on Google')}
                        </span>
                        <ExternalLink size={14} />
                      </button>
                      {copiedReviewText && (
                        <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '0.45rem', fontWeight: 600 }}>
                          {language === 'tr' ? '✓ Yorumunuz panoya kopyalandı! Google sayfasına yapıştırabilirsiniz.' : '✓ Review copied to clipboard! Paste it on Google.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : feedbackSkipped ? null : (
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1C1917' }}>
                    {t('feedback.satisfactionQuestion')}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#78716C', marginBottom: '1rem' }}>
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
                              color: isActive ? '#f59e0b' : '#D6D3D1',
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
                          borderRadius: '12px',
                          background: '#FFFFFF',
                          border: '1.5px solid #E7E5E4',
                          color: '#1C1917',
                          fontSize: '0.88rem',
                          resize: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: '#78716C', marginTop: '0.25rem' }}>
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
                        color: '#78716C',
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

          {/* Social Media & Contact Links */}
          {renderSocialLinks()}
        </div>
      </div>
    );
  }

  // --- Smart QR Feature Content Renderers (Shared between Bottom Sheet Modal and Standalone View) ---
  const renderWifiContent = () => {
    if (!details?.smartQr) return null;
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          background: 'rgba(2, 132, 199, 0.1)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
          color: '#0284C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <Wifi size={26} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', color: '#1C1917' }}>
          {language === 'tr' ? 'Misafir Wi-Fi Ağı' : 'Guest Wi-Fi Network'}
        </h3>
        <p style={{ color: '#78716C', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {language === 'tr'
            ? 'İşletmemize özel yüksek hızlı kablosuz internete bağlanın.'
            : 'Connect to our high-speed guest Wi-Fi network.'}
        </p>

        <div style={{
          background: '#F5F5F4',
          border: '1px solid #E7E5E4',
          borderRadius: '12px',
          padding: '0.9rem',
          marginBottom: '0.85rem',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '0.72rem', color: '#78716C', marginBottom: '0.2rem', fontWeight: 600 }}>
            {language === 'tr' ? 'AĞ ADI (SSID)' : 'NETWORK NAME (SSID)'}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{details.smartQr.wifiSsid}</span>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem', background: 'rgba(2, 132, 199, 0.12)', color: '#0284C7', border: '1px solid rgba(2, 132, 199, 0.25)' }}>2.4G / 5G</span>
          </div>
        </div>

        {details.smartQr.wifiPassword && (
          <div style={{
            background: '#F5F5F4',
            border: '1px solid #E7E5E4',
            borderRadius: '12px',
            padding: '0.9rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#78716C', marginBottom: '0.2rem', fontWeight: 600 }}>
                {language === 'tr' ? 'Wİ-Fİ ŞİFRESİ' : 'WI-FI PASSWORD'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em', color: '#0284C7' }}>
                {details.smartQr.wifiPassword}
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyWifiPassword(details.smartQr?.wifiPassword || '')}
              className="btn btn-primary"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: copiedWifi ? '#059669' : '#0284C7',
                borderColor: copiedWifi ? '#059669' : '#0284C7',
              }}
            >
              {copiedWifi ? <Check size={15} /> : <Copy size={15} />}
              {copiedWifi ? (language === 'tr' ? 'Kopyalandı' : 'Copied') : (language === 'tr' ? 'Şifreyi Kopyala' : 'Copy Password')}
            </button>
          </div>
        )}

        {wifiQrUrl && (
          <div style={{
            background: '#F5F5F4',
            border: '1px solid #E7E5E4',
            borderRadius: '16px',
            padding: '1.1rem',
            marginBottom: '1.25rem',
            display: 'inline-block',
          }}>
            <img
              src={wifiQrUrl}
              alt="Wi-Fi QR"
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '10px',
                display: 'block',
                margin: '0 auto',
                background: '#fff',
                padding: '8px',
                border: '1px solid #E7E5E4',
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '0.5rem' }}>
              {language === 'tr'
                ? 'Kameranızı tutarak doğrudan bağlanın'
                : 'Point camera to join automatically'}
            </div>
          </div>
        )}

        <div style={{
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
          borderRadius: '12px',
          padding: '0.85rem',
          textAlign: 'left',
          fontSize: '0.8rem',
          color: '#0369A1',
          lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} />
            {language === 'tr' ? 'Hızlı Bağlantı Adımları' : 'Quick Connect Instructions'}
          </div>
          <div>1. {language === 'tr' ? '"Şifreyi Kopyala" butonuna dokunun.' : 'Tap "Copy Password" above.'}</div>
          <div>2. {language === 'tr' ? `Ayarlar > Wi-Fi bölümünden "${details.smartQr.wifiSsid}" ağını seçip yapıştırın.` : `Go to Settings > Wi-Fi, select "${details.smartQr.wifiSsid}" and paste.`}</div>
        </div>
      </div>
    );
  };

  const renderCampaignsContent = () => {
    if (!details?.smartQr) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {details.smartQr.campaigns.map((camp) => (
          <div
            key={camp.id}
            className="glass-card"
            style={{
              padding: '1.25rem',
              position: 'relative',
              border: '1px solid rgba(219, 39, 119, 0.25)',
              background: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            }}
          >
            {camp.badge && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                color: '#fff',
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                marginBottom: '0.6rem',
              }}>
                <Tag size={11} />
                {camp.badge}
              </div>
            )}

            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem', color: '#1C1917' }}>
              {camp.title}
            </h4>
            {camp.description && (
              <p style={{ color: '#57534E', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.45 }}>
                {camp.description}
              </p>
            )}

            {camp.discountCode && (
              <div style={{
                background: '#FDF2F8',
                border: '1px dashed rgba(219, 39, 119, 0.35)',
                borderRadius: '10px',
                padding: '0.65rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#9D174D', fontWeight: 600 }}>
                    {language === 'tr' ? 'KAMPANYA KODU' : 'PROMO CODE'}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.08em', color: '#DB2777' }}>
                    {camp.discountCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyCouponCode(camp.discountCode || '')}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.78rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#FFFFFF',
                    border: '1px solid #E7E5E4',
                  }}
                >
                  {copiedCoupon === camp.discountCode ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
                  {copiedCoupon === camp.discountCode ? (language === 'tr' ? 'Kopyalandı' : 'Copied') : (language === 'tr' ? 'Kodu Al' : 'Copy')}
                </button>
              </div>
            )}

            {camp.expiresAt && (
              <div style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '0.6rem' }}>
                ⏳ {language === 'tr' ? 'Son geçerlilik:' : 'Valid until:'} {new Date(camp.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFeedbackContent = () => {
    return (
      <div style={{ textAlign: 'center' }}>
        {standaloneSubmitted ? (
          <div style={{ padding: '1.5rem 0' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(5, 150, 105, 0.15)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <CheckCircle2 size={30} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginBottom: '0.4rem' }}>
              {language === 'tr' ? 'Geri Bildiriminiz Alındı!' : 'Feedback Received!'}
            </h3>
            <p style={{ color: '#78716C', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              {language === 'tr'
                ? 'Değerli görüşleriniz doğrudan işletme yönetimine iletilmiştir. Teşekkür ederiz.'
                : 'Your valuable feedback has been submitted to management. Thank you!'}
            </p>

            {/* Google Review Gating Card (5 Stars Only) */}
            {standaloneRating === 5 && details?.smartQr?.googleReviewUrl && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1.25rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(66, 133, 244, 0.08))',
                border: '1.5px solid rgba(245, 158, 11, 0.3)',
                textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginBottom: '0.45rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  ))}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1C1917', marginBottom: '0.35rem' }}>
                  {language === 'tr' ? 'Bizi Çok Mutlu Ettiniz! 🎉' : 'You Made Our Day! 🎉'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#57534E', lineHeight: 1.45, marginBottom: '0.9rem' }}>
                  {language === 'tr'
                    ? `${details?.business?.name || 'Ekibimize'} destek olmak için 5 yıldızlı değerlendirmenizi Google Haritalar'da da paylaşmak ister misiniz?`
                    : `Would you like to support ${details?.business?.name || 'our team'} by posting your 5-star review on Google Maps?`}
                </p>

                <button
                  type="button"
                  onClick={() => handleOpenGoogleReview(details.smartQr!.googleReviewUrl!, standaloneComment)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
                    borderColor: '#4285f4',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 14px rgba(66, 133, 244, 0.35)',
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>
                    {standaloneComment.trim()
                      ? (language === 'tr' ? 'Yorumu Kopyala & Google\'da Paylaş' : 'Copy Review & Post on Google')
                      : (language === 'tr' ? 'Google\'da 5 Yıldız Ver' : 'Post 5 Stars on Google')}
                  </span>
                  <ExternalLink size={14} />
                </button>
                {copiedReviewText && (
                  <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '0.45rem', fontWeight: 600 }}>
                    {language === 'tr' ? '✓ Yorumunuz panoya kopyalandı! Google sayfasına yapıştırabilirsiniz.' : '✓ Review copied to clipboard! Paste it on Google.'}
                  </div>
                )}
              </div>
            )}

            {activeModal && (
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn btn-secondary"
                style={{ marginTop: '1.25rem', width: '100%' }}
              >
                {language === 'tr' ? 'Kapat' : 'Close'}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleStandaloneFeedbackSubmit}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <MessageSquareText size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', color: '#1C1917' }}>
              {language === 'tr' ? 'Deneyiminizi Nasıl Buldunuz?' : 'How was your experience?'}
            </h3>
            <p style={{ color: '#78716C', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {language === 'tr'
                ? 'Görüşleriniz hizmet kalitemizi artırmamız için çok değerlidir.'
                : 'Your review helps us maintain and improve our quality of service.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
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
                      padding: '0.25rem',
                      color: isActive ? '#f59e0b' : '#D6D3D1',
                      transition: 'transform 0.15s, color 0.15s',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <Star size={32} fill={isActive ? '#f59e0b' : 'none'} />
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
              style={{ marginBottom: '1.25rem', resize: 'vertical', background: '#F5F5F4', border: '1.5px solid #E7E5E4', color: '#1C1917' }}
            />

            <button
              type="submit"
              disabled={standaloneRating < 1 || standaloneSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
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
    );
  };

  const renderSignupContent = () => {
    if (!details?.smartQr) return null;
    return (
      <div>
        {leadSubmitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(5, 150, 105, 0.15)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <CheckCircle2 size={30} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginBottom: '0.4rem' }}>
              {language === 'tr' ? 'Aramıza Hoş Geldiniz!' : 'Welcome to the Club!'}
            </h3>
            <p style={{ color: '#78716C', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              {language === 'tr'
                ? 'Kaydınız başarıyla tamamlandı. Özel ikram ve fırsatlar ilk size ulaşacak!'
                : 'You are now enrolled. Look out for VIP perks and invitations!'}
            </p>
            {activeModal && (
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn btn-secondary"
                style={{ marginTop: '1.25rem', width: '100%' }}
              >
                {language === 'tr' ? 'Kapat' : 'Close'}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} style={{ textAlign: 'left' }}>
            {/* Standalone card title if not rendered inside modal */}
            {!activeModal && (
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', color: '#1C1917' }}>
                  {details.smartQr.signupTitle || (language === 'tr' ? 'VIP Ayrıcalık Kulübü' : 'VIP Member Club')}
                </h3>
              </div>
            )}

            {/* Compact Highlight Reward Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(13, 148, 136, 0.04))',
                border: '1px solid rgba(5, 150, 105, 0.22)',
                borderRadius: '12px',
                padding: '0.75rem 0.95rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(5, 150, 105, 0.15)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Gift size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.1rem' }}>
                  {language === 'tr' ? 'Üyelik Avantajı' : 'Membership Perk'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1C1917', lineHeight: 1.3 }}>
                  {details.smartQr.signupReward || (language === 'tr'
                    ? 'Özel ikramlar ve indirim fırsatları'
                    : 'Exclusive perks and special invitations')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#57534E', display: 'block', marginBottom: '0.3rem' }}>
                  {language === 'tr' ? 'Adınız Soyadınız' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder={language === 'tr' ? 'Örn: Ahmet Yılmaz' : 'e.g. John Doe'}
                  className="input"
                  style={{ background: '#F5F5F4', border: '1.5px solid #E7E5E4', color: '#1C1917' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#57534E', display: 'block', marginBottom: '0.3rem' }}>
                  {language === 'tr' ? 'E-posta Adresiniz' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="adiniz@ornek.com"
                  className="input"
                  style={{ background: '#F5F5F4', border: '1.5px solid #E7E5E4', color: '#1C1917' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#57534E', display: 'block', marginBottom: '0.3rem' }}>
                  {language === 'tr' ? 'Telefon Numaranız (İsteğe Bağlı)' : 'Phone Number (Optional)'}
                </label>
                <input
                  type="tel"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="input"
                  style={{ background: '#F5F5F4', border: '1.5px solid #E7E5E4', color: '#1C1917' }}
                />
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#57534E',
                marginTop: '0.35rem',
                lineHeight: 1.4,
              }}>
                <input
                  type="checkbox"
                  checked={leadConsent}
                  onChange={(e) => setLeadConsent(e.target.checked)}
                  style={{ marginTop: '0.15rem', accentColor: '#059669', width: '16px', height: '16px' }}
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
                padding: '0.85rem',
                fontWeight: 700,
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
    );
  };

  // --- Main 4-Step Tip Form ---
  return (
    <div className="theme-warm-light" style={{ minHeight: '100vh', padding: '1.25rem 1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', background: '#FAF9F6', color: '#1C1917' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Sleek Horizontal App Header (Option B) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.85rem',
          }}
        >
          {/* Left: Logo + Business Name & Table Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            {details.business.logo ? (
              <img
                src={details.business.logo}
                alt={details.business.name}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                  flexShrink: 0,
                }}
              >
                <Heart size={22} />
              </div>
            )}

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#1C1917',
                    margin: 0,
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  {details.business.name}
                </h1>
                {details.table && (
                  <span
                    className="badge badge-neutral"
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#F5F5F4',
                      border: '1px solid #E7E5E4',
                      color: '#57534E',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {details.table.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Compact Language Selector */}
          <div style={{ flexShrink: 0 }}>
            <LanguageSelector variant="compact" theme="light" />
          </div>
        </div>

        {/* Smart QR Custom Welcome Message */}
        {details.smartQr?.welcomeMessage && (
          <div
            style={{
              margin: '0 0 0.85rem 0',
              padding: '0.55rem 0.85rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(13, 148, 136, 0.05))',
              border: '1px solid rgba(5, 150, 105, 0.22)',
              color: '#065F46',
              fontSize: '0.82rem',
              fontWeight: 600,
              lineHeight: 1.35,
              textAlign: 'center',
            }}
          >
            ✨ {details.smartQr.welcomeMessage}
          </div>
        )}

        {/* Smart QR Secondary Features Bar */}
        {(() => {
          const sq = details.smartQr;
          const isSmart = Boolean(sq?.isSmartEnabled);
          const isNativeMenu = sq?.menuMode === 'NATIVE' || Boolean(sq?.hasNativeMenu);
          const hasExternalMenu = (sq?.menuMode === 'EXTERNAL_URL' || !sq?.menuMode) && Boolean(sq?.menuUrl);
          const hasMenu = Boolean(isSmart && sq?.enableMenu && (isNativeMenu || hasExternalMenu));
          const hasWifi = Boolean(isSmart && sq?.enableWifi && sq?.wifiSsid);
          const hasCampaigns = Boolean(isSmart && sq?.enableCampaigns && (sq?.campaigns?.length || 0) > 0);
          const hasFeedback = Boolean(isSmart && sq?.enableFeedback);
          const hasSignup = Boolean(isSmart && sq?.enableSignup);
          const hasTips = sq?.enableTips !== false;
          const hasAnyExtra = hasMenu || hasWifi || hasCampaigns || hasFeedback || hasSignup;

          if (!hasAnyExtra) return null;

          // When tips are enabled, secondary utilities are presented as sleek, non-intrusive Quick Action Chips
          if (hasTips) {
            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}>
                {hasMenu && (
                  <button
                    type="button"
                    onClick={handleMenuClick}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid rgba(5, 150, 105, 0.35)',
                      background: 'rgba(5, 150, 105, 0.08)',
                      color: '#059669',
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.08)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <UtensilsCrossed size={14} />
                    <span>{sq?.menuTitle || (language === 'tr' ? 'Menü' : 'Menu')}</span>
                    {isNativeMenu ? <ArrowRight size={12} style={{ opacity: 0.85 }} /> : <ExternalLink size={12} style={{ opacity: 0.75 }} />}
                  </button>
                )}
                {hasWifi && (
                  <button
                    type="button"
                    onClick={() => openSmartModal('wifi')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid rgba(2, 132, 199, 0.3)',
                      background: 'rgba(2, 132, 199, 0.08)',
                      color: '#0284C7',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Wifi size={14} />
                    <span>Wi-Fi</span>
                  </button>
                )}

                {hasCampaigns && (
                  <button
                    type="button"
                    onClick={() => openSmartModal('campaigns')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid rgba(219, 39, 119, 0.3)',
                      background: 'rgba(219, 39, 119, 0.08)',
                      color: '#DB2777',
                      boxShadow: '0 2px 6px rgba(219, 39, 119, 0.08)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Gift size={14} />
                    <span>{language === 'tr' ? 'Fırsatlar' : 'Offers'}</span>
                    {Boolean(sq?.campaigns?.length) && (
                      <span style={{
                        fontSize: '0.7rem',
                        background: 'linear-gradient(135deg, #ec4899, #db2777)',
                        color: '#fff',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '999px',
                        fontWeight: 800,
                      }}>
                        {sq?.campaigns?.length}
                      </span>
                    )}
                  </button>
                )}

                {hasFeedback && (
                  <button
                    type="button"
                    onClick={() => openSmartModal('feedback')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid rgba(217, 119, 6, 0.3)',
                      background: 'rgba(217, 119, 6, 0.08)',
                      color: '#D97706',
                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.08)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <MessageSquareText size={14} />
                    <span>{language === 'tr' ? 'Görüş Bildir' : 'Feedback'}</span>
                  </button>
                )}

                {hasSignup && (
                  <button
                    type="button"
                    onClick={() => openSmartModal('signup')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid rgba(13, 148, 136, 0.3)',
                      background: 'rgba(13, 148, 136, 0.08)',
                      color: '#0D9488',
                      boxShadow: '0 2px 6px rgba(13, 148, 136, 0.08)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Mail size={14} />
                    <span>VIP</span>
                  </button>
                )}
              </div>
            );
          }

          // Fallback if tips are explicitly disabled: segmented tabs for remaining features
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
              {hasMenu && (
                <button
                  type="button"
                  onClick={handleMenuClick}
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
                    border: '1px solid #059669',
                    transition: 'all 0.2s',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <UtensilsCrossed size={16} />
                  <span>{sq?.menuTitle || (language === 'tr' ? 'Menüyü Gör' : 'View Menu')}</span>
                  {isNativeMenu ? <ArrowRight size={14} /> : <ExternalLink size={13} />}
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
                      ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                      : '#F5F5F4',
                    borderColor: activeSmartTab === 'wifi' ? '#0284c7' : '#E7E5E4',
                    color: activeSmartTab === 'wifi' ? '#ffffff' : '#57534E',
                    boxShadow: activeSmartTab === 'wifi' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
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
                      : '#F5F5F4',
                    borderColor: activeSmartTab === 'campaigns' ? '#ec4899' : '#E7E5E4',
                    color: activeSmartTab === 'campaigns' ? '#ffffff' : '#57534E',
                    boxShadow: activeSmartTab === 'campaigns' ? '0 4px 12px rgba(236, 72, 153, 0.25)' : 'none',
                  }}
                >
                  <Gift size={16} />
                  {language === 'tr' ? 'Fırsatlar' : 'Offers'}
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
                      : '#F5F5F4',
                    borderColor: activeSmartTab === 'feedback' ? '#f59e0b' : '#E7E5E4',
                    color: activeSmartTab === 'feedback' ? '#ffffff' : '#57534E',
                    boxShadow: activeSmartTab === 'feedback' ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'none',
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
                      ? 'linear-gradient(135deg, #059669, #047857)'
                      : '#F5F5F4',
                    borderColor: activeSmartTab === 'signup' ? '#059669' : '#E7E5E4',
                    color: activeSmartTab === 'signup' ? '#ffffff' : '#57534E',
                    boxShadow: activeSmartTab === 'signup' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none',
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
        {(details.smartQr?.enableTips !== false || activeSmartTab === 'tip') && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Step 1: Select Employee */}
            {details.employees.length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716C' }}>
                    1. {t('tip.selectStaffTitle')}
                  </span>
                  {selectedEmployeeId && (
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeId(undefined)}
                      style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}
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
                          borderRadius: '14px',
                          border: `2px solid ${isSelected ? '#059669' : '#E7E5E4'}`,
                          background: isSelected ? 'rgba(5, 150, 105, 0.08)' : '#F5F5F4',
                          color: '#1C1917',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={emp.first_name}
                            style={{ width: '44px', height: '44px', borderRadius: '50%', margin: '0 auto 0.5rem', objectFit: 'cover', border: '1px solid rgba(0, 0, 0, 0.08)' }}
                          />
                        ) : (
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: '#E7E5E4',
                            color: '#44403C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem',
                            fontWeight: 700,
                          }}>
                            {emp.first_name[0]}
                          </div>
                        )}
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{emp.first_name} {emp.last_name}</div>
                        {emp.position && (
                          <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{emp.position}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Amount */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716C', display: 'block', marginBottom: '0.75rem' }}>
                2. {t('tip.selectAmountTitle')}
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
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
                        padding: '0.75rem 0.25rem',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSelected ? '#059669' : '#E7E5E4'}`,
                        background: isSelected ? '#059669' : '#F5F5F4',
                        color: isSelected ? '#ffffff' : '#1C1917',
                        fontWeight: 700,
                        fontSize: 'clamp(0.85rem, 3.2vw, 1.05rem)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        boxShadow: isSelected ? '0 4px 14px rgba(5, 150, 105, 0.35)' : 'none',
                      }}
                    >
                      {formatCurrency(amt, details.business.currency, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: amt % 1 === 0 ? 0 : 2,
                      })}
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
                  style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, background: '#F5F5F4', border: '1.5px solid #E7E5E4', color: '#1C1917', borderRadius: '12px' }}
                  min="1"
                />
              </div>
            </div>

            {/* Optional Note & Customer Info */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716C', display: 'block', marginBottom: '0.75rem' }}>
                {t('tip.customerMessageLabel') || t('tip.optionalMessageTitle')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder={t('tip.customerNamePlaceholder') || t('tip.namePlaceholder')}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input"
                  style={{ background: '#F5F5F4', border: '1.5px solid #E7E5E4', color: '#1C1917', borderRadius: '10px' }}
                  maxLength={100}
                />
                <textarea
                  placeholder={t('tip.customerMessagePlaceholder') || t('tip.messagePlaceholder')}
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  className="input"
                  rows={2}
                  maxLength={500}
                  style={{ resize: 'vertical', background: '#F5F5F4', border: '1.5px solid #E7E5E4', color: '#1C1917', borderRadius: '10px' }}
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716C', display: 'block', marginBottom: '0.75rem' }}>
                3. {t('tip.paymentMethodTitle')}
              </span>

              {!details.hasAvailablePaymentMethod ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#D97706' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('tip.noPaymentMethods')}</div>
                  <div style={{ fontSize: '0.8rem', color: '#78716C', marginTop: '0.25rem' }}>
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
                          borderRadius: '12px',
                          background: isSelected ? 'rgba(5, 150, 105, 0.08)' : '#F5F5F4',
                          border: isSelected
                            ? '2px solid #059669'
                            : isAvailable
                            ? '1px solid #E7E5E4'
                            : '1px solid #E7E5E4',
                          opacity: isAvailable ? 1 : 0.5,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: isSelected || isAvailable ? '#059669' : '#78716C' }}>
                            {icon}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1C1917' }}>{label}</div>
                            {!isAvailable && reason && (
                              <div style={{ fontSize: '0.72rem', color: '#78716C' }}>{reason}</div>
                            )}
                          </div>
                        </div>
                        <div>
                          {isAvailable ? (
                            <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 700 }}>🟢 {t('common.active')}</span>
                          ) : (
                            <span style={{ color: '#78716C', fontSize: '0.78rem', background: '#E7E5E4', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
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
                borderRadius: '14px',
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

        {/* If tips are disabled, render the active smart tab content in the main card */}
        {details.smartQr?.enableTips === false && (
          <>
            {activeSmartTab === 'wifi' && (
              <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
                {renderWifiContent()}
              </div>
            )}
            {activeSmartTab === 'campaigns' && renderCampaignsContent()}
            {activeSmartTab === 'feedback' && (
              <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
                {renderFeedbackContent()}
              </div>
            )}
            {activeSmartTab === 'signup' && (
              <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
                {renderSignupContent()}
              </div>
            )}
          </>
        )}

        {/* Bottom Sheet / Modal for Secondary Smart QR Features */}
        {activeModal && details.smartQr && (
          <div className="smart-sheet-overlay" onClick={() => setActiveModal(null)}>
            <div className="smart-sheet-content" style={{ background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.08)', color: '#1C1917' }} onClick={(e) => e.stopPropagation()}>
              <div className="smart-sheet-handle" style={{ background: '#D6D3D1' }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #E7E5E4',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {activeModal === 'wifi' && <Wifi size={20} style={{ color: '#0284C7' }} />}
                  {activeModal === 'campaigns' && <Gift size={20} style={{ color: '#DB2777' }} />}
                  {activeModal === 'feedback' && <MessageSquareText size={20} style={{ color: '#D97706' }} />}
                  {activeModal === 'signup' && <Sparkles size={20} style={{ color: '#059669' }} />}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#1C1917' }}>
                    {activeModal === 'wifi' && (language === 'tr' ? 'Wi-Fi Bağlantısı' : 'Wi-Fi Connection')}
                    {activeModal === 'campaigns' && (language === 'tr' ? 'Özel Fırsatlar & Kampanyalar' : 'Special Offers')}
                    {activeModal === 'feedback' && (language === 'tr' ? 'Görüş & Değerlendirme' : 'Customer Feedback')}
                    {activeModal === 'signup' && (details.smartQr.signupTitle || (language === 'tr' ? 'VIP Ayrıcalık Kulübü' : 'VIP Member Club'))}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: '#F5F5F4',
                    border: '1px solid #E7E5E4',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#57534E',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {activeModal === 'wifi' && renderWifiContent()}
              {activeModal === 'campaigns' && renderCampaignsContent()}
              {activeModal === 'feedback' && renderFeedbackContent()}
              {activeModal === 'signup' && renderSignupContent()}
            </div>
          </div>
        )}

        {/* Social Media & Contact Links ("Bizi Takip Edin") */}
        {renderSocialLinks()}

        <div style={{ textAlign: 'center', marginTop: '2.25rem', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <img src="/naponi-brand.svg" alt="Naponi" style={{ height: '28px', width: 'auto', opacity: 0.9 }} />
          <span style={{ fontSize: '0.75rem', color: '#78716C' }}>{t('home.footerTagline')}</span>
        </div>
      </div>
    </div>
  );
};
