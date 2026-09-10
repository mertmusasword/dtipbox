import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { PaymentMethodItem, PaymentMethodType, PaymentMethodStatus } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import { CreditCard, Building2, Smartphone, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentMethodsPage: React.FC = () => {
  const { showToast } = useToast();
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMethods = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/business/payment-methods')
      .then((res) => setMethods(res.data.data))
      .catch(() => setError('Failed to load payment methods'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const handleToggleStatus = async (item: PaymentMethodItem) => {
    if (!item.canActivate && item.status !== 'ACTIVE') {
      showToast(
        item.type === 'IBAN_TRANSFER'
          ? 'Configure your bank account first before activating IBAN / Bank Transfer.'
          : 'This payment provider is not connected yet and cannot be activated.',
        'error'
      );
      return;
    }

    const nextStatus: PaymentMethodStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await api.put('/business/payment-methods', { type: item.type, status: nextStatus });
      showToast(`${getMethodMeta(item.type).title} ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      loadMethods();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update payment method', 'error');
    }
  };

  const getMethodMeta = (type: PaymentMethodType) => {
    switch (type) {
      case 'IBAN_TRANSFER':
        return {
          title: 'Direct Bank / IBAN Transfer',
          description: 'Customers receive your bank details and reference code directly to transfer via mobile banking.',
          icon: <Building2 size={24} />,
          configLink: '/business/payment-account',
          configLabel: 'Configure Bank Account',
        };
      case 'CARD':
        return {
          title: 'Credit & Debit Cards',
          description: 'Visa, Mastercard, Amex processed directly into your connected provider account.',
          icon: <CreditCard size={24} />,
          configLink: null,
          configLabel: null,
        };
      case 'APPLE_PAY':
        return {
          title: 'Apple Pay',
          description: 'Instant 1-touch mobile tipping on supported iOS and Safari devices.',
          icon: <Smartphone size={24} />,
          configLink: null,
          configLabel: null,
        };
      case 'GOOGLE_PAY':
        return {
          title: 'Google Pay',
          description: 'Instant 1-touch tipping on Android devices and Chrome browsers.',
          icon: <Smartphone size={24} />,
          configLink: null,
          configLabel: null,
        };
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <h1 className="page-title">Payment Channels & Acceptance</h1>
        <p className="page-subtitle">Manage integration connectivity and toggle public tip availability</p>
        <LoadingState message="Loading payment channels..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <ErrorState message={error} onRetry={loadMethods} />
      </div>
    );
  }

  const handleDeactivateAll = async () => {
    if (!confirm('Are you sure you want to deactivate ALL payment methods? Customers will not be able to leave tips until at least one method is reactivated.')) return;
    try {
      await api.post('/business/payment-methods/deactivate-all');
      showToast('All payment methods deactivated');
      loadMethods();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to deactivate payment methods', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Channels & Acceptance</h1>
          <p className="page-subtitle mb-0">
            Manage integration connectivity and toggle public tip availability
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleDeactivateAll}
            title="Temporarily stop accepting all tip payment methods"
          >
            Disable All Methods
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {methods.map((method) => {
          const meta = getMethodMeta(method.type);
          const isConnected = method.connectionStatus === 'CONNECTED';
          const isActive = method.status === 'ACTIVE';

          return (
            <div
              key={method.type}
              className="glass-card glass-card-interactive"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
                <div className="metric-icon" style={{
                  color: isActive ? 'var(--success)' : isConnected ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {meta.icon}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{meta.title}</h3>
                    {isConnected ? (
                      <span className="badge badge-info">
                        <CheckCircle2 size={12} /> Connected
                      </span>
                    ) : (
                      <span className="badge badge-neutral">
                        <XCircle size={12} /> Not Connected
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {meta.description}
                  </p>
                  {meta.configLink && !isConnected && (
                    <Link
                      to={meta.configLink}
                      style={{ display: 'inline-block', fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.4rem', fontWeight: 600 }}
                    >
                      {meta.configLabel} →
                    </Link>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  {isActive ? (
                    <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem' }}>
                      🟢 Active
                    </span>
                  ) : isConnected ? (
                    <span className="badge badge-warning" style={{ padding: '0.4rem 0.8rem' }}>
                      🟡 Inactive
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ padding: '0.4rem 0.8rem' }}>
                      ⚪ Unavailable
                    </span>
                  )}
                </div>

                <button
                  className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
                  disabled={!isConnected && !isActive}
                  onClick={() => handleToggleStatus(method)}
                  style={{ minWidth: '120px' }}
                >
                  {isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
