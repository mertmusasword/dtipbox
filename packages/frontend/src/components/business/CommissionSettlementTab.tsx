import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../i18n';
import { getCommissionText } from '../../i18n/commissionLocales';
import { useToast } from '../Toast';
import {
  Coins,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Crown,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Receipt,
  X,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  Lock,
  Info,
} from 'lucide-react';

interface SettlementPeriod {
  periodKey: string;
  year: number;
  month: number;
  totalTipsVolume: number;
  cardTipsVolume: number;
  bankTipsVolume: number;
  cashTipsVolume: number;
  totalTipsCount: number;
  commissionRate: number;
  totalCommission: number;
  cardCommission: number;
  bankCommissionTotal: number;
  bankCommissionSettled: number;
  bankCommissionPending: number;
  status: 'CURRENT_OPEN' | 'PENDING_PAYMENT' | 'PENDING_VERIFICATION' | 'SETTLED';
  dueDate: string;
}

interface CommissionReport {
  business: {
    id: string;
    name: string;
    currency: string;
    isFounderMember: boolean;
    membershipPlan: string;
  };
  summary: {
    totalTipsVolume: number;
    cardTipsVolume: number;
    bankTipsVolume: number;
    cashTipsVolume: number;
    totalTipsCount: number;
    unverifiedTipsVolume?: number;
    unverifiedTipsCount?: number;
    platformFeeRate: number;
    totalPlatformFee: number;
    cardPlatformFee: number;
    bankPlatformFeeTotal: number;
    bankPlatformFeeSettled: number;
    bankPlatformFeePending: number;
    currency: string;
    hasPendingDeclaration?: boolean;
    pendingDeclarationDetails?: {
      declaredAt: string | Date;
      note?: string;
      declaredAmount: number;
      periodKey?: string;
    } | null;
  };
  monthlyPeriods: SettlementPeriod[];
  settlementIbanInfo: {
    companyName: string;
    taxOffice?: string;
    taxNumber?: string;
    bankName: string;
    iban: string;
    swiftCode?: string;
    fastAddress?: string;
    paymentReference: string;
    accounts?: Array<{
      currency: string;
      currencySymbol: string;
      label: string;
      bankName: string;
      iban: string;
      swiftCode?: string;
      fastAddress?: string;
    }>;
  };
}

export const SETTLEMENT_MIN_THRESHOLDS: Record<string, number> = {
  TRY: 100,
  USD: 5,
  EUR: 5,
  GBP: 5,
};

