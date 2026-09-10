import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { MetricCard } from '../../components/MetricCard';
import { Building2, Users, QrCode, Layers, ShieldCheck, DollarSign } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
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
    return <div className="page-wrapper"><div style={{ color: 'var(--text-secondary)' }}>Loading platform statistics...</div></div>;
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Global Platform Overview</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          D-TIPBOX SaaS administration, tenant health, and aggregate volumes
        </p>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Total Businesses"
          value={stats?.totalBusinesses || 0}
          icon={<Building2 size={24} />}
          subtitle={`${stats?.activeBusinesses || 0} currently active`}
        />
        <MetricCard
          label="Registered Staff"
          value={stats?.totalEmployees || 0}
          icon={<Users size={24} />}
        />
        <MetricCard
          label="Generated QR Codes"
          value={stats?.totalQrs || 0}
          icon={<QrCode size={24} />}
        />
        <MetricCard
          label="Platform Tips Handled"
          value={stats?.totalTips || 0}
          icon={<Layers size={24} />}
        />
      </div>

      {/* Global Volume by Currency */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
          Aggregate Volume by Settlement Currency
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
          <div style={{ color: 'var(--text-muted)' }}>No settlement volume recorded yet.</div>
        )}
      </div>
    </div>
  );
};
