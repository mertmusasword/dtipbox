import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ShieldCheck,
  Zap,
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
    pendingVerificationCount?: number;
    pendingCollectionCount?: number;
    settledCount?: number;
  };
  venues: VenueRevenueRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type FilterTab = 'ALL' | 'PENDING_VERIFICATION' | 'PENDING' | 'SETTLED';
export type SortOption = 'PRIORITY' | 'PENDING_DESC' | 'VOLUME_DESC' | 'NAME_ASC';

export const AdminCommissionsPage: React.FC = () => {
  const { language, formatCurrency, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const art = getAdminRevenueText(language);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminRevenueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Filter & Search Controls
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('PRIORITY');

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
      // Fetch up to 100 venues. Backend automatically prioritizes:
      // 1. Pending declarations on top
      // 2. Pending debt next
      // 3. Settled last
      const res = await api.get(`/admin/commissions?page=1&limit=100`);
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load admin revenue:', err);
      setError(err.response?.data?.error || art.loading);
    } finally {
      setLoading(false);
    }
  }, [art.loading]);

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

  // Category counts across all venues (Hooks MUST be called before any conditional return!)
  const counts = useMemo(() => {
    const all = data?.venues || [];
    const pendingVerification =
      data?.summary?.pendingVerificationCount ??
      all.filter((v) => v.hasPendingDeclaration).length;
    const pendingCollection =
      data?.summary?.pendingCollectionCount ??
      all.filter((v) => !v.hasPendingDeclaration && v.settlementStatus === 'PENDING').length;
    const settled =
      data?.summary?.settledCount ??
      all.filter((v) => !v.hasPendingDeclaration && v.settlementStatus === 'SETTLED').length;
    return {
      ALL: data?.summary?.totalVenues ?? all.length,
      PENDING_VERIFICATION: pendingVerification,
      PENDING: pendingCollection,
      SETTLED: settled,
    };
  }, [data]);

  // Processed venues: filtered by tab, filtered by search, sorted by option
  const processedVenues = useMemo(() => {
    if (!data?.venues) return [];
    let list = [...data.venues];

    // 1. Filter by Tab
    if (filterTab === 'PENDING_VERIFICATION') {
      list = list.filter((v) => v.hasPendingDeclaration);
    } else if (filterTab === 'PENDING') {
      list = list.filter((v) => v.settlementStatus === 'PENDING');
    } else if (filterTab === 'SETTLED') {
      list = list.filter((v) => v.settlementStatus === 'SETTLED');
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.ownerEmail && v.ownerEmail.toLowerCase().includes(q)) ||
          (v.country && v.country.toLowerCase().includes(q))
      );
    }

    // 3. Sorting
    if (sortBy === 'PRIORITY') {
      // 1. Pending verification declarations at VERY TOP
      // 2. Pending debt next (highest pending debt first)
      // 3. Settled clean venues last (newest first)
      list.sort((a, b) => {
        if (a.hasPendingDeclaration && !b.hasPendingDeclaration) return -1;
        if (!a.hasPendingDeclaration && b.hasPendingDeclaration) return 1;

        const aIsPending = a.settlementStatus === 'PENDING';
        const bIsPending = b.settlementStatus === 'PENDING';
        if (aIsPending && !bIsPending) return -1;
        if (!aIsPending && bIsPending) return 1;

        if (aIsPending && bIsPending) {
          return b.bankCommissionPending - a.bankCommissionPending;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sortBy === 'PENDING_DESC') {
      list.sort((a, b) => b.bankCommissionPending - a.bankCommissionPending);
    } else if (sortBy === 'VOLUME_DESC') {
      list.sort((a, b) => b.totalVolume - a.totalVolume);
    } else if (sortBy === 'NAME_ASC') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [data?.venues, filterTab, searchQuery, sortBy]);

  const FILTER_TABS = [
    {
      key: 'ALL' as FilterTab,
      label: language === 'tr' ? 'Tümü' : 'All',
      count: counts.ALL,
      color: '#94a3b8',
    },
    {
      key: 'PENDING_VERIFICATION' as FilterTab,
      label: language === 'tr' ? '⚡ Onay Bekleyenler' : '⚡ Pending Approval',
      count: counts.PENDING_VERIFICATION,
      color: '#f59e0b',
      isUrgent: counts.PENDING_VERIFICATION > 0,
    },
    {
      key: 'PENDING' as FilterTab,
      label: language === 'tr' ? '⏳ Tahsilat Bekleyenler' : '⏳ Pending Collection',
      count: counts.PENDING,
      color: '#f87171',
    },
    {
      key: 'SETTLED' as FilterTab,
      label: language === 'tr' ? '✅ Mutabık / Kapalı' : '✅ Settled',
      count: counts.SETTLED,
      color: '#34d399',
    },
  ];

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

      {/* 2.5 Urgent Pending Verification Alert Banner (Action Required) */}
      {counts.PENDING_VERIFICATION > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.08) 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.25)',
                border: '1px solid rgba(245, 158, 11, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                flexShrink: 0,
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <div style={{ color: '#fef08a', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{counts.PENDING_VERIFICATION} {language === 'tr' ? 'İşletme Havale Bildirimi Yaptı (Onay Bekliyor)' : 'Venues Awaiting Wire Confirmation'}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: '#f59e0b',
                    color: '#0f172a',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {language === 'tr' ? 'ÖNCELİKLİ EYLEM' : 'ACTION REQUIRED'}
                </span>
              </div>
              <div style={{ color: 'rgba(254, 240, 138, 0.85)', fontSize: '0.84rem', marginTop: '3px' }}>
                {language === 'tr'
                  ? 'İşletmeler %3.5 komisyon borcunu banka havalesiyle ödediklerini bildirdi. Kurumsal hesaba gelen tutarı kontrol edip mutabakatı anında onaylayabilirsiniz.'
                  : 'Venues have declared wire transfers for accrued platform fees. Verify received bank funds and clear their balance.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFilterTab('PENDING_VERIFICATION');
              setSearchQuery('');
            }}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: '1px solid #fbbf24',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '0.6rem 1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            <span>{language === 'tr' ? `Onay Bekleyenleri İncele (${counts.PENDING_VERIFICATION})` : `Review Pending (${counts.PENDING_VERIFICATION})`}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 3. Venue Directory Table Card */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        {/* Title & Subtitle */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {art.tableTitle}
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {art.tableSubtitle}
          </p>
        </div>

        {/* 3.1 Filter Tabs Bar & Search / Sort Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {FILTER_TABS.map((tab) => {
              const isActive = filterTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterTab(tab.key)}
                  style={{
                    padding: '0.5rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: isActive
                      ? `1.5px solid ${tab.color}`
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isActive
                      ? `linear-gradient(135deg, ${tab.color}25 0%, ${tab.color}10 100%)`
                      : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    boxShadow: isActive ? `0 4px 15px ${tab.color}20` : 'none',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: isActive ? tab.color : 'rgba(255, 255, 255, 0.1)',
                      color: isActive ? (tab.key === 'PENDING_VERIFICATION' ? '#0f172a' : '#fff') : 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '1px 7px',
                      borderRadius: '12px',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'tr' ? 'İşletme adı veya e-posta...' : 'Search venue or email...'}
                style={{
                  width: '100%',
                  padding: '0.5rem 2rem 0.5rem 2.1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.8rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="PRIORITY" style={{ background: '#1e293b', color: '#fff' }}>
                  {language === 'tr' ? '🎯 Öncelik Sıralaması' : '🎯 Priority Order'}
                </option>
                <option value="PENDING_DESC" style={{ background: '#1e293b', color: '#fff' }}>
                  {language === 'tr' ? '💰 Bekleyen Borç (Azalan)' : '💰 Pending Debt (High to Low)'}
                </option>
                <option value="VOLUME_DESC" style={{ background: '#1e293b', color: '#fff' }}>
                  {language === 'tr' ? '📊 Toplam Hacim (Azalan)' : '📊 Total Volume (High to Low)'}
                </option>
                <option value="NAME_ASC" style={{ background: '#1e293b', color: '#fff' }}>
                  {language === 'tr' ? '🔤 İsim (A-Z)' : '🔤 Name (A-Z)'}
                </option>
              </select>
            </div>

            {/* Clear Filter Button */}
            {(filterTab !== 'ALL' || searchQuery.trim() || sortBy !== 'PRIORITY') && (
              <button
                type="button"
                onClick={() => {
                  setFilterTab('ALL');
                  setSearchQuery('');
                  setSortBy('PRIORITY');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  padding: '0.45rem 0.7rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={12} />
                <span>{language === 'tr' ? 'Sıfırla' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3.2 Table or Empty State */}
        {processedVenues.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            {filterTab === 'PENDING_VERIFICATION' ? (
              <div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {language === 'tr' ? 'Onay Bekleyen Havale Bildirimi Yok' : 'No Pending Wire Declarations'}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '440px', margin: '0 auto 1.25rem' }}>
                  {language === 'tr'
                    ? 'İşletmelerden bekleyen herhangi bir havale ödeme bildirimi bulunmuyor. Tüm mutabakatlar güncel.'
                    : 'All submitted wire declarations have been verified and settled.'}
                </p>
                <button
                  type="button"
                  onClick={() => setFilterTab('ALL')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  {language === 'tr' ? 'Tüm İşletmeleri Görüntüle' : 'View All Venues'}
                </button>
              </div>
            ) : filterTab === 'PENDING' ? (
              <div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <ShieldCheck size={28} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {language === 'tr' ? 'Tahsilat Bekleyen Borç Bulunmuyor' : 'No Pending Collections'}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '440px', margin: '0 auto 1.25rem' }}>
                  {language === 'tr'
                    ? 'Tüm kayıtlı işletmelerin havale komisyon bakiyeleri kapalı ve mutabık durumdadır.'
                    : 'All venues are fully settled with zero outstanding wire commission balances.'}
                </p>
                <button
                  type="button"
                  onClick={() => setFilterTab('ALL')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  {language === 'tr' ? 'Tüm İşletmeleri Görüntüle' : 'View All Venues'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Search size={24} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {language === 'tr' ? 'Eşleşen İşletme Bulunamadı' : 'No Matching Venues Found'}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
                  {searchQuery
                    ? language === 'tr'
                      ? `"${searchQuery}" aramasıyla eşleşen herhangi bir işletme bulunamadı.`
                      : `No venues matched "${searchQuery}".`
                    : language === 'tr'
                    ? 'Bu filtreye uygun işletme kaydı bulunamadı.'
                    : 'No venues found for this filter.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('ALL');
                    setSearchQuery('');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  {language === 'tr' ? 'Filtreleri Temizle' : 'Clear Filters'}
                </button>
              </div>
            )}
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
                {processedVenues.map((v) => {
                  const isPending = v.settlementStatus === 'PENDING';
                  const isAwaitingVerification = Boolean(v.hasPendingDeclaration);

                  return (
                    <tr
                      key={v.id}
                      style={{
                        background: isAwaitingVerification
                          ? 'rgba(245, 158, 11, 0.08)'
                          : isPending
                          ? 'rgba(239, 68, 68, 0.03)'
                          : 'transparent',
                        borderLeft: isAwaitingVerification
                          ? '4px solid #f59e0b'
                          : isPending
                          ? '4px solid #ef4444'
                          : '4px solid transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.name}</span>
                          {isAwaitingVerification && (
                            <span
                              style={{
                                fontSize: '0.65rem',
                                background: '#f59e0b',
                                color: '#0f172a',
                                fontWeight: 900,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              ONAY BEKLİYOR
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {v.ownerEmail || v.country}
                        </div>
                        {isAwaitingVerification && v.pendingDeclaration?.note && (
                          <div style={{ fontSize: '0.72rem', color: '#fef08a', marginTop: '3px', fontStyle: 'italic' }}>
                            💬 "{v.pendingDeclaration.note}"
                          </div>
                        )}
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
                        {isAwaitingVerification ? (
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(245, 158, 11, 0.22)',
                              color: '#fde047',
                              border: '1.5px solid rgba(245, 158, 11, 0.55)',
                              boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
                              fontWeight: 800,
                            }}
                          >
                            <Clock size={12} style={{ marginRight: '4px' }} />
                            {language === 'tr' ? 'Havale Bildirildi ⚡' : 'Transfer Reported ⚡'}
                          </span>
                        ) : isPending ? (
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                            }}
                          >
                            <AlertTriangle size={11} style={{ marginRight: '4px' }} /> {art.statusPending}
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle2 size={11} style={{ marginRight: '4px' }} /> {art.statusSettled}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isAwaitingVerification ? (
                          <button
                            type="button"
                            onClick={() => handleOpenConfirm(v)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              border: '1px solid #fbbf24',
                              color: '#0f172a',
                              fontWeight: 800,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                              transition: 'transform 0.15s ease',
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
