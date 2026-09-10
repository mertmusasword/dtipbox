import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BusinessAnalytics, Business } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  Users,
  UtensilsCrossed,
  QrCode,
  CreditCard,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BusinessDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/business'), api.get('/business/analytics')])
      .then(([bizRes, analyticsRes]) => {
        setBusiness(bizRes.data.data);
        setAnalytics(analyticsRes.data.data);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-wrapper"><div style={{ color: 'var(--text-secondary)' }}>Loading dashboard metrics...</div></div>;
  }

  const currency = business?.currency || 'USD';

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">{business?.name || 'Business'} Dashboard</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Real-time digital tipping performance and operations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/business/qr-codes" className="btn btn-secondary">
            <QrCode size={16} /> QR Codes
          </Link>
          <Link to="/business/employees" className="btn btn-primary">
            <Plus size={16} /> Add Employee
          </Link>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="metrics-grid">
        <MetricCard
          label="Today's Tips"
          value={`${currency} ${analytics?.todayTips || 0}`}
          icon={<DollarSign size={24} />}
          subtitle="Collected since midnight"
        />
        <MetricCard
          label="Weekly Tips"
          value={`${currency} ${analytics?.weeklyTips || 0}`}
          icon={<TrendingUp size={24} />}
          subtitle="Last 7 calendar days"
        />
        <MetricCard
          label="Monthly Tips"
          value={`${currency} ${analytics?.monthlyTips || 0}`}
          icon={<Calendar size={24} />}
          subtitle="Current calendar month"
        />
        <MetricCard
          label="Total Tips Volume"
          value={`${currency} ${analytics?.totalTips || 0}`}
          icon={<Layers size={24} />}
          subtitle={`${analytics?.tipCount || 0} total tips received`}
        />
      </div>

      {/* Operations Overview */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <MetricCard
          label="Active Staff"
          value={analytics?.employeeCount || 0}
          icon={<Users size={24} />}
        />
        <MetricCard
          label="Tables Configured"
          value={analytics?.tableCount || 0}
          icon={<UtensilsCrossed size={24} />}
        />
        <MetricCard
          label="Active QR Codes"
          value={analytics?.qrCount || 0}
          icon={<QrCode size={24} />}
        />
        <MetricCard
          label="Live Payment Channels"
          value={analytics?.activePaymentMethodsCount || 0}
          icon={<CreditCard size={24} />}
        />
      </div>

      {/* Recent Tips Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Tips Activity</h2>
          <Link to="/business/analytics" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Full Analytics →
          </Link>
        </div>

        {analytics?.recentTips && analytics.recentTips.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentTips.map((tip) => (
                  <tr key={tip.id}>
                    <td>{new Date(tip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontWeight: 700 }}>
                      {tip.currency} {tip.amount}
                    </td>
                    <td>{tip.payment_method.replace('_', ' ')}</td>
                    <td>
                      <span className="badge badge-success">Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No tips received yet. Generate a QR code to start accepting digital tips!
          </div>
        )}
      </div>
    </div>
  );
};
