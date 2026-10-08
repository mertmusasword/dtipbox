import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { SetupChecklist } from '../../onboarding/SetupChecklist';
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
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { AgreementModal } from '../../components/AgreementModal';
import { CustomerFeedbacks } from '../../components/CustomerFeedbacks';
import { TipPoolSettlementModal } from '../../components/TipPoolSettlementModal';
import { PlanGuardStatusModal } from '../../components/business/PlanGuardStatusModal';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useToast } from '../../components/Toast';

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

  const { showToast } = useToast();
  const [tipsFilter, setTipsFilter] = useState<'ALL' | 'SUCCESS' | 'UNVERIFIED'>('ALL');
  const [dashboardTips, setDashboardTips] = useState<any[] | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState<'VERIFY' | 'REJECT' | null>(null);

  const fetchFilteredTips = useCallback(async (filter: 'ALL' | 'SUCCESS' | 'UNVERIFIED') => {
    try {
      setLoadingTips(true);
      const statusParam = filter === 'UNVERIFIED' ? 'UNVERIFIED_OR_PENDING' : filter;
      const res = await api.get(`/business/tips?status=${statusParam}&limit=50`);
      if (res.data?.data?.tips) {
        setDashboardTips(res.data.data.tips);
      }
    } catch (err) {
      console.error('Failed to fetch filtered tips:', err);
    } finally {
      setLoadingTips(false);
    }
  }, []);

  useEffect(() => {
    fetchFilteredTips(tipsFilter);
  }, [tipsFilter, fetchFilteredTips]);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleVerifyTip = async (tipId: string) => {
    try {
      setVerifyingId(tipId);
      await api.put(`/business/tips/${tipId}/verify`);
      showToast(language === 'tr' ? 'Transfer başarıyla onaylandı.' : 'Transfer verified.', 'success');
      loadData();
      fetchFilteredTips(tipsFilter);
    } catch {
      showToast(t('common.error'), 'error');
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
      showToast(language === 'tr' ? 'Transfer iptal edildi.' : 'Transfer rejected.', 'info');
      loadData();
      fetchFilteredTips(tipsFilter);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setRejectingId(null);
    }
  };

  const handleBulkVerifyDashboard = async () => {
    try {
      setBulkActionLoading('VERIFY');
      const res = await api.post('/business/tips/verify-all');
      showToast(res.data?.message || (language === 'tr' ? 'Tüm transferler onaylandı.' : 'All transfers verified.'), 'success');
      loadData();
      fetchFilteredTips(tipsFilter);
    } catch {
      showToast('Toplu onay sırasında hata oluştu.', 'error');
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkRejectDashboard = async () => {
    if (!window.confirm(language === 'tr' ? 'Onay bekleyen tüm transferleri iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.' : 'Are you sure you want to cancel all pending transfers?')) return;
    try {
      setBulkActionLoading('REJECT');
      const res = await api.post('/business/tips/reject-all');
      showToast(res.data?.message || (language === 'tr' ? 'Transferler iptal edildi.' : 'Transfers rejected.'), 'info');
      loadData();
      fetchFilteredTips(tipsFilter);
    } catch {
      showToast('Toplu iptal sırasında hata oluştu.', 'error');
    } finally {
      setBulkActionLoading(null);
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
          data-tour="agreement-alert"
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

      {/* Setup checklist (onboarding) */}
      {!loading && <SetupChecklist />}

      {/* Pending Bank/IBAN Transfers Alert Banner */}
      {!loading && analytics?.pendingTipCount && analytics.pendingTipCount > 0 ? (
        <div
          className="glass-card"
          style={{
            marginBottom: '1.5rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(180, 83, 9, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
            boxShadow: '0 4px 24px rgba(245, 158, 11, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px', flex: 1 }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fef3c7' }}>
                  {language === 'tr'
                    ? `${analytics.pendingTipCount} Adet Onay Bekleyen Havale / EFT Bahşişi Var!`
                    : `${analytics.pendingTipCount} Pending Bank Transfer Tips Require Verification!`}
                </h3>
                <span
                  style={{
                    background: '#f59e0b',
                    color: '#000000',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {analytics.pendingTipCount} {language === 'tr' ? 'BEKLEYEN' : 'PENDING'}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
                {language === 'tr'
                  ? 'Müşterilerinizin IBAN yoluyla gönderdiği bahşişleri hesap hareketlerinizle eşleştirip tek tıkla onaylayabilir veya iptal edebilirsiniz.'
                  : 'Review incoming customer bank transfers against your bank statements to verify or reject with one click.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setTipsFilter('UNVERIFIED');
                const el = document.getElementById('recent-tips-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <span>{language === 'tr' ? 'Hemen İncele & Onayla' : 'Review & Verify Now'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : null}

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
      <div id="recent-tips-section" className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="section-header mb-0">
            <Sparkles size={20} className="section-icon" />
            <h2 className="section-title">{t('business.recentActivity')}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Filter Tabs */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <button
                type="button"
                onClick={() => setTipsFilter('ALL')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s',
                  background: tipsFilter === 'ALL' ? 'var(--accent-primary, #6366f1)' : 'transparent',
                  color: tipsFilter === 'ALL' ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                }}
              >
                {language === 'tr' ? 'Tümü' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setTipsFilter('SUCCESS')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s',
                  background: tipsFilter === 'SUCCESS' ? '#10b981' : 'transparent',
                  color: tipsFilter === 'SUCCESS' ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                }}
              >
                {language === 'tr' ? 'Başarılı' : 'Successful'}
              </button>
              <button
                type="button"
                onClick={() => setTipsFilter('UNVERIFIED')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: tipsFilter === 'UNVERIFIED'
                    ? '#f59e0b'
                    : (analytics?.pendingTipCount && analytics.pendingTipCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'transparent'),
                  color: tipsFilter === 'UNVERIFIED'
                    ? '#000000'
                    : (analytics?.pendingTipCount && analytics.pendingTipCount > 0 ? '#f59e0b' : 'var(--text-secondary, #94a3b8)'),
                }}
              >
                <span>⏳ {language === 'tr' ? 'Onay Bekleyenler' : 'Pending Approval'}</span>
                {analytics?.pendingTipCount && analytics.pendingTipCount > 0 ? (
                  <span
                    style={{
                      background: tipsFilter === 'UNVERIFIED' ? '#000000' : '#f59e0b',
                      color: tipsFilter === 'UNVERIFIED' ? '#ffffff' : '#000000',
                      borderRadius: '999px',
                      padding: '1px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}
                  >
                    {analytics.pendingTipCount}
                  </span>
                ) : null}
              </button>
            </div>

            <Link
              to="/business/analytics"
              style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {t('business.viewAllAnalytics')} <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading || loadingTips ? (
          <LoadingState compact message={t('common.loading')} />
        ) : (dashboardTips !== null ? dashboardTips : (analytics?.recentTips || [])).length > 0 ? (
          <>
            {tipsFilter === 'UNVERIFIED' && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.85rem', color: '#fef3c7', fontWeight: 600 }}>
                    {language === 'tr'
                      ? `${(dashboardTips || []).length} adet transfer onayınızı bekliyor.`
                      : `${(dashboardTips || []).length} transfers awaiting verification.`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={bulkActionLoading !== null}
                    onClick={handleBulkVerifyDashboard}
                    className="btn btn-primary"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      background: '#10b981',
                      borderColor: '#059669',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>{bulkActionLoading === 'VERIFY' ? 'Onaylanıyor...' : (language === 'tr' ? '✨ Tümünü Onayla' : 'Approve All')}</span>
                  </button>
                  <button
                    type="button"
                    disabled={bulkActionLoading !== null}
                    onClick={handleBulkRejectDashboard}
                    className="btn btn-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      color: '#f87171',
                      borderColor: 'rgba(239, 68, 68, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <X size={14} />
                    <span>{bulkActionLoading === 'REJECT' ? 'İptal Ediliyor...' : (language === 'tr' ? 'Tümünü İptal Et' : 'Reject All')}</span>
                  </button>
                </div>
              </div>
            )}

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
                  {(dashboardTips !== null ? dashboardTips : (analytics?.recentTips || [])).map((tip) => (
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
              {(dashboardTips !== null ? dashboardTips : (analytics?.recentTips || [])).map((tip) => (
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
        ) : tipsFilter === 'UNVERIFIED' ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '14px',
            }}
          >
            <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
              {language === 'tr' ? 'Onay bekleyen hiçbir transfer bulunmuyor!' : 'No pending transfers!'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
              {language === 'tr' ? 'Tüm havale bildirimleri onaylanmış veya incelenmiştir.' : 'All wire transfer notifications have been reviewed.'}
            </div>
          </div>
        ) : tipsFilter === 'SUCCESS' ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px',
            }}
          >
            <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>
              {language === 'tr' ? 'Henüz başarılı bir bahşiş hareketi bulunmuyor.' : 'No successful tips yet.'}
            </div>
          </div>
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
        onSettled={() => {
          loadData();
          fetchFilteredTips(tipsFilter);
        }}
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
