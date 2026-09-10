import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { PaymentMethodItem, PaymentMethodType, PaymentMethodStatus } from '../../types';
import { CreditCard, Building2, Smartphone, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentMethodsPage: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMethods = () => {
    setLoading(true);
    api
      .get('/business/payment-methods')
      .then((res) => setMethods(res.data.data))
      .catch((err) => console.error('Failed to load payment methods:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const handleToggleStatus = async (item: PaymentMethodItem) => {
    if (!item.canActivate && item.status !== 'ACTIVE') {
      alert(
        item.type === 'IBAN_TRANSFER'
          ? 'Please configure your Business Bank Account first before activating IBAN / Bank Transfer.'
          : 'This payment provider is not connected yet and cannot be activated.'
      );
      return;
    }

    const nextStatus: PaymentMethodStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await api.put('/business/payment-methods', {
        type: item.type,
        status: nextStatus,
      });
      loadMethods();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update payment method');
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

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Payment Channels & Acceptance</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Manage integration connectivity and toggle public tip availability
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading payment channels...
          </div>
        ) : (
          methods.map((method) => {
            const meta = getMethodMeta(method.type);
            const isConnected = method.connectionStatus === 'CONNECTED';
            const isActive = method.status === 'ACTIVE';

            return (
              <div
                key={method.type}
                className="glass-card"
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
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#10b981' : isConnected ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{meta.title}</h3>
                      {isConnected ? (
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                          <CheckCircle2 size={12} /> Connected
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
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
                      <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        🟢 Active (Customer Visible)
                      </span>
                    ) : isConnected ? (
                      <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        🟡 Inactive (Hidden from Customer)
                      </span>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
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
          })
        )}
      </div>
    </div>
  );
};
