import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { BusinessAnalytics, Business } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { LoadingState, SkeletonCard } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  Users,
  UtensilsCrossed,
  QrCode,
  CreditCard,
  Plus,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  FileText,
  Check,
  X,
  Clock,
  Split,
  Heart,
  MessageSquareHeart,
  Award,
  Crown,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { AgreementModal } from '../../components/AgreementModal';
import { CustomerFeedbacks } from '../../components/CustomerFeedbacks';
import { TipPoolSettlementModal } from '../../components/TipPoolSettlementModal';
import { PlanGuardStatusModal } from '../../components/business/PlanGuardStatusModal';
import { usePageTitle } from '../../hooks/usePageTitle';

export const BusinessDashboard: React.FC = () => {
  const { t, formatCurrency, formatTime, language } = useLanguage();
  usePageTitle(t('nav.dashboard'));
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(true);
  const [showAgreementModal, setShowAgreementModal] = useState<boolean>(false);
  const [showSettlementModal, setShowSettlementModal] = useState<boolean>(false);
  const [showPlanGuardModal, setShowPlanGuardModal] = useState<boolean>(false);
  const [founderCardCollapsed, setFounderCardCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('naponi_founder_card_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/business'),
      api.get('/business/analytics'),
      api.get('/agreements/active').catch(() => ({ data: { data: { is_accepted: true } } })),
    ])
      .then(([bizRes, analyticsRes, agreementRes]) => {
        setBusiness(bizRes.data.data);
        setAnalytics(analyticsRes.data.data);
        if (agreementRes?.data?.data) {
          setAgreementAccepted(!!agreementRes.data.data.is_accepted);
        }
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleVerifyTip = async (tipId: string) => {
    try {
      setVerifyingId(tipId);
      await api.put(`/business/tips/${tipId}/verify`);
      loadData();
    } catch {
      alert(t('common.error'));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRejectTip = async (tipId: string) => {
    const confirmed = window.confirm(t('business.rejectConfirmPrompt'));
    if (!confirmed) return;

    try {
      setRejectingId(tipId);
      await api.put(`/business/tips/${tipId}/reject`);
      loadData();
    } catch {
      alert(t('common.error'));
    } finally {
      setRejectingId(null);
    }
  };

  // Receipt Modal State & Action
  const [receiptModalTip, setReceiptModalTip] = useState<any | null>(null);
  const [receiptEmail, setReceiptEmail] = useState('');
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);
  const [receiptStatus, setReceiptStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleOpenReceiptModal = (tip: any) => {
    setReceiptModalTip(tip);
    setReceiptEmail(tip.customer_email || '');
    setReceiptStatus(null);
  };

  const handleSendReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptModalTip || !receiptEmail.trim()) return;

    try {
      setIsSendingReceipt(true);
      setReceiptStatus(null);
      const res = await api.post(`/business/tips/${receiptModalTip.id}/send-receipt`, {
        email: receiptEmail.trim(),
        language,
      });
      setReceiptStatus({
        success: true,
        message: res.data.message || (language === 'tr' ? 'Makbuz başarıyla iletildi.' : 'Receipt sent successfully.'),
      });
      setTimeout(() => {
        setReceiptModalTip(null);
        setReceiptStatus(null);
      }, 2000);
    } catch (err: any) {
      setReceiptStatus({
        success: false,
        message: err.response?.data?.error || (language === 'tr' ? 'Makbuz gönderilirken bir hata oluştu.' : 'Failed to send receipt.'),
      });
    } finally {
      setIsSendingReceipt(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="page-wrapper">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const currency = business?.currency || 'USD';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {business?.logo && (
            <img
              src={business.logo}
              alt={business.name}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                background: 'rgba(255, 255, 255, 0.03)',
                flexShrink: 0,
              }}
            />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 className="page-title" style={{ marginBottom: 0 }}>
                {loading ? t('business.dashboardTitle') : `${business?.name || t('business.dashboardTitle')}`}
              </h1>
              {business?.is_founder_member && (
                <button
                  type="button"
                  onClick={() => setShowPlanGuardModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.15) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#fef3c7',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 12px rgba(245, 158, 11, 0.25)',
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  title={language === 'tr' ? 'Plan ve Kurucu Ayrıcalıklarını Görüntüle' : 'View Plan and Founder Privileges'}
                >
                  <Award size={15} style={{ color: '#fbbf24' }} />
                  <span>{t('auth.founderActiveBadge')}</span>
                </button>
              )}
            </div>
            <p className="page-subtitle mb-0" style={{ marginTop: '0.35rem' }}>
              {business?.is_founder_member
                ? t('auth.founderDashboardNote')
                : t('business.dashboardSubtitle')}
            </p>
          </div>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            onClick={() => setShowSettlementModal(true)}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: 'rgba(99, 102, 241, 0.4)',
              color: 'var(--primary)',
              background: 'rgba(99, 102, 241, 0.08)',
            }}
          >
            <Split size={16} /> {t('business.distributeTipsBtn')}
          </button>
          <Link to="/business/qr" className="btn btn-secondary">
            <QrCode size={16} /> {t('nav.qrCodes')}
          </Link>
          <Link to="/business/employees" className="btn btn-primary">
            <Plus size={16} /> {t('business.addStaffBtn')}
          </Link>
        </div>
      </div>

      {/* 2026 Founder Member Privilege Banner */}
      {!loading && business?.is_founder_member && (
        <div
          className="glass-card"
          style={{
            marginBottom: '1.5rem',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(30, 27, 75, 0.3) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(245, 158, 11, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle gold decorative glow */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: founderCardCollapsed ? '0' : '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  flexShrink: 0,
                }}
              >
                <Crown size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fef3c7', letterSpacing: '-0.01em' }}>
                    {t('founder.dashboardBannerTitle')}
                  </h3>
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#fbbf24',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    2026 VIP
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '0.2rem 0 0', lineHeight: 1.4 }}>
                  {t('founder.dashboardBannerSubtitle')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowPlanGuardModal(true)}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24',
                  background: 'rgba(245, 158, 11, 0.12)',
                }}
              >
                <ShieldCheck size={14} />
                <span>{language === 'tr' ? 'Plan & Kapasite' : 'Plan & Quotas'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextState = !founderCardCollapsed;
                  setFounderCardCollapsed(nextState);
                  try {
                    localStorage.setItem('naponi_founder_card_collapsed', String(nextState));
                  } catch {}
                }}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  background: 'rgba(245, 158, 11, 0.08)',
                }}
              >
                {founderCardCollapsed ? (
                  <>
                    <ChevronDown size={14} /> {t('founder.showDetails')}
                  </>
                ) : (
                  <>
                    <ChevronUp size={14} /> {t('founder.hideDetails')}
                  </>
                )}
              </button>
            </div>
          </div>

          {!founderCardCollapsed && (
            <>
              {/* 4 Feature Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <CheckCircle2 size={16} />
                    <span>{t('founder.perk1Title')}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                    {t('founder.perk1Desc')}
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <CheckCircle2 size={16} />
                    <span>{t('founder.perk2Title')}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                    {t('founder.perk2Desc')}
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <CheckCircle2 size={16} />
                    <span>{t('founder.perk3Title')}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                    {t('founder.perk3Desc')}
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <CheckCircle2 size={16} />
                    <span>{t('founder.perk4Title')}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                    {t('founder.perk4Desc')}
                  </p>
                </div>
              </div>

              {/* Bottom Notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.76rem',
                  color: '#94a3b8',
                }}
              >
                <span>🛡️ {t('founder.disclaimer')}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Post-2026 / Standard Member Plan Guard Banner */}
      {!loading && !business?.is_founder_member && (
        <div
          className="glass-card"
          style={{
            marginBottom: '1.5rem',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(30, 27, 75, 0.3) 100%)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {language === 'tr' ? 'Standart Üyelik Planı (Kotalı)' : 'Standard Membership Plan (Quota Capped)'}
                </h3>
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  Standard
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                {language === 'tr'
                  ? 'Maksimum 10 masa ve 5 personel sınırı devrededir. Sınırsız kapasite ve POS entegrasyonu için detayları inceleyin.'
                  : 'Limited to 10 tables and 5 staff. View plan details for unlimited capacity and POS integrations.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPlanGuardModal(true)}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: 'rgba(59, 130, 246, 0.4)',
              color: '#60a5fa',
            }}
          >
            <ShieldCheck size={15} />
            <span>{language === 'tr' ? 'Kapasiteyi İncele' : 'View Quotas'}</span>
          </button>
        </div>
      )}

      {/* Agreement Status Banner */}
      {!loading && !agreementAccepted && (
        <div
          className="glass-card"
          style={{
            marginBottom: '1.5rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px', flex: 1 }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#fef3c7' }}>
                  {t('business.agreementPendingTitle')}
                </h3>
                <span
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#fbbf24',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {t('common.pending') || 'Onay Bekliyor'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
                {t('business.agreementPendingDesc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAgreementModal(true)}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              flexShrink: 0,
              cursor: 'pointer',
              borderRadius: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            <FileText size={16} />
            <span>{t('business.reviewAgreementBtn')}</span>
          </button>
        </div>
      )}

      {/* Quick Setup & Activation Guide */}
      {!loading &&
        (() => {
          const s1 = (analytics?.activePaymentMethodsCount || 0) > 0;
          const s2 = (analytics?.employeeCount || 0) > 0;
          const s3 = (analytics?.tableCount || 0) > 0;
          const s4 = (analytics?.qrCount || 0) > 0;
          const allCompleted = s1 && s2 && s3 && s4;

          if (allCompleted) return null;

          const completedCount = [s1, s2, s3, s4].filter(Boolean).length;

          return (
            <div
              className="glass-card"
              style={{
                marginBottom: '1.5rem',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Sparkles size={18} color="var(--accent-primary)" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                      {t('business.activationTitle')}
                    </h3>
                    <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
                      {completedCount} / 4
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {t('business.activationDesc')}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {[
                  { title: t('business.activationStep1'), done: s1, link: '/business/payment-settings' },
                  { title: t('business.activationStep2'), done: s2, link: '/business/employees' },
                  { title: t('business.activationStep3'), done: s3, link: '/business/qr?tab=tables' },
                  { title: t('business.activationStep4'), done: s4, link: '/business/qr' },
                ].map((step, idx) => (
                  <Link
                    key={idx}
                    to={step.link}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: step.done ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: step.done
                        ? '1px solid rgba(16, 185, 129, 0.25)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: step.done ? 'var(--success-bg)' : 'rgba(255, 255, 255, 0.08)',
                          color: step.done ? '#34d399' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {step.done ? <Check size={13} /> : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          color: step.done ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {step.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: step.done ? '#34d399' : 'var(--accent-primary)',
                      }}
                    >
                      {step.done ? t('business.activationDone') : t('business.activationAction')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

      {/* Financial Metrics */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="metrics-grid">
          <MetricCard
            label={t('business.todayTips')}
            value={formatCurrency(analytics?.todayTips || 0, currency)}
            icon={<DollarSign size={24} />}
            subtitle={t('business.today')}
          />
          <MetricCard
            label={t('business.weeklyTips')}
            value={formatCurrency(analytics?.weeklyTips || 0, currency)}
            icon={<TrendingUp size={24} />}
            subtitle={t('business.last7Days')}
          />
          <MetricCard
            label={t('business.monthlyTips')}
            value={formatCurrency(analytics?.monthlyTips || 0, currency)}
            icon={<Calendar size={24} />}
            subtitle={t('business.thisMonth')}
          />
          <MetricCard
            label={t('business.totalTips')}
            value={formatCurrency(analytics?.totalTips || 0, currency)}
            icon={<Layers size={24} />}
            subtitle={
              analytics?.pendingTipCount && analytics.pendingTipCount > 0
                ? `${analytics.tipCount || 0} ${t('business.tipCount')} (${analytics.pendingTipCount} ${t('tip.statusPending')})`
                : `${analytics?.tipCount || 0} ${t('business.tipCount')}`
            }
          />
        </div>
      )}

      {/* Operations Metrics */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="metrics-grid">
          <MetricCard
            label={t('business.staffCount')}
            value={analytics?.employeeCount || 0}
            icon={<Users size={24} />}
          />
          <MetricCard
            label={t('business.tablesCount')}
            value={analytics?.tableCount || 0}
            icon={<UtensilsCrossed size={24} />}
          />
          <MetricCard
            label={t('business.qrCodesCount')}
            value={analytics?.qrCount || 0}
            icon={<QrCode size={24} />}
          />
          <MetricCard
            label={t('business.activeChannels')}
            value={analytics?.activePaymentMethodsCount || 0}
            icon={<CreditCard size={24} />}
          />
        </div>
      )}

      {/* Recent Tips Table */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div className="section-header mb-0">
            <Sparkles size={20} className="section-icon" />
            <h2 className="section-title">{t('business.recentActivity')}</h2>
          </div>
          <Link
            to="/business/analytics"
            style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {t('business.viewAllAnalytics')} <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingState compact message={t('common.loading')} />
        ) : analytics?.recentTips && analytics.recentTips.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="desktop-tips-table table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('common.time')}</th>
                    <th>{t('common.amount')}</th>
                    <th>{language === 'tr' ? 'Personel / Masa' : 'Staff / Table'}</th>
                    <th>{language === 'tr' ? 'Misafir Notu & Rozet' : 'Guest Note & Badge'}</th>
                    <th>{t('nav.paymentMethods')}</th>
                    <th>{t('common.status')}</th>
                    <th style={{ textAlign: 'right' }}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentTips.map((tip) => (
                    <tr key={tip.id}>
                      <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatTime(tip.created_at)}
                      </td>
                      <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatCurrency(Number(tip.amount), tip.currency || business?.currency || 'TRY')}
                      </td>
                      <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {tip.employee_name ? (
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tip.employee_name}</span>
                        ) : tip.table_name ? (
                          <span style={{ color: 'var(--text-secondary)' }}>Masa: {tip.table_name}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>İşletme Geneli</span>
                        )}
                      </td>
                      <td>
                        {tip.customer_message ? (
                          <div>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: 'rgba(236, 72, 153, 0.1)',
                              color: '#ec4899',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              maxWidth: '220px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }} title={tip.customer_message}>
                              <Heart size={12} style={{ fill: '#ec4899', flexShrink: 0 }} />
                              <span>{tip.customer_message}</span>
                            </div>
                            {tip.customer_name && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                👤 {tip.customer_name}
                              </div>
                            )}
                          </div>
                        ) : tip.customer_name ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            👤 {tip.customer_name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {tip.payment_method.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {tip.status === 'UNVERIFIED' || tip.status === 'PENDING' ? (
                          <span className="badge badge-warning">
                            {tip.status === 'PENDING'
                              ? (language === 'tr' ? 'Kart/Link Onayı Bekliyor' : 'Card Link Pending')
                              : (language === 'tr' ? 'Havale Onayı Bekliyor' : 'Wire Pending')}
                          </span>
                        ) : tip.status === 'CANCELLED' ? (
                          <span className="badge badge-danger">
                            {language === 'tr' ? 'İptal Edildi' : 'Cancelled'}
                          </span>
                        ) : (
                          <span className="badge badge-success">{t('common.success')}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {tip.status === 'UNVERIFIED' || tip.status === 'PENDING' ? (
                          <div className="inline-actions" style={{ justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => handleVerifyTip(tip.id)}
                              disabled={verifyingId === tip.id || rejectingId === tip.id}
                              className="btn btn-primary"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                            >
                              <Check size={13} />
                              <span>{verifyingId === tip.id ? '...' : t('business.confirmTransferBtn')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectTip(tip.id)}
                              disabled={verifyingId === tip.id || rejectingId === tip.id}
                              className="btn btn-secondary"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.3rem 0.65rem',
                                whiteSpace: 'nowrap',
                                color: '#f87171',
                                borderColor: 'rgba(239, 68, 68, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title={t('business.rejectTransferBtn')}
                            >
                              <X size={13} />
                              <span>{rejectingId === tip.id ? '...' : t('business.rejectTransferBtn')}</span>
                            </button>
                          </div>
                        ) : tip.status === 'SUCCESS' ? (
                          <div className="inline-actions" style={{ justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenReceiptModal(tip)}
                              className="btn btn-secondary"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.3rem 0.65rem',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                color: 'var(--text-primary)',
                              }}
                              title={language === 'tr' ? 'Müşteriye Resmi Makbuz Gönder' : 'Send Official Receipt to Customer'}
                            >
                              <Mail size={13} style={{ color: '#10b981' }} />
                              <span>{language === 'tr' ? 'Makbuz Gönder' : 'Send Receipt'}</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="mobile-tips-list">
              {analytics.recentTips.map((tip) => (
                <div key={tip.id} className="mobile-tip-card">
                  <div className="mobile-tip-card-top">
                    <div className="mobile-tip-card-amount">
                      {formatCurrency(Number(tip.amount), tip.currency || business?.currency || 'TRY')}
                    </div>
                    <div>
                      {tip.status === 'UNVERIFIED' || tip.status === 'PENDING' ? (
                        <span className="badge badge-warning">
                          {tip.status === 'PENDING'
                            ? (language === 'tr' ? 'Kart/Link Onayı Bekliyor' : 'Card Link Pending')
                            : (language === 'tr' ? 'Havale Onayı Bekliyor' : 'Wire Pending')}
                        </span>
                      ) : tip.status === 'CANCELLED' ? (
                        <span className="badge badge-danger">
                          {language === 'tr' ? 'İptal Edildi' : 'Cancelled'}
                        </span>
                      ) : (
                        <span className="badge badge-success">{t('common.success')}</span>
                      )}
                    </div>
                  </div>

                  <div className="mobile-tip-card-meta">
                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                      {tip.payment_method.replace(/_/g, ' ')}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.25rem' }}>
                      <Clock size={13} />
                      {formatTime(tip.created_at)}
                    </span>
                  </div>

                  {(tip.employee_name || tip.table_name) && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      {tip.employee_name ? `👤 ${tip.employee_name}` : ''}
                      {tip.employee_name && tip.table_name ? ' • ' : ''}
                      {tip.table_name ? `Masa: ${tip.table_name}` : ''}
                    </div>
                  )}

                  {tip.customer_message && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(236, 72, 153, 0.1)',
                      color: '#ec4899',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginTop: '0.45rem',
                    }}>
                      <Heart size={13} style={{ fill: '#ec4899', flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tip.customer_message}</span>
                      {tip.customer_name && (
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.72rem', flexShrink: 0 }}>
                          — {tip.customer_name}
                        </span>
                      )}
                    </div>
                  )}

                  {(tip.status === 'UNVERIFIED' || tip.status === 'PENDING') && (
                    <div className="mobile-tip-card-actions">
                      <button
                        type="button"
                        onClick={() => handleVerifyTip(tip.id)}
                        disabled={verifyingId === tip.id || rejectingId === tip.id}
                        className="btn btn-primary"
                      >
                        <Check size={16} />
                        <span>{verifyingId === tip.id ? '...' : t('business.confirmTransferBtn')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectTip(tip.id)}
                        disabled={verifyingId === tip.id || rejectingId === tip.id}
                        className="btn btn-secondary"
                        style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)' }}
                        title={t('business.rejectTransferBtn')}
                      >
                        <X size={16} />
                        <span>{rejectingId === tip.id ? '...' : t('business.rejectTransferBtn')}</span>
                      </button>
                    </div>
                  )}

                  {tip.status === 'SUCCESS' && (
                    <div className="mobile-tip-card-actions" style={{ marginTop: '0.55rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenReceiptModal(tip)}
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          padding: '0.5rem',
                        }}
                      >
                        <Mail size={15} style={{ color: '#10b981' }} />
                        <span>{language === 'tr' ? 'Müşteriye Makbuz Gönder' : 'Send Receipt to Customer'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<DollarSign size={28} />}
            title={t('business.noTipsYet')}
            description={t('business.dashboardSubtitle')}
            action={
              <Link to="/business/qr" className="btn btn-primary">
                <QrCode size={16} /> {t('business.generateQrBtn')}
              </Link>
            }
          />
        )}
      </div>

      {/* Customer Feedbacks & Rating Analytics */}
      <CustomerFeedbacks />

      <AgreementModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        onAccepted={() => {
          setAgreementAccepted(true);
          loadData();
        }}
      />

      <TipPoolSettlementModal
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        currency={currency}
        businessName={business?.name}
        onSettled={loadData}
      />

      <PlanGuardStatusModal
        isOpen={showPlanGuardModal}
        onClose={() => setShowPlanGuardModal(false)}
      />

      {/* Manual Digital Receipt Modal */}
      {receiptModalTip && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => !isSendingReceipt && setReceiptModalTip(null)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '1.75rem',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              background: 'var(--bg-card, #1c1917)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                  }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    {language === 'tr' ? 'Dijital Makbuz Gönder' : 'Send Digital Receipt'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    TIP-{receiptModalTip.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalTip(null)}
                disabled={isSendingReceipt}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tip Summary Badge */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '0.9rem 1.1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {language === 'tr' ? 'Bahşiş Tutarı' : 'Tip Amount'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  {formatCurrency(Number(receiptModalTip.amount), receiptModalTip.currency || business?.currency || 'TRY')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                  {receiptModalTip.payment_method?.replace(/_/g, ' ')}
                </span>
                {receiptModalTip.employee_name && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    👤 {receiptModalTip.employee_name}
                  </div>
                )}
              </div>
            </div>

            {receiptStatus && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: receiptStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${receiptStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: receiptStatus.success ? '#10b981' : '#f87171',
                }}
              >
                {receiptStatus.success ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                <span>{receiptStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSendReceipt}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="customer-receipt-email"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}
                >
                  {language === 'tr' ? 'Müşteri E-Posta Adresi' : 'Customer Email Address'}
                </label>
                <input
                  id="customer-receipt-email"
                  type="email"
                  required
                  placeholder="ornek@musteri.com"
                  value={receiptEmail}
                  onChange={(e) => setReceiptEmail(e.target.value)}
                  disabled={isSendingReceipt}
                  className="input"
                  style={{ width: '100%', fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
                  autoFocus
                />
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'tr'
                    ? 'Bu e-postaya işletmenizin adına resmi doğrulanmış dijital bahşiş fişi iletilecektir.'
                    : 'An official verified digital tip receipt will be sent to this email on behalf of your venue.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReceiptModalTip(null)}
                  disabled={isSendingReceipt}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  {language === 'tr' ? 'Vazgeç' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSendingReceipt || !receiptEmail.trim()}
                  className="btn btn-primary"
                  style={{ flex: 1.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  {isSendingReceipt ? (
                    <span>{language === 'tr' ? 'Gönderiliyor...' : 'Sending...'}</span>
                  ) : (
                    <>
                      <Mail size={15} />
                      <span>{language === 'tr' ? 'Makbuzu Gönder' : 'Send Receipt'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
