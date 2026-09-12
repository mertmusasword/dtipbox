import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { BusinessAnalytics, Business } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { LoadingState, SkeletonCard } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useLanguage } from '../../i18n';
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
  const { t, formatCurrency, formatNumber } = useLanguage();
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
          <h1 className="page-title">{t('business.analyticsTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('business.analyticsSubtitle')}
          </p>
        </div>
      </div>

      {/* Summary Metrics: Daily, Weekly, Monthly, Total, Average, Count */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : (
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <MetricCard
            label={t('business.todayTips')}
            value={formatCurrency(analytics?.todayTips || 0, currency)}
            icon={<Calendar size={22} />}
            subtitle={t('business.todayTips')}
          />
          <MetricCard
            label={t('business.weeklyTips')}
            value={formatCurrency(analytics?.weeklyTips || 0, currency)}
            icon={<Calendar size={22} />}
            subtitle={t('business.weeklyTips')}
          />
          <MetricCard
            label={t('business.monthlyTips')}
            value={formatCurrency(analytics?.monthlyTips || 0, currency)}
            icon={<Calendar size={22} />}
            subtitle={t('business.monthlyTips')}
          />
          <MetricCard
            label={t('business.totalTips')}
            value={formatCurrency(analytics?.totalTips || 0, currency)}
            icon={<DollarSign size={22} />}
            subtitle={t('business.totalTips')}
          />
          <MetricCard
            label={t('business.avgTip')}
            value={formatCurrency(analytics?.averageTip || 0, currency)}
            icon={<TrendingUp size={22} />}
            subtitle={t('business.avgTip')}
          />
          <MetricCard
            label={t('business.tipCount')}
            value={formatNumber(analytics?.tipCount || 0)}
            icon={<Hash size={22} />}
            subtitle={t('business.tipCount')}
          />
        </div>
      )}

      {/* Staff & Table Performance Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Staff Performance */}
        <div className="glass-card">
          <div className="section-header">
            <Users size={20} className="section-icon" />
            <h2 className="section-title">{t('business.employeePerformance')}</h2>
          </div>

          {loading ? (
            <LoadingState compact message={t('common.loading')} />
          ) : analytics?.employeePerformance && analytics.employeePerformance.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('common.name')}</th>
                    <th>{t('business.tipCount')}</th>
                    <th className="text-right">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.employeePerformance.map((emp, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{emp.name}</td>
                      <td>{formatNumber(emp.count)}</td>
                      <td className="text-right font-bold">{formatCurrency(Number(emp.total), currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Users size={24} />}
              title={t('business.employeePerformance')}
              description={t('business.noTipsYet')}
            />
          )}
        </div>

        {/* Table Performance */}
        <div className="glass-card">
          <div className="section-header">
            <UtensilsCrossed size={20} className="section-icon" />
            <h2 className="section-title">{t('business.tablePerformance')}</h2>
          </div>

          {loading ? (
            <LoadingState compact message={t('common.loading')} />
          ) : analytics?.tablePerformance && analytics.tablePerformance.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('business.tableName')}</th>
                    <th>{t('business.tipCount')}</th>
                    <th className="text-right">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.tablePerformance.map((tbl, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{tbl.name}</td>
                      <td>{formatNumber(tbl.count)}</td>
                      <td className="text-right font-bold">{formatCurrency(Number(tbl.total), currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<UtensilsCrossed size={24} />}
              title={t('business.tablePerformance')}
              description={t('business.noTipsYet')}
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
            <h2 className="section-title">{t('business.qrTitle')}</h2>
          </div>

          {loading ? (
            <LoadingState compact message={t('common.loading')} />
          ) : analytics?.qrUsage && analytics.qrUsage.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('common.details')}</th>
                    <th>{t('business.tableName')}</th>
                    <th>{t('business.tipCount')}</th>
                    <th className="text-right">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.qrUsage.map((qr, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">
                        <code>{qr.token.substring(0, 10)}...</code>
                      </td>
                      <td>{qr.table || qr.label || t('business.qrTypeGeneral')}</td>
                      <td>{formatNumber(qr.count)}</td>
                      <td className="text-right font-bold">{formatCurrency(Number(qr.total), currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<QrCode size={24} />}
              title={t('business.qrTitle')}
              description={t('business.noTipsYet')}
            />
          )}
        </div>

        {/* Payment Method Utilization */}
        <div className="glass-card">
          <div className="section-header">
            <CreditCard size={20} className="section-icon" />
            <h2 className="section-title">{t('business.paymentMethodUsage')}</h2>
          </div>

          {loading ? (
            <LoadingState compact message={t('common.loading')} />
          ) : analytics?.paymentMethodUsage && analytics.paymentMethodUsage.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('common.details')}</th>
                    <th>{t('business.tipCount')}</th>
                    <th className="text-right">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.paymentMethodUsage.map((m, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{m.method.replace(/_/g, ' ')}</td>
                      <td>{formatNumber(m.count)}</td>
                      <td className="text-right font-bold">{formatCurrency(Number(m.total), currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<CreditCard size={24} />}
              title={t('business.paymentMethodUsage')}
              description={t('business.noTipsYet')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
