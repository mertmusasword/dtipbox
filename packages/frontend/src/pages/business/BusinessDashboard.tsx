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
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { AgreementModal } from '../../components/AgreementModal';

export const BusinessDashboard: React.FC = () => {
  const { t, formatCurrency, formatTime } = useLanguage();
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(true);
  const [showAgreementModal, setShowAgreementModal] = useState<boolean>(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/business'),
      api.get('/business/analytics'),
      api.get('/agreements/active').catch(() => ({ data: { data: { is_accepted: true } } })),
    ])
      .then(([bizRes, analyticsRes, agreementRes]) => {
        setBusiness(bizRes.data.data);
        setAnalytics(analyticsRes.data.data);
        if (agreementRes?.data?.data) {
          setAgreementAccepted(!!agreementRes.data.data.is_accepted);
        }
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerifyTip = async (tipId: string) => {
    try {
      setVerifyingId(tipId);
      await api.put(`/business/tips/${tipId}/verify`);
      loadData();
    } catch {
      alert('Bahşiş onaylanırken bir hata oluştu.');
    } finally {
      setVerifyingId(null);
    }
  };

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

      {/* Agreement Status Banner */}
      {!loading && !agreementAccepted && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Naponi İşletme Hizmet ve Kullanım Sözleşmesi Onayı Bekleniyor
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                Canlı ödeme altyapısı ve QR kod operasyonlarını eksiksiz yönetebilmek için lütfen güncel sözleşmeyi inceleyip onaylayınız.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAgreementModal(true)}
            className="btn btn-primary bg-amber-600 hover:bg-amber-700 text-white text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <FileText size={14} /> Sözleşmeyi İncele ve Onayla
          </button>
        </div>
      )}

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
            subtitle={
              analytics?.pendingTipCount && analytics.pendingTipCount > 0
                ? `${analytics.tipCount || 0} ${t('business.tipCount')} (${analytics.pendingTipCount} onay bekliyor)`
                : `${analytics?.tipCount || 0} ${t('business.tipCount')}`
            }
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
                      {tip.status === 'UNVERIFIED' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="badge badge-warning">Onay Bekliyor</span>
                          <button
                            type="button"
                            onClick={() => handleVerifyTip(tip.id)}
                            disabled={verifyingId === tip.id}
                            className="btn btn-primary"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}
                          >
                            {verifyingId === tip.id ? '...' : 'Havale Alındı'}
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-success">{t('common.success')}</span>
                      )}
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

      <AgreementModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        onAccepted={() => {
          setAgreementAccepted(true);
          loadData();
        }}
      />
    </div>
  );
};