export const CommissionSettlementTab: React.FC = () => {
  const { language, formatCurrency } = useLanguage();
  const isRtl = language === 'ar';
  const ct = getCommissionText(language);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<CommissionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Settlement Modal State
  const [selectedPeriod, setSelectedPeriod] = useState<SettlementPeriod | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [settlementNote, setSettlementNote] = useState('');
  const [selectedAccountCurrency, setSelectedAccountCurrency] = useState<string>('TRY');

  // Credit Card / Apple Pay Checkout State
  const [searchParams, setSearchParams] = useSearchParams();
  const cardSettledProcessedRef = useRef(false);
  const [settlementMethod, setSettlementMethod] = useState<'CARD' | 'WIRE'>('CARD');
  const [startingCardPayment, setStartingCardPayment] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/business/commissions');
      if (res.data?.data) {
        setReport(res.data.data);
        if (res.data.data.summary?.currency) {
          setSelectedAccountCurrency(res.data.data.summary.currency);
        }
      }
    } catch (err: any) {
      console.error('Failed to load commissions report:', err);
      setError(err.response?.data?.error || ct.settleError);
    } finally {
      setLoading(false);
    }
  }, [ct.settleError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Lemon Squeezy return redirect (?settled=success)
  useEffect(() => {
    if (searchParams.get('settled') === 'success' && !cardSettledProcessedRef.current) {
      cardSettledProcessedRef.current = true;
      showToast('Kredi kartı ile komisyon ödemeniz başarıyla alındı ve mutabakatınız anında kapatıldı! 🎉', 'success');
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('settled');
      nextParams.delete('period');
      setSearchParams(nextParams, { replace: true });
      loadData();
    }
  }, [searchParams, setSearchParams, showToast, loadData]);

  const handleCardPayment = async () => {
    try {
      setStartingCardPayment(true);
      const res = await api.post('/business/commissions/card-checkout', {
        periodKey: selectedPeriod ? selectedPeriod.periodKey : undefined,
      });
      const checkoutUrl = res.data?.data?.checkoutUrl;
      if (checkoutUrl) {
        showToast('Güvenli ödeme sayfasına yönlendiriliyorsunuz...', 'info');
        window.location.href = checkoutUrl;
      } else {
        showToast('Ödeme oturumu başlatılamadı.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Ödeme oturumu başlatılamadı.', 'error');
    } finally {
      setStartingCardPayment(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(ct.copied);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleOpenSettlement = (period?: SettlementPeriod) => {
    setSelectedPeriod(period || null);
    setSettlementNote('');
    if (report?.summary?.currency) {
      setSelectedAccountCurrency(report.summary.currency);
    }
    setIsModalOpen(true);
  };

  const handleConfirmSettlement = async () => {
    try {
      setIsSettling(true);
      await api.post('/business/commissions/settle', {
        periodKey: selectedPeriod ? selectedPeriod.periodKey : undefined,
        note: settlementNote.trim() || undefined,
      });
      showToast(ct.settleSuccess);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || ct.settleError, 'error');
    } finally {
      setIsSettling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: '#94a3b8' }}>{ct.processing}</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error || 'Error'}</p>
        <button onClick={loadData} className="btn btn-secondary">
          <RefreshCw size={16} /> {ct.btnRefresh}
        </button>
      </div>
    );
  }

  const { summary, monthlyPeriods, settlementIbanInfo } = report;
  const currency = summary.currency || 'TRY';
  const minThreshold = SETTLEMENT_MIN_THRESHOLDS[(currency || 'TRY').toUpperCase()] || 5;
  const isSummaryThresholdMet = summary.bankPlatformFeePending >= minThreshold;
  const summaryProgressPercent = Math.min(100, Math.max(0, (summary.bankPlatformFeePending / minThreshold) * 100));

  const modalAmountToPay = selectedPeriod ? selectedPeriod.bankCommissionPending : summary.bankPlatformFeePending;
  const isModalThresholdMet = modalAmountToPay >= minThreshold;
  const modalProgressPercent = Math.min(100, Math.max(0, (modalAmountToPay / minThreshold) * 100));

  const availableAccounts =
    settlementIbanInfo?.accounts && settlementIbanInfo.accounts.length > 0
      ? settlementIbanInfo.accounts
      : [
          {
            currency: 'TRY',
            currencySymbol: '₺',
            label: 'Türk Lirası (TL / FAST / EFT)',
            bankName: settlementIbanInfo.bankName,
            iban: settlementIbanInfo.iban,
            swiftCode: settlementIbanInfo.swiftCode,
            fastAddress: settlementIbanInfo.fastAddress,
          },
        ];

  const currentAccount =
    availableAccounts.find((a) => a.currency === selectedAccountCurrency) || availableAccounts[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* 1. FOUNDER VIP EXEMPTION HERO CARD */}
      <div
        className="glass-card"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(250, 204, 21, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1.5px solid rgba(250, 204, 21, 0.35)',
          borderRadius: '18px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
              flexShrink: 0,
            }}
          >
            <Crown size={26} />
          </div>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fef08a' }}>
                {ct.founderExemptionBadge}
              </h3>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                }}
              >
                100% Free SaaS
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.55 }}>
              {ct.founderExemptionDesc}
            </p>
          </div>
        </div>
      </div>

      {/* PENDING VERIFICATION BANNER */}
      {summary.hasPendingDeclaration && (
        <div
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0,
            }}
          >
            <Clock size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fef08a' }}>
                {ct.pendingVerificationBannerTitle || 'Havale Bildirimi Alındı — Kurucu Onayı Bekleniyor'}
              </h4>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  color: '#fde047',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '20px',
                }}
              >
                {ct.statusPendingVerification || 'Kurucu Onayı Bekleniyor'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.55 }}>
              {ct.pendingVerificationBannerDesc ||
                'Havaleyi gerçekleştirdiğinizi ilettiniz. Kurucu ve finans ekibimiz şirket banka hesabına geçen tutarı teyit ettikten sonra mutabakatınız onaylanacak ve borç bakiyesi sıfırlanacaktır.'}
            </p>
            {summary.pendingDeclarationDetails?.note && (
              <div style={{ marginTop: '0.65rem', fontSize: '0.82rem', color: '#fef08a', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '5px 12px', borderRadius: '8px', display: 'inline-block' }}>
                💬 <strong>İlettiğiniz Not:</strong> {summary.pendingDeclarationDetails.note}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SUMMARY METRIC CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Total Tips Volume */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>{ct.totalProcessedVolume}</span>
            <Coins size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            {formatCurrency(summary.totalTipsVolume, currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            {summary.totalTipsCount} {ct.totalTipsCount}
          </div>
        </div>

        {/* Card Tips Volume */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>{ct.cardVolume}</span>
            <CreditCard size={18} style={{ color: '#818cf8' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            {formatCurrency(summary.cardTipsVolume, currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> {formatCurrency(summary.cardPlatformFee, currency)} ({ct.cardCommissionCollected})
          </div>
        </div>

        {/* Bank Wire Tips Volume */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>{ct.bankVolume}</span>
            <Building2 size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            {formatCurrency(summary.bankTipsVolume, currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.35rem' }}>
            %0.50 {ct.bankCommissionAccrued}: {formatCurrency(summary.bankPlatformFeeTotal, currency)}
          </div>
          {Boolean(summary.unverifiedTipsCount && summary.unverifiedTipsCount > 0) && (
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 6px', borderRadius: '6px' }}>
              ⏳ {summary.unverifiedTipsCount} {language === 'tr' ? 'onay bekleyen transfer (Onaylanana kadar komisyon yansıtılmaz)' : 'pending verification (No fee until verified)'}
            </div>
          )}
        </div>

        {/* Current Pending Wire Commission Due */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            background: summary.hasPendingDeclaration
              ? 'rgba(245, 158, 11, 0.08)'
              : summary.bankPlatformFeePending > 0
              ? isSummaryThresholdMet
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(56, 189, 248, 0.08)'
              : 'rgba(16, 185, 129, 0.07)',
            border: summary.hasPendingDeclaration
              ? '1.5px solid rgba(245, 158, 11, 0.45)'
              : summary.bankPlatformFeePending > 0
              ? isSummaryThresholdMet
                ? '1.5px solid rgba(239, 68, 68, 0.35)'
                : '1.5px solid rgba(56, 189, 248, 0.35)'
              : '1.5px solid rgba(16, 185, 129, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: summary.hasPendingDeclaration
                  ? '#fde047'
                  : summary.bankPlatformFeePending > 0
                  ? isSummaryThresholdMet
                    ? '#fca5a5'
                    : '#7dd3fc'
                  : '#86efac',
                fontWeight: 700,
              }}
            >
              {ct.bankCommissionPending}
            </span>
            <Clock
              size={18}
              style={{
                color: summary.hasPendingDeclaration
                  ? '#f59e0b'
                  : summary.bankPlatformFeePending > 0
                  ? isSummaryThresholdMet
                    ? '#f87171'
                    : '#38bdf8'
                  : '#34d399',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <div
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: summary.hasPendingDeclaration
                  ? '#fde047'
                  : summary.bankPlatformFeePending > 0
                  ? isSummaryThresholdMet
                    ? '#f87171'
                    : '#38bdf8'
                  : '#34d399',
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(summary.bankPlatformFeePending, currency)}
            </div>
            {summary.bankPlatformFeePending > 0 && !summary.hasPendingDeclaration && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  background: isSummaryThresholdMet ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                  color: isSummaryThresholdMet ? '#fca5a5' : '#38bdf8',
                }}
              >
                {isSummaryThresholdMet
                  ? (language === 'tr' ? '🔔 Eşik Aşıldı' : '🔔 Due Now')
                  : `⏳ ${language === 'tr' ? 'Birikiyor' : 'Accruing'} (${language === 'tr' ? 'Eşik' : 'Min'}: ${formatCurrency(minThreshold, currency)})`}
              </span>
            )}
          </div>

          {/* Threshold Progress Bar for Pending Balance */}
          {summary.bankPlatformFeePending > 0 && !summary.hasPendingDeclaration && (
            <div style={{ marginTop: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '3px', fontWeight: 600 }}>
                <span>{language === 'tr' ? 'Asgari Kart Ödeme Eşiği' : 'Minimum Card Payment Threshold'}</span>
                <span>%{summaryProgressPercent.toFixed(1)} ({formatCurrency(minThreshold, currency)})</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.max(4, summaryProgressPercent)}%`,
                    height: '100%',
                    background: isSummaryThresholdMet
                      ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
                    borderRadius: '999px',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.35 }}>
                💡 {isSummaryThresholdMet
                  ? (language === 'tr'
                      ? `Asgari eşik aşıldı. Kredi kartı veya havale ile mutabakatınızı hemen kapatabilirsiniz.`
                      : `Threshold met. You can settle via card or bank wire now.`)
                  : (language === 'tr'
                      ? `Mikro işlem masraflarını önlemek için kartla ödeme ${formatCurrency(minThreshold, currency)} limitine ulaşıldığında açılır. Sistem kesintisiz çalışır.`
                      : `To avoid micro-transaction fees, card settlement activates once ${formatCurrency(minThreshold, currency)} is reached.`)}
              </div>
            </div>
          )}

          <div style={{ marginTop: '0.65rem' }}>
            {summary.hasPendingDeclaration ? (
              <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={13} /> {ct.btnReportedPending || 'İncelemede / Onay Bekleniyor ⏳'}
              </span>
            ) : summary.bankPlatformFeePending > 0 ? (
              isSummaryThresholdMet ? (
                <button
                  type="button"
                  onClick={() => handleOpenSettlement()}
                  className="btn btn-primary"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    borderColor: '#0284c7',
                    boxShadow: '0 2px 10px rgba(2, 132, 199, 0.35)',
                  }}
                >
                  <Receipt size={13} /> {ct.btnPaySettle}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenSettlement()}
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#38bdf8',
                    borderColor: 'rgba(56, 189, 248, 0.35)',
                  }}
                >
                  <Receipt size={13} /> {language === 'tr' ? 'Detayları İncele / Erken Kapat' : 'View Details / Settle Early'}
                </button>
              )
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={13} /> {ct.btnSettled}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. ARCHITECTURAL TRANSPARENCY NOTICE */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.06)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
        }}
      >
        <ShieldCheck size={20} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.55 }}>
          {ct.directCollectionNotice}
        </p>
      </div>

      {/* 4. MONTHLY SETTLEMENT PERIODS BREAKDOWN */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              {ct.periodsTitle}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {ct.periodsSubtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <RefreshCw size={14} /> {ct.btnRefresh}
          </button>
        </div>

        {monthlyPeriods.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            {ct.noPeriods}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>{ct.period}</th>
                  <th style={{ padding: '0.75rem' }}>{ct.totalTips}</th>
                  <th style={{ padding: '0.75rem' }}>{ct.bankTips}</th>
                  <th style={{ padding: '0.75rem' }}>{ct.cardTips}</th>
                  <th style={{ padding: '0.75rem' }}>{ct.rate}</th>
                  <th style={{ padding: '0.75rem' }}>{ct.feeAmount}</th>
                  <th style={{ padding: '0.75rem' }}>{ct.dueDate}</th>
                  <th style={{ padding: '0.75rem' }}>{ct.status}</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>{ct.action}</th>
                </tr>
              </thead>
              <tbody>
                {monthlyPeriods.map((period) => {
                  const isCurrent = period.status === 'CURRENT_OPEN';
                  const isPending = period.status === 'PENDING_PAYMENT';
                  const isSettled = period.status === 'SETTLED';

                  return (
                    <tr
                      key={period.periodKey}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isPending ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                        {period.periodKey}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {formatCurrency(period.totalTipsVolume, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#f59e0b' }}>
                        {formatCurrency(period.bankTipsVolume, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#818cf8' }}>
                        {formatCurrency(period.cardTipsVolume, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#94a3b8' }}>
                        %{period.commissionRate.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                        {formatCurrency(period.bankCommissionTotal, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                        {period.dueDate}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {period.status === 'PENDING_VERIFICATION' && (
                          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                            <Clock size={11} style={{ marginRight: '4px' }} /> {ct.statusPendingVerification || 'Kurucu Onayı Bekleniyor'}
                          </span>
                        )}
                        {isCurrent && period.status !== 'PENDING_VERIFICATION' && (
                          <span className="badge badge-neutral" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                            <Clock size={11} style={{ marginRight: '4px' }} /> {ct.statusCurrent}
                          </span>
                        )}
                        {isPending && period.status !== 'PENDING_VERIFICATION' && (
                          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <AlertTriangle size={11} style={{ marginRight: '4px' }} /> {ct.statusPending}
                          </span>
                        )}
                        {isSettled && period.status !== 'PENDING_VERIFICATION' && (
                          <span className="badge badge-success">
                            <CheckCircle2 size={11} style={{ marginRight: '4px' }} /> {ct.statusSettled}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        {period.status === 'PENDING_VERIFICATION' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenSettlement(period)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                          >
                            ⏳ {ct.btnReportedPending || 'İnceleniyor'}
                          </button>
                        ) : period.bankCommissionPending > 0.01 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenSettlement(period)}
                            className={period.bankCommissionPending >= minThreshold ? 'btn btn-primary' : 'btn btn-secondary'}
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.78rem',
                              ...(period.bankCommissionPending < minThreshold
                                ? { color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }
                                : {}),
                            }}
                          >
                            {period.bankCommissionPending >= minThreshold
                              ? ct.btnPaySettle
                              : `⏳ ${language === 'tr' ? 'Birikiyor' : 'Accruing'} (${formatCurrency(period.bankCommissionPending, currency)})`}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenSettlement(period)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          >
                            {ct.btnViewDetails}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. INTERACTIVE SETTLEMENT & WIRE PAYMENT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '560px',
              width: '100%',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Receipt size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  {ct.settlementModalTitle}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {selectedPeriod ? `${ct.period}: ${selectedPeriod.periodKey}` : ct.bankCommissionPending}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {ct.settlementModalDesc}
            </p>

            {/* Amount Due Callout */}
            <div
              style={{
                background: !isModalThresholdMet
                  ? 'rgba(56, 189, 248, 0.08)'
                  : 'rgba(239, 68, 68, 0.08)',
                border: !isModalThresholdMet
                  ? '1.5px solid rgba(56, 189, 248, 0.35)'
                  : '1.5px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '14px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', color: !isModalThresholdMet ? '#7dd3fc' : '#fca5a5', fontWeight: 600 }}>
                  {ct.amountToPay}:
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: !isModalThresholdMet ? '#38bdf8' : '#f87171' }}>
                  {formatCurrency(modalAmountToPay, currency)}
                </span>
              </div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '3px' }}>
                  <span>
                    {language === 'tr' ? 'Asgari Kartlı Ödeme Eşiği: ' : 'Minimum Card Payment Threshold: '}
                    <strong style={{ color: '#f8fafc' }}>{formatCurrency(minThreshold, currency)}</strong>
                  </span>
                  <span style={{ color: !isModalThresholdMet ? '#38bdf8' : '#10b981', fontWeight: 700 }}>
                    %{modalProgressPercent.toFixed(1)} {isModalThresholdMet ? '✓' : ''}
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(4, modalProgressPercent)}%`,
                      height: '100%',
                      background: isModalThresholdMet
                        ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSettlementMethod('CARD')}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '12px',
                  border: settlementMethod === 'CARD' ? '2px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: settlementMethod === 'CARD' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  color: settlementMethod === 'CARD' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  transition: 'all 0.2s ease',
                  boxShadow: settlementMethod === 'CARD' ? '0 0 15px rgba(2, 132, 199, 0.35)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: settlementMethod === 'CARD' ? '#38bdf8' : '#cbd5e1' }}>
                  <CreditCard size={16} />
                  <span>Kredi Kartı / Apple Pay</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: settlementMethod === 'CARD' ? '#7dd3fc' : '#64748b', fontWeight: 600 }}>
                  ⚡ Anında Otomatik Kapanır
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSettlementMethod('WIRE')}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '12px',
                  border: settlementMethod === 'WIRE' ? '2px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: settlementMethod === 'WIRE' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  color: settlementMethod === 'WIRE' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  transition: 'all 0.2s ease',
                  boxShadow: settlementMethod === 'WIRE' ? '0 0 15px rgba(2, 132, 199, 0.35)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: settlementMethod === 'WIRE' ? '#38bdf8' : '#cbd5e1' }}>
                  <Building2 size={16} />
                  <span>Banka Havalesi / FAST</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: settlementMethod === 'WIRE' ? '#7dd3fc' : '#64748b', fontWeight: 600 }}>
                  %0 Komisyonsuz Manuel
                </span>
              </button>
            </div>

            {/* OPTION 1: CREDIT CARD / APPLE PAY (INSTANT) */}
            {settlementMethod === 'CARD' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '0.5rem' }}>
                {!isModalThresholdMet ? (
                  <>
                    <div
                      style={{
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '14px',
                        padding: '1.25rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Clock size={20} style={{ color: '#38bdf8' }} />
                        <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                          {language === 'tr'
                            ? `Asgari Eşik Bilgilendirmesi (${formatCurrency(minThreshold, currency)})`
                            : `Minimum Threshold Notice (${formatCurrency(minThreshold, currency)})`}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.55 }}>
                        {language === 'tr'
                          ? `İşletmenizi mikro işlem ve kart komisyonu yükünden korumak adına, kartla ödeme butonu biriken komisyonunuz ${formatCurrency(minThreshold, currency)} limitine ulaştığında otomatik olarak aktifleşir. Bu limite ulaşana kadar sisteminiz ve QR bahşiş akışınız kesintisiz olarak çalışmaya devam eder.`
                          : `To protect your business from micro-transaction overhead, card checkout activates automatically once your accrued fee reaches ${formatCurrency(minThreshold, currency)}. Your QR tipping continues uninterrupted in the meantime.`}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.76rem', fontWeight: 600 }}>
                        <CheckCircle2 size={14} />
                        <span>
                          {language === 'tr'
                            ? 'Mevcut Durum: Sisteminiz %100 Aktif ve Kesintisizdir'
                            : 'Status: System is 100% Active and Healthy'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={true}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1.25rem',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#94a3b8',
                        cursor: 'not-allowed',
                      }}
                    >
                      <Lock size={15} />
                      <span>
                        {language === 'tr'
                          ? `Asgari Eşik Bekleniyor (${formatCurrency(modalAmountToPay, currency)} / ${formatCurrency(minThreshold, currency)})`
                          : `Threshold Pending (${formatCurrency(modalAmountToPay, currency)} / ${formatCurrency(minThreshold, currency)})`}
                      </span>
                    </button>

                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
                      💡 {language === 'tr'
                        ? 'Beklemek istemezseniz "Banka Havalesi / FAST" sekmesinden şirket hesabımıza dilediğiniz tutarda doğrudan transfer yapabilirsiniz.'
                        : 'If you wish to settle earlier, switch to the "Bank Wire / FAST" tab to transfer directly without waiting.'}
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '14px',
                        padding: '1.25rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ShieldCheck size={20} style={{ color: '#10b981' }} />
                        <span style={{ color: '#f8fafc', fontWeight: 700 }}>3D Secure & Apple Pay Güvencesi</span>
                      </div>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        Visa, Mastercard, American Express, Apple Pay veya Google Pay ile anında ödeme yapabilirsiniz. Ödeme onaylandığı saniye mutabakatınız sistemde otomatik olarak kapatılır.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem' }}>
                        <Lock size={12} />
                        <span>256-bit SSL Uçtan Uca Şifreli Ödeme Altyapısı</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={startingCardPayment}
                      onClick={handleCardPayment}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1.25rem',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 18px rgba(2, 132, 199, 0.4)',
                        cursor: 'pointer',
                      }}
                    >
                      {startingCardPayment ? (
                        <>
                          <Loader2 size={18} className="spinner" />
                          <span>Ödeme Sayfası Açılıyor...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          <span>
                            Kartla Öde ve Kapat ({formatCurrency(modalAmountToPay, currency)})
                          </span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.6rem', color: '#94a3b8' }}
                >
                  {ct.cancelBtn}
                </button>
              </div>
            ) : (
              /* OPTION 2: DIRECT BANK TRANSFER / SWIFT / FAST */
              <>
                {/* Account / Currency Selector if multiple accounts exist */}
                {availableAccounts.length > 1 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      {ct.selectAccount || 'Havale Hesabı / Para Birimi'}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.4rem',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '4px',
                      }}
                    >
                      {availableAccounts.map((acc) => {
                        const isSelected = (currentAccount?.currency || 'TRY') === acc.currency;
                        const flag = acc.currency === 'TRY' ? '🇹🇷' : acc.currency === 'USD' ? '🇺🇸' : acc.currency === 'EUR' ? '🇪🇺' : '🌐';
                        return (
                          <button
                            key={acc.currency}
                            type="button"
                            onClick={() => setSelectedAccountCurrency(acc.currency)}
                            style={{
                              flex: 1,
                              padding: '7px 10px',
                              borderRadius: '8px',
                              border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 700 : 500,
                              background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                              color: isSelected ? '#38bdf8' : '#94a3b8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <span style={{ fontSize: '0.95rem' }}>{flag}</span>
                            <span>{acc.currency}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Company Bank Account Details Card */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>{ct.companyTitle}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '2px' }}>
                      <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.82rem' }}>{settlementIbanInfo.companyName}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(settlementIbanInfo.companyName, 'company')}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                      >
                        {copiedKey === 'company' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                        {copiedKey === 'company' ? ct.copied : (ct.copyCompany || 'Copy')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>{ct.bankName}</span>
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{currentAccount.bankName}</span>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>{ct.iban} ({currentAccount.currency})</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '2px' }}>
                      <code style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700 }}>
                        {currentAccount.iban}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentAccount.iban, 'iban')}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                      >
                        {copiedKey === 'iban' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                        {copiedKey === 'iban' ? ct.copied : ct.copyIban}
                      </button>
                    </div>
                  </div>

                  {currentAccount.swiftCode && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>{ct.swiftCode || 'SWIFT / BIC Kodu'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '2px' }}>
                        <code style={{ color: '#a78bfa', fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700 }}>
                          {currentAccount.swiftCode}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentAccount.swiftCode!, 'swift')}
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                        >
                          {copiedKey === 'swift' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                          {copiedKey === 'swift' ? ct.copied : (ct.copySwift || 'SWIFT Kopyala')}
                        </button>
                      </div>
                    </div>
                  )}

                  {currentAccount.fastAddress && currentAccount.currency === 'TRY' && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>{ct.fastAddress}</span>
                      <span style={{ color: '#f8fafc', fontWeight: 600 }}>{currentAccount.fastAddress}</span>
                    </div>
                  )}

                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>{ct.description}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '2px' }}>
                      <code style={{ color: '#fef08a', fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700 }}>
                        {settlementIbanInfo.paymentReference}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(settlementIbanInfo.paymentReference, 'ref')}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                      >
                        {copiedKey === 'ref' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                        {copiedKey === 'ref' ? ct.copied : ct.copyRef}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Settlement Note / Reference input */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                    {ct.settlementNoteLabel || 'Ödeme Notu / Dekont Referansı (Opsiyonel)'}
                  </label>
                  <input
                    type="text"
                    value={settlementNote}
                    onChange={(e) => setSettlementNote(e.target.value)}
                    placeholder={ct.settlementNotePlaceholder || 'Örn: Gönderen banka, dekont referans no...'}
                    className="input"
                    style={{
                      width: '100%',
                      fontSize: '0.85rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem',
                      color: '#f8fafc',
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button
                    type="button"
                    disabled={isSettling}
                    onClick={handleConfirmSettlement}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle2 size={16} />
                    {isSettling ? ct.processing : ct.markAsPaidBtn}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.6rem', color: '#94a3b8' }}
                  >
                    {ct.cancelBtn}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
