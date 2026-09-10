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
  Users,
  UtensilsCrossed,
  CreditCard,
  QrCode,
  Calendar,
  Hash,
  Layers,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
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
      .catch(() => setError('Failed to load analytics data'))
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance & Tip Analytics</h1>
          <p className="page-subtitle mb-0">
            Real-time breakdown of tipping trends across staff, tables, QR codes, and payment channels
          </p>
        </div>
      </div>

      {/* Summary Metrics: Daily, Weekly, Monthly, Total, Average, Count */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : (
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          <MetricCard
            label="Daily (Today)"
            value={`${currency} ${(analytics?.todayTips || 0).toFixed(2)}`}
            icon={<Calendar size={22} />}
            subtitle="Today's received tips"
          />
          <MetricCard
            label="Weekly (7 Days)"
            value={`${currency} ${(analytics?.weeklyTips || 0).toFixed(2)}`}
            icon={<Calendar size={22} />}
            subtitle="Last 7 days"
          />
          <MetricCard
            label="Monthly (30 Days)"
            value={`${currency} ${(analytics?.monthlyTips || 0).toFixed(2)}`}
            icon={<Calendar size={22} />}
            subtitle="Last 30 days"
          />
          <MetricCard
            label="Total Volume"
            value={`${currency} ${(analytics?.totalTips || 0).toFixed(2)}`}
            icon={<DollarSign size={22} />}
            subtitle="All-time tip revenue"
          />
          <MetricCard
            label="Average Tip"
            value={`${currency} ${(analytics?.averageTip || 0).toFixed(2)}`}
            icon={<TrendingUp size={22} />}
            subtitle="Per transaction"
          />
          <MetricCard
            label="Total Count"
            value={analytics?.tipCount || 0}
            icon={<Hash size={22} />}
            subtitle="Total tips recorded"
          />
        </div>
      )}

      {/* Staff & Table Performance Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Staff Performance */}
        <div className="glass-card">
          <div className="section-header">
            <Users size={20} className="section-icon" />
            <h2 className="section-title">Staff Performance</h2>
          </div>

          {loading ? (
            <LoadingState compact message="Loading staff stats..." />
          ) : analytics?.employeePerformance && analytics.employeePerformance.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Tips</th>
                    <th className="text-right">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.employeePerformance.map((emp, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{emp.name}</td>
                      <td>{emp.count}</td>
                      <td className="text-right font-bold">{currency} {Number(emp.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Users size={24} />}
              title="No staff data"
              description="Staff tip data will appear here once tips start flowing."
            />
          )}
        </div>

        {/* Table Performance */}
        <div className="glass-card">
          <div className="section-header">
            <UtensilsCrossed size={20} className="section-icon" />
            <h2 className="section-title">Table & Section Performance</h2>
          </div>

          {loading ? (
            <LoadingState compact message="Loading table stats..." />
          ) : analytics?.tablePerformance && analytics.tablePerformance.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Table / Section</th>
                    <th>Tips</th>
                    <th className="text-right">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.tablePerformance.map((tbl, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{tbl.name}</td>
                      <td>{tbl.count}</td>
                      <td className="text-right font-bold">{currency} {Number(tbl.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<UtensilsCrossed size={24} />}
              title="No table data"
              description="Table tip data will appear here once tips are logged."
            />
          )}
        </div>
      </div>

      {/* QR Code Usage & Payment Method Usage Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* QR Usage */}
        <div className="glass-card">
          <div className="section-header">
            <QrCode size={20} className="section-icon" />
            <h2 className="section-title">QR Code Usage</h2>
          </div>

          {loading ? (
            <LoadingState compact message="Loading QR usage stats..." />
          ) : analytics?.qrUsage && analytics.qrUsage.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>QR Identifier</th>
                    <th>Linked Target</th>
                    <th>Scans/Tips</th>
                    <th className="text-right">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.qrUsage.map((qr, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">
                        <code>{qr.token.substring(0, 10)}...</code>
                      </td>
                      <td>{qr.table || qr.label || 'Venue General'}</td>
                      <td>{qr.count}</td>
                      <td className="text-right font-bold">{currency} {Number(qr.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<QrCode size={24} />}
              title="No QR activity"
              description="QR scan and tipping activity will be registered here."
            />
          )}
        </div>

        {/* Payment Method Utilization */}
        <div className="glass-card">
          <div className="section-header">
            <CreditCard size={20} className="section-icon" />
            <h2 className="section-title">Payment Method Utilization</h2>
          </div>

          {loading ? (
            <LoadingState compact message="Loading payment stats..." />
          ) : analytics?.paymentMethodUsage && analytics.paymentMethodUsage.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Transactions</th>
                    <th className="text-right">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.paymentMethodUsage.map((m, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{m.method.replace(/_/g, ' ')}</td>
                      <td>{m.count}</td>
                      <td className="text-right font-bold">{currency} {Number(m.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<CreditCard size={24} />}
              title="No payment data"
              description="Payment channel stats will populate as tips are processed."
            />
          )}
        </div>
      </div>
    </div>
  );
};
