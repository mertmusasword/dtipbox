import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { useLanguage } from '../../i18n';
import { getAdminRevenueText } from '../../i18n/adminRevenueLocales';
import { useToast } from '../../components/Toast';
import {
  Coins,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  RefreshCw,
  AlertTriangle,
  Receipt,
  X,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface VenueRevenueRow {
  id: string;
  name: string;
  country: string;
  currency: string;
  isFounderMember: boolean;
  membershipPlan: string;
  membershipStatus: string;
  isActive: boolean;
  createdAt: string;
  ownerEmail?: string;
  totalVolume: number;
  cardVolume: number;
  bankVolume: number;
  tipCount: number;
  totalCommission: number;
  cardCommission: number;
  bankCommissionPending: number;
  bankCommissionSettled: number;
  settlementStatus: 'PENDING' | 'PENDING_VERIFICATION' | 'SETTLED';
  hasPendingDeclaration?: boolean;
  pendingDeclaration?: {
    declaredAt: string;
    note?: string;
    declaredAmount?: number;
    periodKey?: string;
  } | null;
}

interface AdminRevenueData {
  summary: {
    totalVolume: number;
    cardVolume: number;
    bankVolume: number;
    cashVolume: number;
    totalPlatformRevenue: number;
    cardRevenueCollected: number;
    bankRevenueTotal: number;
    bankRevenueSettled: number;
    bankRevenuePending: number;
    totalVenues: number;
    founderVenuesCount: number;
    founderRatio: number;
  };
  venues: VenueRevenueRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const AdminCommissionsPage: React.FC = () => {
  const { language, formatCurrency, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const art = getAdminRevenueText(language);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminRevenueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Settlement Confirmation Modal
  const [selectedVenue, setSelectedVenue] = useState<VenueRevenueRow | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown to Dec 31, 2026
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const target = new Date('2026-12-31T23:59:59').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/commissions?page=${page}&limit=30`);
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load admin revenue:', err);
      setError(err.response?.data?.error || art.loading);
    } finally {
      setLoading(false);
    }
  }, [page, art.loading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenConfirm = (venue: VenueRevenueRow) => {
    setSelectedVenue(venue);
    setConfirmModalOpen(true);
  };

  const handleConfirmSettlement = async () => {
    if (!selectedVenue) return;
    try {
      setIsSubmitting(true);
      await api.post(`/admin/commissions/${selectedVenue.id}/settle`);
      showToast(art.confirmSuccess);
      setConfirmModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || art.confirmError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSettlement = async () => {
    if (!selectedVenue) return;
    try {
      setIsSubmitting(true);
      await api.post(`/admin/commissions/${selectedVenue.id}/reject`, {
        reason: 'Banka hesabında eşleşen havale transferi tespit edilemedi.',
      });
      showToast(language === 'tr' ? 'Havale bildirimi reddedildi.' : 'Settlement declaration rejected.', 'info');
      setConfirmModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || art.confirmError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="page-wrapper" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--text-secondary)' }}>{art.loading}</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-wrapper">
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error || 'Error'}</p>
          <button onClick={loadData} className="btn btn-secondary">
            <RefreshCw size={16} /> {art.refreshBtn}
          </button>
        </div>
      </div>
    );
  }

  const { summary, venues } = data;

  return (
    <div className="page-wrapper" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* 1. Header with Countdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 className="page-title">{art.pageTitle}</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {art.pageSubtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* 2026 Countdown pill */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <Crown size={18} style={{ color: '#f59e0b' }} />
            <div style={{ fontSize: '0.8rem', color: '#fef08a' }}>
              <span style={{ fontWeight: 800 }}>2026 Kurucu Programı: </span>
              <span>{timeLeft.days}g {timeLeft.hours}s {timeLeft.minutes}d kaldı</span>
            </div>
          </div>

          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem' }}
          >
            <RefreshCw size={15} />
            <span>{art.refreshBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {/* Total Tips Processed */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{art.totalTipsVolume}</span>
            <Coins size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(summary.totalVolume, 'TRY')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Kart: {formatCurrency(summary.cardVolume, 'TRY')} | Havale: {formatCurrency(summary.bankVolume, 'TRY')}
          </div>
        </div>

        {/* Total Platform 3.5% Revenue */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1.5px solid rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#6ee7b7', fontWeight: 700 }}>{art.platformRevenue}</span>
            <TrendingUp size={18} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10b981' }}>
            {formatCurrency(summary.totalPlatformRevenue, 'TRY')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Net %3.50 Naponi Platform Hasılatı
          </div>
        </div>

        {/* Outstanding Wire Transfer Receivables */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            background: summary.bankRevenuePending > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.05)',
            border: summary.bankRevenuePending > 0 ? '1.5px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: summary.bankRevenuePending > 0 ? '#fca5a5' : '#86efac', fontWeight: 700 }}>
              {art.wireRevenuePending}
            </span>
            <Clock size={18} style={{ color: summary.bankRevenuePending > 0 ? '#f87171' : '#34d399' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: summary.bankRevenuePending > 0 ? '#f87171' : '#34d399' }}>
            {formatCurrency(summary.bankRevenuePending, 'TRY')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Tahsil Edilen: {formatCurrency(summary.bankRevenueSettled, 'TRY')}
          </div>
        </div>

        {/* 2026 Founder Venues Count & Share */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1.5px solid rgba(245, 158, 11, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#fef08a', fontWeight: 700 }}>{art.founderVenues}</span>
            <Crown size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fef08a' }}>
            {summary.founderVenuesCount} / {summary.totalVenues}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Percent size={12} /> {summary.founderRatio}% {art.founderRatioBadge}
          </div>
        </div>
      </div>

      {/* 3. Venue Directory Table */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {art.tableTitle}
          </h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {art.tableSubtitle}
          </p>
        </div>

        {venues.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Kayıtlı işletme bulunamadı.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>{art.colVenue}</th>
                  <th>{art.colPlan}</th>
                  <th>{art.colTotalVolume}</th>
                  <th>{art.colWireVolume}</th>
                  <th>{art.colCommission}</th>
                  <th>{art.colPendingFee}</th>
                  <th>{art.colStatus}</th>
                  <th style={{ textAlign: 'right' }}>{art.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => {
                  const isPending = v.settlementStatus === 'PENDING';

                  return (
                    <tr key={v.id} style={{ background: isPending ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.ownerEmail || v.country}</div>
                      </td>
                      <td>
                        {v.isFounderMember ? (
                          <span
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              color: '#fbbf24',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '20px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Crown size={12} /> {art.founderBadge}
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                            {art.standardBadge}
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatCurrency(v.totalVolume, v.currency)}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          {v.tipCount} işlem
                        </span>
                      </td>
                      <td style={{ color: '#f59e0b', fontWeight: 600 }}>
                        {formatCurrency(v.bankVolume, v.currency)}
                      </td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>
                        {formatCurrency(v.totalCommission, v.currency)}
                      </td>
                      <td>
                        {v.bankCommissionPending > 0 ? (
                          <span style={{ color: '#f87171', fontWeight: 800 }}>
                            {formatCurrency(v.bankCommissionPending, v.currency)}
                          </span>
                        ) : (
                          <span style={{ color: '#10b981', fontSize: '0.85rem' }}>
                            0.00 {v.currency}
                          </span>
                        )}
                      </td>
                      <td>
                        {v.hasPendingDeclaration ? (
                          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde047', border: '1px solid rgba(245, 158, 11, 0.5)' }}>
                            <Clock size={11} style={{ marginRight: '4px' }} /> {language === 'tr' ? 'Havale Bildirildi ⚡' : 'Transfer Reported ⚡'}
                          </span>
                        ) : isPending ? (
                          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <AlertTriangle size={11} style={{ marginRight: '4px' }} /> {art.statusPending}
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle2 size={11} style={{ marginRight: '4px' }} /> {art.statusSettled}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {v.hasPendingDeclaration ? (
                          <button
                            type="button"
                            onClick={() => handleOpenConfirm(v)}
                            className="btn btn-primary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.78rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f59e0b',
                              borderColor: '#d97706',
                              color: '#0f172a',
                              fontWeight: 700,
                            }}
                          >
                            <Clock size={13} /> {language === 'tr' ? 'Ödemeyi Doğrula & Onayla' : 'Verify & Settle'}
                          </button>
                        ) : v.bankCommissionPending > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenConfirm(v)}
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Receipt size={13} /> {art.btnConfirmSettlement}
                          </button>
                        ) : (
                          <span style={{ color: '#10b981', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={13} /> {art.btnSettled}
                          </span>
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

      {/* 4. Manual Settlement Confirmation Modal */}
      {confirmModalOpen && selectedVenue && (
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
              maxWidth: '480px',
              width: '100%',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setConfirmModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {art.confirmModalTitle}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedVenue.name}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {art.confirmModalDesc}
            </p>

            {selectedVenue.hasPendingDeclaration && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fde047', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                  <Clock size={16} />
                  <span>İşletme Tarafından Havale Gönderildi Bildirimi Yapıldı</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <strong>Bildirim Tarihi:</strong> {new Date(selectedVenue.pendingDeclaration?.declaredAt || '').toLocaleString()}
                </div>
                {selectedVenue.pendingDeclaration?.note && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.84rem', color: '#fef08a' }}>
                    <strong>İşletme Notu:</strong> {selectedVenue.pendingDeclaration.note}
                  </div>
                )}
                <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                  ⚠️ Lütfen kurumsal banka hesabınıza (QNB Finansbank / Garanti BBVA) tutarın ulaşıp ulaşmadığını kontrol ettikten sonra onaylayınız.
                </div>
              </div>
            )}

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#6ee7b7' }}>Tahsil Edilecek Bedel:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>
                {formatCurrency(selectedVenue.bankCommissionPending, selectedVenue.currency)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSettlement}
                className="btn btn-primary"
                style={{ flex: 1, minWidth: '180px', padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#10b981', borderColor: '#059669' }}
              >
                <CheckCircle2 size={16} />
                {isSubmitting ? 'İşleniyor...' : 'Bankaya Geldi, Onayla'}
              </button>
              {selectedVenue.hasPendingDeclaration && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRejectSettlement}
                  className="btn btn-secondary"
                  style={{ padding: '0.7rem 1rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                >
                  Ödeme Gelmedi (Reddet)
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '0.7rem 1rem' }}
              >
                {art.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
