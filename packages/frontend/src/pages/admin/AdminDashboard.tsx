import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { MetricCard } from '../../components/MetricCard';
import { useLanguage } from '../../i18n';
import {
  Building2,
  Users,
  QrCode,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/statistics')
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error('Failed to load admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ color: 'var(--text-secondary)' }}>{t('admin.loadingStats')}</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t('admin.globalOverview')}</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {t('admin.dashboardSubtitle')}
          </p>
        </div>
        <Link to="/admin/statistics" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <TrendingUp size={16} />
          <span>{t('admin.statsPageTitle')}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label={t('admin.totalBusinesses')}
          value={stats?.totalBusinesses || 0}
          icon={<Building2 size={24} />}
          subtitle={`${stats?.activeBusinesses || 0} ${t('admin.currentlyActive')}`}
        />
        <MetricCard
          label={t('admin.registeredStaff')}
          value={stats?.totalEmployees || 0}
          icon={<Users size={24} />}
        />
        <MetricCard
          label={t('admin.generatedQrs')}
          value={stats?.totalQrs || 0}
          icon={<QrCode size={24} />}
        />
        <MetricCard
          label={t('admin.platformTipsHandled')}
          value={stats?.totalTips || 0}
          icon={<Layers size={24} />}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/businesses" className="glass-card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', transition: 'transform 0.15s ease' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{t('admin.manageBusinesses')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats?.totalBusinesses || 0} {t('admin.colBusiness')}</div>
          </div>
        </Link>

        <Link to="/admin/payments" className="glass-card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', transition: 'transform 0.15s ease' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{t('nav.payments')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats?.totalTips || 0} {t('common.success')}</div>
          </div>
        </Link>

        <Link to="/admin/corporate-applications" className="glass-card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', transition: 'transform 0.15s ease' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{t('nav.corporateApplications')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>B2B & Multi-venue</div>
          </div>
        </Link>

        <Link to="/admin/audit" className="glass-card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', transition: 'transform 0.15s ease' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{t('nav.auditLogs')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compliance Trail</div>
          </div>
        </Link>
      </div>

      {/* Global Volume by Currency */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
          {t('admin.volumeByCurrency')}
        </h2>
        {stats?.volumeByCurrency && Object.keys(stats.volumeByCurrency).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {Object.entries(stats.volumeByCurrency).map(([curr, vol]) => (
              <div
                key={curr}
                style={{
                  background: 'var(--bg-input)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {curr}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                  {(vol as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>{t('admin.noVolumeYet')}</div>
        )}
      </div>
    </div>
  );
};
