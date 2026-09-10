import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { TipPageDetails, PaymentMethodType } from '../../types';
import {
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Heart,
  Copy,
  Check,
} from 'lucide-react';
import { useLanguage, LanguageSelector } from '../../i18n';

export const TipPage: React.FC = () => {
  const { publicToken } = useParams<{ publicToken: string }>();
  const { t, formatCurrency, dir } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<TipPageDetails | null>(null);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');

  // Processing & Confirmation State
  const [submitting, setSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    setLoading(true);
    api
      .get(`/tip/${publicToken}`)
      .then((res) => {
        setDetails(res.data.data);
        if (res.data.data.presetAmounts?.length > 0) {
          setSelectedAmount(res.data.data.presetAmounts[1] || res.data.data.presetAmounts[0]);
        }
        if (res.data.data.activePaymentMethods?.length > 0) {
          setSelectedPaymentMethod(res.data.data.activePaymentMethods[0].type);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || t('tip.invalidQr'));
      })
      .finally(() => setLoading(false));
  }, [publicToken, t]);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      alert(t('tip.noPaymentMethods'));
      return;
    }
    if (effectiveAmount <= 0) {
      alert(t('tip.selectAmountTitle'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/tip/${publicToken}`, {
        employeeId: selectedEmployeeId || undefined,
        amount: effectiveAmount,
        paymentMethod: selectedPaymentMethod,
        customerName: customerName.trim() || undefined,
        customerMessage: customerMessage.trim() || undefined,
      });
      setPaymentResult(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin" size={36} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
          <div style={{ color: 'var(--text-secondary)' }}>{t('tip.loadingDetails')}</div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: dir === 'rtl' ? 'auto' : '1rem', left: dir === 'rtl' ? '1rem' : 'auto' }}>
          <LanguageSelector variant="compact" />
        </div>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('tip.invalidQr')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error || t('tip.inactiveBusiness')}</p>
          <Link to="/" className="btn btn-secondary">
            {t('tip.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  // --- Payment Confirmation Screen ---
  if (paymentResult) {
    const isIban = paymentResult.tip.payment_method === 'IBAN_TRANSFER';
    const ibanDetails = paymentResult.payment?.ibanDetails;

    return (
      <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: dir === 'rtl' ? 'auto' : '1rem', left: dir === 'rtl' ? '1rem' : 'auto' }}>
          <LanguageSelector variant="compact" />
        </div>

        <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isIban ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isIban ? '#f59e0b' : '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            {isIban ? <Building2 size={32} /> : <CheckCircle2 size={32} />}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {isIban ? t('tip.transferInstructions') : t('tip.successTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {isIban
              ? t('tip.bankNotice')
              : t('tip.successSubtitle')}
          </p>

          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: dir === 'rtl' ? 'right' : 'left',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('common.amount')}:</span>
              <span style={{ fontWeight: 700 }}>
                {formatCurrency(paymentResult.tip.amount, details.business.currency)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('common.status')}:</span>
              <span className={`badge ${isIban ? 'badge-warning' : 'badge-success'}`}>
                {paymentResult.payment?.status === 'UNVERIFIED' ? t('common.unverified') : (paymentResult.payment?.status || t('common.success'))}
              </span>
            </div>

            {isIban && ibanDetails && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('tip.accountHolder')}</div>
                  <div style={{ fontWeight: 600 }}>{ibanDetails.accountHolderName}</div>
                </div>
                {ibanDetails.iban && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('tip.ibanLabel')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <code style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ibanDetails.iban}</code>
                      <button type="button" onClick={() => copyToClipboard(ibanDetails.iban!)} style={{ color: 'var(--accent-primary)', padding: '4px' }}>
                        {copiedIban ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                {ibanDetails.bankName && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('tip.bankName')}</div>
                    <div style={{ fontWeight: 600 }}>{ibanDetails.bankName}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('tip.refCodeLabel')}</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{ibanDetails.referenceCode}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('tip.refCodeNotice')}</div>
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => {
              setPaymentResult(null);
              setCustomAmount('');
            }}
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  // --- Main 4-Step Tip Form ---
  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Top Floating Language Selector */}
      <div style={{ alignSelf: 'flex-end', maxWidth: '480px', width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <LanguageSelector variant="compact" />
      </div>

      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Business Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {details.business.logo ? (
            <img
              src={details.business.logo}
              alt={details.business.name}
              style={{ width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1rem', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#fff',
            }}>
              <Heart size={28} />
            </div>
          )}
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            {details.business.name}
          </h1>
          {details.table && (
            <div className="badge badge-neutral" style={{ marginTop: '0.35rem' }}>
              {details.table.name}
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {t('home.heroHighlight')} • {t('tip.pageTitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Step 1: Select Employee */}
          {details.employees.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  1. {t('tip.selectStaffTitle')}
                </span>
                {selectedEmployeeId && (
                  <button
                    type="button"
                    onClick={() => setSelectedEmployeeId(undefined)}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}
                  >
                    {t('tip.wholeTeam')}
                  </button>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.75rem',
              }}>
                {details.employees.map((emp) => {
                  const isSelected = selectedEmployeeId === emp.id;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-input)',
                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.first_name}
                          style={{ width: '44px', height: '44px', borderRadius: '50%', margin: '0 auto 0.5rem', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem',
                          fontWeight: 700,
                        }}>
                          {emp.first_name[0]}
                        </div>
                      )}
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{emp.first_name}</div>
                      {emp.position && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.position}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Tip Amount */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              2. {t('tip.selectAmountTitle')} ({details.business.currency})
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {details.presetAmounts.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--accent-gradient)' : 'var(--bg-input)',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      border: isSelected ? 'none' : '1px solid var(--border-color)',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    {amt}
                  </button>
                );
              })}
            </div>

            <input
              type="number"
              min="1"
              step="any"
              placeholder={t('tip.customAmountLabel')}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="form-input"
              style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 600 }}
            />
          </div>

          {/* Step 3: Select Payment Method */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              3. {t('tip.paymentMethodTitle')}
            </span>

            {!details.hasAvailablePaymentMethod ? (
              <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                {t('tip.noPaymentMethods')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {['CARD', 'IBAN_TRANSFER', 'APPLE_PAY', 'GOOGLE_PAY'].map((methodKey) => {
                  const catalogItem = details.paymentMethodsCatalog?.find((c) => c.type === methodKey);
                  const isAvailable = catalogItem ? catalogItem.isUsable : details.activePaymentMethods.some((m) => m.type === methodKey);
                  const reason = catalogItem?.reason;
                  const isSelected = selectedPaymentMethod === methodKey;

                  let label = t('tip.creditCard');
                  let icon = <CreditCard size={18} />;
                  if (methodKey === 'IBAN_TRANSFER') {
                    label = t('tip.bankTransfer');
                    icon = <Building2 size={18} />;
                  } else if (methodKey === 'APPLE_PAY') {
                    label = t('tip.applePay');
                    icon = <Smartphone size={18} />;
                  } else if (methodKey === 'GOOGLE_PAY') {
                    label = t('tip.googlePay');
                    icon = <Smartphone size={18} />;
                  }

                  return (
                    <div
                      key={methodKey}
                      onClick={() => isAvailable && setSelectedPaymentMethod(methodKey as PaymentMethodType)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                        border: isSelected
                          ? '2px solid var(--accent-primary)'
                          : isAvailable
                          ? '1px solid var(--border-color)'
                          : '1px solid rgba(255, 255, 255, 0.04)',
                        opacity: isAvailable ? 1 : 0.5,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: isAvailable ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                          {icon}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                          {!isAvailable && reason && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{reason}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        {isAvailable ? (
                          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>🟢 {t('common.active')}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {t('common.inactive')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Optional Message */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder={t('tip.customerNamePlaceholder')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <textarea
                placeholder={t('tip.customerMessagePlaceholder')}
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                className="form-textarea"
                rows={2}
              />
            </div>
          </div>

          {/* Step 4: Submit Button */}
          <button
            type="submit"
            disabled={submitting || !details.hasAvailablePaymentMethod || effectiveAmount <= 0}
            className="btn btn-primary"
            style={{
              padding: '1.1rem',
              fontSize: '1.1rem',
              fontWeight: 800,
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              opacity: submitting || !details.hasAvailablePaymentMethod || effectiveAmount <= 0 ? 0.6 : 1,
            }}
          >
            {submitting ? (
              t('common.loading')
            ) : (
              <>
                {t('tip.payBtn')} {formatCurrency(effectiveAmount || 0, details.business.currency)}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.25rem', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <img src="/naponi-brand.svg" alt="Naponi" style={{ height: '28px', width: 'auto', opacity: 0.9 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('home.footerTagline')}</span>
        </div>
      </div>
    </div>
  );
};
