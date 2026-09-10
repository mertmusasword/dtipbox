import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export const TipPage: React.FC = () => {
  const { publicToken } = useParams<{ publicToken: string }>();

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
        setError(err.response?.data?.error || 'Failed to load tip page');
      })
      .finally(() => setLoading(false));
  }, [publicToken]);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      alert('Please select an active payment method');
      return;
    }
    if (effectiveAmount <= 0) {
      alert('Please select or enter a valid tip amount');
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
      alert(err.response?.data?.error || 'Failed to submit tip');
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
          <div style={{ color: 'var(--text-secondary)' }}>Loading Tip Session...</div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Unable to Open Tip Page</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error || 'Invalid session'}</p>
        </div>
      </div>
    );
  }

  // --- Payment Confirmation Screen ---
  if (paymentResult) {
    const isIban = paymentResult.tip.payment_method === 'IBAN_TRANSFER';
    const ibanDetails = paymentResult.payment?.ibanDetails;

    return (
      <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            {isIban ? 'Bank Transfer Details' : 'Tip Initiated!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {isIban
              ? 'Complete the transfer using your banking app.'
              : 'Thank you for supporting our service team!'}
          </p>

          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
              <span style={{ fontWeight: 700 }}>{details.business.currency} {paymentResult.tip.amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span className={`badge ${isIban ? 'badge-warning' : 'badge-success'}`}>
                {paymentResult.payment?.status}
              </span>
            </div>

            {isIban && ibanDetails && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACCOUNT HOLDER</div>
                  <div style={{ fontWeight: 600 }}>{ibanDetails.accountHolderName}</div>
                </div>
                {ibanDetails.iban && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IBAN / ACCOUNT</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <code style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ibanDetails.iban}</code>
                      <button onClick={() => copyToClipboard(ibanDetails.iban!)} style={{ color: 'var(--accent-primary)' }}>
                        {copiedIban ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                {ibanDetails.bankName && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BANK</div>
                    <div style={{ fontWeight: 600 }}>{ibanDetails.bankName}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TRANSFER REFERENCE</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{ibanDetails.referenceCode}</div>
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
            Leave Another Tip
          </button>
        </div>
      </div>
    );
  }

  // --- Main 4-Step Tip Form ---
  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            Direct digital tipping. Choose your recipient and amount.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Step 1: Select Employee */}
          {details.employees.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  1. Select Staff Member
                </span>
                {selectedEmployeeId && (
                  <button
                    type="button"
                    onClick={() => setSelectedEmployeeId(undefined)}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}
                  >
                    General Pool
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
              2. Choose Tip Amount ({details.business.currency})
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
              placeholder="Or enter custom amount..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="form-input"
              style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 600 }}
            />
          </div>

          {/* Step 3: Select Payment Method */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              3. Payment Method
            </span>

            {!details.hasAvailablePaymentMethod ? (
              <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                No payment method is currently available.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {['CARD', 'IBAN_TRANSFER', 'APPLE_PAY', 'GOOGLE_PAY'].map((methodKey) => {
                  const activeItem = details.activePaymentMethods.find((m) => m.type === methodKey);
                  const isAvailable = !!activeItem;
                  const isSelected = selectedPaymentMethod === methodKey;

                  let label = 'Credit / Debit Card';
                  let icon = <CreditCard size={18} />;
                  if (methodKey === 'IBAN_TRANSFER') {
                    label = 'IBAN / Direct Bank Transfer';
                    icon = <Building2 size={18} />;
                  } else if (methodKey === 'APPLE_PAY') {
                    label = 'Apple Pay';
                    icon = <Smartphone size={18} />;
                  } else if (methodKey === 'GOOGLE_PAY') {
                    label = 'Google Pay';
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
                          : '1px solid rgba(255, 255, 255, 0.03)',
                        opacity: isAvailable ? 1 : 0.45,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: isAvailable ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                          {icon}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
                      </div>
                      <div>
                        {isAvailable ? (
                          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>🟢 Available</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>⚪ Unavailable</span>
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
                placeholder="Your Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <textarea
                placeholder="Add a kind note or message (optional)..."
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
              'Processing Tip...'
            ) : (
              <>
                Send Tip ({details.business.currency} {effectiveAmount || 0})
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Powered by D-TIPBOX • Direct tip transfer platform
        </div>
      </div>
    </div>
  );
};
