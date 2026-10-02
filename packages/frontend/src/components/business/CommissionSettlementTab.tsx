import React, { useEffect, useState, useCallback } from 'react';
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
              ? 'rgba(239, 68, 68, 0.07)'
              : 'rgba(16, 185, 129, 0.07)',
            border: summary.hasPendingDeclaration
              ? '1.5px solid rgba(245, 158, 11, 0.45)'
              : summary.bankPlatformFeePending > 0
              ? '1.5px solid rgba(239, 68, 68, 0.35)'
              : '1.5px solid rgba(16, 185, 129, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: summary.hasPendingDeclaration ? '#fde047' : summary.bankPlatformFeePending > 0 ? '#fca5a5' : '#86efac',
                fontWeight: 700,
              }}
            >
              {ct.bankCommissionPending}
            </span>
            <Clock
              size={18}
              style={{
                color: summary.hasPendingDeclaration ? '#f59e0b' : summary.bankPlatformFeePending > 0 ? '#f87171' : '#34d399',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: summary.hasPendingDeclaration ? '#fde047' : summary.bankPlatformFeePending > 0 ? '#f87171' : '#34d399',
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(summary.bankPlatformFeePending, currency)}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            {summary.hasPendingDeclaration ? (
              <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={13} /> {ct.btnReportedPending || 'İncelemede / Onay Bekleniyor ⏳'}
              </span>
            ) : summary.bankPlatformFeePending > 0 ? (
              <button
                type="button"
                onClick={() => handleOpenSettlement()}
                className="btn btn-primary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ef4444',
                  borderColor: '#dc2626',
                }}
              >
                <Receipt size={13} /> {ct.btnPaySettle}
              </button>
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
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          >
                            {ct.btnPaySettle}
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
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '14px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.88rem', color: '#fca5a5', fontWeight: 600 }}>
                {ct.amountToPay}:
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>
                {formatCurrency(
                  selectedPeriod ? selectedPeriod.bankCommissionPending : summary.bankPlatformFeePending,
                  currency
                )}
              </span>
            </div>

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
                onClick={() => {
                  showToast(language === 'tr' ? 'Kartla ödeme simülasyonu: Ödeme başarıyla alındı ve bakiye kapatıldı!' : 'Card payment successful: settlement closed!');
                  handleConfirmSettlement();
                }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8' }}
              >
                <CreditCard size={16} />
                {ct.payOnlineBtn}
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
          </div>
        </div>
      )}
    </div>
  );
};
