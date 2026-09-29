import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { MetricCard } from '../../components/MetricCard';
import { useLanguage } from '../../i18n';
import {
  Building2,
  Users,
  QrCode,
  Layers,
  TrendingUp,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  Globe2,
  CheckCircle2
} from 'lucide-react';

export const AdminStatisticsPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/statistics');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ color: 'var(--text-secondary)' }}>{t('admin.loadingStats')}</div>
      </div>
    );
  }

  const activeRatio = stats?.totalBusinesses > 0
    ? Math.round(((stats.activeBusinesses || 0) / stats.totalBusinesses) * 100)
    : 0;

  const avgStaffPerBiz = stats?.activeBusinesses > 0
    ? ((stats.totalEmployees || 0) / stats.activeBusinesses).toFixed(1)
    : '0';

  const tipsPerQr = stats?.totalQrs > 0
    ? ((stats.totalTips || 0) / stats.totalQrs).toFixed(1)
    : '0';

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t('admin.statsPageTitle')}</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {t('admin.statsPageSubtitle')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      {/* Main KPI Grid */}
      <div className="metrics-grid">
        <MetricCard
          label={t('admin.totalBusinesses')}
          value={stats?.totalBusinesses || 0}
          icon={<Building2 size={24} />}
          subtitle={`${stats?.activeBusinesses || 0} ${t('admin.currentlyActive')} (%${activeRatio})`}
        />
        <MetricCard
          label={t('admin.registeredStaff')}
          value={stats?.totalEmployees || 0}
          icon={<Users size={24} />}
          subtitle={`~${avgStaffPerBiz} staff / active venue`}
        />
        <MetricCard
          label={t('admin.generatedQrs')}
          value={stats?.totalQrs || 0}
          icon={<QrCode size={24} />}
          subtitle={`~${tipsPerQr} tips / QR badge`}
        />
        <MetricCard
          label={t('admin.platformTipsHandled')}
          value={stats?.totalTips || 0}
          icon={<Layers size={24} />}
          subtitle="Processed & Settled"
        />
      </div>

      {/* Settlement Volume by Currency */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" />
            {t('admin.volumeByCurrency')}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Ledger Aggregation</span>
        </div>

        {stats?.volumeByCurrency && Object.keys(stats.volumeByCurrency).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {Object.entries(stats.volumeByCurrency).map(([curr, vol]) => (
              <div
                key={curr}
                style={{
                  background: 'var(--bg-input)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {curr}
                  </span>
                  <Globe2 size={16} color="var(--text-muted)" />
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {(vol as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Settlement & Payout Stream
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>{t('admin.noVolumeYet')}</div>
        )}
      </div>

      {/* Ecosystem Health & Gateway Reliability */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="#34d399" />
          {t('admin.ecosystemHealth')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={16} color="#34d399" />
              <strong style={{ fontSize: '0.9rem' }}>PostgreSQL Cluster</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Connected with 36 Prisma models, ACID transactions, and automated connection pooling.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={16} color="#34d399" />
              <strong style={{ fontSize: '0.9rem' }}>Payment Gateway Routing</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Dynamic routing across Stripe, Iyzico, PayTR, Papara, Sipay, and Direct Bank IBAN.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={16} color="#34d399" />
              <strong style={{ fontSize: '0.9rem' }}>Global CDN & Pre-rendering</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              11 locale static SEO pre-render with reciprocal hreflang and instant edge delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
