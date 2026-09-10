import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { EmployeeAnalytics } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { DollarSign, TrendingUp, Calendar, Layers, Sparkles, MessageSquareHeart } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const [data, setData] = useState<{ profile: any; stats: EmployeeAnalytics } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/employee/dashboard')
      .then((res) => setData(res.data.data))
      .catch((err) => console.error('Failed to load employee dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-wrapper"><div style={{ color: 'var(--text-secondary)' }}>Loading staff dashboard...</div></div>;
  }

  const profile = data?.profile;
  const stats = data?.stats;
  const currency = profile?.business?.currency || 'USD';

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.first_name}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
          }}>
            {profile?.first_name ? profile.first_name[0] : 'S'}
          </div>
        )}
        <div>
          <h1 className="page-title" style={{ fontSize: '1.65rem' }}>
            Hello, {profile?.first_name} {profile?.last_name}!
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {profile?.position || 'Staff Member'} at {profile?.business?.name}
          </p>
        </div>
      </div>

      {/* Personal Tips Performance */}
      <div className="metrics-grid">
        <MetricCard
          label="Today's Tips"
          value={`${currency} ${stats?.todayTips || 0}`}
          icon={<DollarSign size={24} />}
          subtitle="Tips directed to you today"
        />
        <MetricCard
          label="Weekly Tips"
          value={`${currency} ${stats?.weeklyTips || 0}`}
          icon={<TrendingUp size={24} />}
          subtitle="Your tips over the last 7 days"
        />
        <MetricCard
          label="Monthly Tips"
          value={`${currency} ${stats?.monthlyTips || 0}`}
          icon={<Calendar size={24} />}
          subtitle="Current calendar month"
        />
        <MetricCard
          label="Total Career Tips"
          value={`${currency} ${stats?.totalTips || 0}`}
          icon={<Layers size={24} />}
          subtitle={`${stats?.tipCount || 0} total tips • avg ${currency} ${stats?.averageTip || 0}`}
        />
      </div>

      {/* Recent Tips Directed to this Employee */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Your Direct Tips & Customer Notes</h2>
        </div>

        {stats?.recentTips && stats.recentTips.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentTips.map((tip) => (
              <div
                key={tip.id}
                style={{
                  background: 'var(--bg-input)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {tip.currency} {tip.amount}
                    </span>
                    {tip.customer_name && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        from {tip.customer_name}
                      </span>
                    )}
                  </div>
                  {tip.customer_message && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem',
                    }}>
                      <MessageSquareHeart size={14} style={{ color: '#ec4899' }} />
                      "{tip.customer_message}"
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(tip.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <span className="badge badge-success" style={{ marginTop: '0.2rem' }}>
                    Received
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No personal tips logged yet. When guests select you upon tipping, your receipts will appear here!
          </div>
        )}
      </div>
    </div>
  );
};
