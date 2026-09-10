import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BusinessAnalytics, Business } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { DollarSign, TrendingUp, Users, UtensilsCrossed, CreditCard, BarChart2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/business'), api.get('/business/analytics')])
      .then(([bizRes, analyticsRes]) => {
        setBusiness(bizRes.data.data);
        setAnalytics(analyticsRes.data.data);
      })
      .catch((err) => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-wrapper"><div style={{ color: 'var(--text-secondary)' }}>Loading analytics...</div></div>;
  }

  const currency = business?.currency || 'USD';

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Performance & Tip Analytics</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Breakdown of tipping trends across staff, dining tables, and payment channels
        </p>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Total Volume"
          value={`${currency} ${analytics?.totalTips || 0}`}
          icon={<DollarSign size={24} />}
        />
        <MetricCard
          label="Total Tips Logged"
          value={analytics?.tipCount || 0}
          icon={<TrendingUp size={24} />}
        />
        <MetricCard
          label="Average Tip"
          value={`${currency} ${analytics?.averageTip || 0}`}
          icon={<BarChart2 size={24} />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Staff Performance */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Users size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Staff Performance</h2>
          </div>

          {analytics?.employeePerformance && analytics.employeePerformance.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Tips Received</th>
                    <th style={{ textAlign: 'right' }}>Total Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.employeePerformance.map((emp, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{emp.name}</td>
                      <td>{emp.count}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {currency} {emp.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No staff-specific tips recorded yet.
            </div>
          )}
        </div>

        {/* Table Performance */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <UtensilsCrossed size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Table & Section Performance</h2>
          </div>

          {analytics?.tablePerformance && analytics.tablePerformance.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Table / Section</th>
                    <th>Tips Count</th>
                    <th style={{ textAlign: 'right' }}>Total Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.tablePerformance.map((tbl, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{tbl.name}</td>
                      <td>{tbl.count}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {currency} {tbl.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No table-specific tips recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Payment Channel Utilization */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <CreditCard size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Payment Method Utilization</h2>
        </div>

        {analytics?.paymentMethodUsage && analytics.paymentMethodUsage.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Total Transactions</th>
                  <th style={{ textAlign: 'right' }}>Volume</th>
                </tr>
              </thead>
              <tbody>
                {analytics.paymentMethodUsage.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{m.method.replace('_', ' ')}</td>
                    <td>{m.count}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {currency} {m.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No payment channel transactions logged yet.
          </div>
        )}
      </div>
    </div>
  );
};
