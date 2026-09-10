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
import { useLanguage } from '../../i18n';

export const BusinessDashboard: React.FC = () => {
  const { t, formatCurrency, formatTime } = useLanguage();
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
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

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
            {loading ? t('business.dashboardTitle') : `${business?.name || t('business.dashboardTitle')}`}
          </h1>
          <p className="page-subtitle mb-0">
            {t('business.dashboardSubtitle')}
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/business/qr" className="btn btn-secondary">
            <QrCode size={16} /> {t('nav.qrCodes')}
          </Link>
          <Link to="/business/employees" className="btn btn-primary">
            <Plus size={16} /> {t('business.addStaffBtn')}
          </Link>
        </div>
      </div>

      {/* Financial Metrics */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="metrics-grid">
          <MetricCard
            label={t('business.todayTips')}
            value={formatCurrency(analytics?.todayTips || 0, currency)}
            icon={<DollarSign size={24} />}
            subtitle="Today"
          />
          <MetricCard
            label={t('business.weeklyTips')}
            value={formatCurrency(analytics?.weeklyTips || 0, currency)}
            icon={<TrendingUp size={24} />}
            subtitle="Last 7 days"
          />
          <MetricCard
            label={t('business.monthlyTips')}
            value={formatCurrency(analytics?.monthlyTips || 0, currency)}
            icon={<Calendar size={24} />}
            subtitle="This month"
          />
          <MetricCard
            label={t('business.totalTips')}
            value={formatCurrency(analytics?.totalTips || 0, currency)}
            icon={<Layers size={24} />}
            subtitle={`${analytics?.tipCount || 0} ${t('business.tipCount')}`}
          />
        </div>
      )}

      {/* Operations Metrics */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="metrics-grid">
          <MetricCard
            label={t('business.staffCount')}
            value={analytics?.employeeCount || 0}
            icon={<Users size={24} />}
          />
          <MetricCard
            label={t('business.tablesCount')}
            value={analytics?.tableCount || 0}
            icon={<UtensilsCrossed size={24} />}
          />
          <MetricCard
            label={t('business.qrCodesCount')}
            value={analytics?.qrCount || 0}
            icon={<QrCode size={24} />}
          />
          <MetricCard
            label={t('business.activeChannels')}
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
            <h2 className="section-title">{t('business.recentActivity')}</h2>
          </div>
          <Link
            to="/business/analytics"
            style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {t('business.viewAllAnalytics')} <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingState compact message={t('common.loading')} />
        ) : analytics?.recentTips && analytics.recentTips.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('common.time')}</th>
                  <th>{t('common.amount')}</th>
                  <th>{t('nav.paymentMethods')}</th>
                  <th>{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentTips.map((tip) => (
                  <tr key={tip.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {formatTime(tip.created_at)}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {formatCurrency(Number(tip.amount), tip.currency || currency)}
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {tip.payment_method.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">{t('common.success')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<DollarSign size={28} />}
            title={t('business.noTipsYet')}
            description={t('business.dashboardSubtitle')}
            action={
              <Link to="/business/qr" className="btn btn-primary">
                <QrCode size={16} /> {t('business.generateQrBtn')}
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
};
