import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { BusinessAnalytics, Business } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { LoadingState, SkeletonCard } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
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
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BusinessDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.get('/business'), api.get('/business/analytics')])
      .then(([bizRes, analyticsRes]) => {
        setBusiness(bizRes.data.data);
        setAnalytics(analyticsRes.data.data);
      })
      .catch(() => setError('Failed to load dashboard data. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="page-wrapper">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const currency = business?.currency || 'USD';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {loading ? 'Dashboard' : `${business?.name || 'Business'}`}
          </h1>
          <p className="page-subtitle mb-0">
            Real-time digital tipping performance and operations overview
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/business/qr" className="btn btn-secondary">
            <QrCode size={16} /> QR Codes
          </Link>
          <Link to="/business/employees" className="btn btn-primary">
            <Plus size={16} /> Add Employee
          </Link>
        </div>
      </div>

      {/* Financial Metrics */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="metrics-grid">
          <MetricCard
            label="Today's Tips"
            value={`${currency} ${analytics?.todayTips?.toFixed(2) || '0.00'}`}
            icon={<DollarSign size={24} />}
            subtitle="Collected since midnight"
          />
          <MetricCard
            label="Weekly Tips"
            value={`${currency} ${analytics?.weeklyTips?.toFixed(2) || '0.00'}`}
            icon={<TrendingUp size={24} />}
            subtitle="Last 7 calendar days"
          />
          <MetricCard
            label="Monthly Tips"
            value={`${currency} ${analytics?.monthlyTips?.toFixed(2) || '0.00'}`}
            icon={<Calendar size={24} />}
            subtitle="Current calendar month"
          />
          <MetricCard
            label="All-Time Volume"
            value={`${currency} ${analytics?.totalTips?.toFixed(2) || '0.00'}`}
            icon={<Layers size={24} />}
            subtitle={`${analytics?.tipCount || 0} total tips received`}
          />
        </div>
      )}

      {/* Operations Metrics */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="metrics-grid">
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
            label="Payment Channels"
            value={analytics?.activePaymentMethodsCount || 0}
            icon={<CreditCard size={24} />}
          />
        </div>
      )}

      {/* Recent Tips Table */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div className="section-header mb-0">
            <Sparkles size={20} className="section-icon" />
            <h2 className="section-title">Recent Tips Activity</h2>
          </div>
          <Link
            to="/business/analytics"
            style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            Full Analytics <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingState compact message="Loading recent tips..." />
        ) : analytics?.recentTips && analytics.recentTips.length > 0 ? (
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
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(tip.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {tip.currency} {Number(tip.amount).toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {tip.payment_method.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<DollarSign size={28} />}
            title="No tips received yet"
            description="Generate a QR code and share it with your customers to start accepting digital tips."
            action={
              <Link to="/business/qr" className="btn btn-primary">
                <QrCode size={16} /> Generate Your First QR
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
};
