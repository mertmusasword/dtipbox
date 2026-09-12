import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { EmployeeAnalytics } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { DollarSign, TrendingUp, Calendar, Layers, Sparkles, MessageSquareHeart, Star } from 'lucide-react';
import { useLanguage } from '../../i18n';

export const EmployeeDashboard: React.FC = () => {
  const { t, formatTime } = useLanguage();
  const [data, setData] = useState<{ profile: any; stats: EmployeeAnalytics; feedbacks?: any } | null>(null);
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
        <MetricCard
          label={t('feedback.customerSatisfaction')}
          value={data?.feedbacks?.metrics?.averageRating ? `⭐ ${data.feedbacks.metrics.averageRating.toFixed(1)} / 5.0` : '⭐ 5.0 / 5.0'}
          icon={<Star size={24} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
          subtitle={`${data?.feedbacks?.metrics?.totalReviews || 0} ${t('feedback.staffRatingReviews')}`}
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

      {/* Customer Reviews & Feedback for this Employee */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Star size={20} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {t('feedback.title')}
          </h2>
        </div>

        {data?.feedbacks?.items && data.feedbacks.items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.feedbacks.items.map((fb: any) => (
              <div
                key={fb.id}
                style={{
                  background: 'var(--bg-input)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderLeft: `3px solid ${fb.rating >= 4 ? '#10b981' : fb.rating === 3 ? '#f59e0b' : '#ef4444'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s: number) => (
                      <Star
                        key={s}
                        size={15}
                        style={{
                          color: s <= fb.rating ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                          fill: s <= fb.rating ? '#f59e0b' : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatTime(fb.createdAt || fb.created_at)}
                  </span>
                </div>

                {fb.comment ? (
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    "{fb.comment}"
                  </p>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No written comment (rating only).
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            {t('feedback.noReviewsYet')}
          </div>
        )}
      </div>
    </div>
  );
};
