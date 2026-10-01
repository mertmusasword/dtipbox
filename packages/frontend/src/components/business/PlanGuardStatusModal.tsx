import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../i18n';
import { getPlanGuardText } from '../../i18n/planGuardLocales';
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  QrCode,
  Layers,
  Cpu,
  BadgeDollarSign
} from 'lucide-react';

interface PlanStatusData {
  businessId: string;
  businessName: string;
  isFounderMember: boolean;
  isLifetimeFree: boolean;
  membershipPlan: string;
  membershipStatus: string;
  joinedAt: string;
  deadline2026: string;
  capabilities: {
    unlimitedTables: boolean;
    maxTables: number;
    unlimitedEmployees: boolean;
    maxEmployees: number;
    posIntegrations: boolean;
    customBranding: boolean;
    multiCurrency: boolean;
    payrollExport: boolean;
    prioritySupport: boolean;
    smartQrCampaigns: boolean;
  };
  usage: {
    currentTables: number;
    currentEmployees: number;
    canAddTable: boolean;
    canAddEmployee: boolean;
  };
}

interface PlanGuardStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanGuardStatusModal: React.FC<PlanGuardStatusModalProps> = ({ isOpen, onClose }) => {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const pgt = getPlanGuardText(language);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PlanStatusData | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api
      .get('/business/plan-status')
      .then((res) => {
        if (res.data?.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load plan status:', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const isFounder = data?.isFounderMember ?? true;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          borderRadius: '20px',
          border: isFounder ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
          background: isFounder
            ? 'linear-gradient(145deg, rgba(26, 20, 10, 0.95), rgba(15, 23, 42, 0.95))'
            : 'var(--bg-card)',
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
          boxShadow: isFounder ? '0 25px 50px -12px rgba(245, 158, 11, 0.25)' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            [isRtl ? 'left' : 'right']: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          aria-label={pgt.closeBtn}
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: '12px',
              background: isFounder ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.15)',
              color: isFounder ? '#fbbf24' : '#60a5fa',
              display: 'inline-flex',
            }}
          >
            {isFounder ? <Crown size={26} /> : <ShieldCheck size={26} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  background: isFounder ? 'rgba(245, 158, 11, 0.25)' : 'rgba(59, 130, 246, 0.2)',
                  color: isFounder ? '#fbbf24' : '#60a5fa',
                  border: isFounder ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                {isFounder ? pgt.founderBadge : pgt.standardBadge}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                ● {pgt.active}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: 'var(--text-primary)' }}>
              {pgt.panelTitle}
            </h2>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {isFounder ? pgt.founderStatusDesc : pgt.standardStatusDesc}
        </p>

        {/* Lifetime Guarantee Banner */}
        {isFounder && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={20} color="#fbbf24" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem' }}>
                {pgt.lifetimeExemption}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {pgt.guaranteedUntil}
              </div>
            </div>
          </div>
        )}

        {/* Capacity & Quotas Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {/* Table Capacity */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <QrCode size={18} color="#60a5fa" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {pgt.tableLimitLabel}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: isFounder ? '#10b981' : '#fbbf24', fontWeight: 700 }}>
              {isFounder ? pgt.unlimited : `${data?.usage?.currentTables || 0} / 10`}
            </span>
          </div>

          {/* Employee Capacity */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={18} color="#34d399" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {pgt.employeeLimitLabel}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: isFounder ? '#10b981' : '#fbbf24', fontWeight: 700 }}>
              {isFounder ? pgt.unlimited : `${data?.usage?.currentEmployees || 0} / 5`}
            </span>
          </div>
        </div>

        {/* Feature Entitlement Checklist */}
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 700 }}>
          {isFounder ? 'Kurucu Ayrıcalıkları' : 'Özellik Durumu'}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { label: pgt.posIntegrationLabel, enabled: isFounder || data?.capabilities?.posIntegrations },
            { label: pgt.customBrandingLabel, enabled: isFounder || data?.capabilities?.customBranding },
            { label: pgt.multiCurrencyLabel, enabled: isFounder || data?.capabilities?.multiCurrency },
            { label: pgt.payrollExportLabel, enabled: isFounder || data?.capabilities?.payrollExport },
            { label: pgt.prioritySupportLabel, enabled: isFounder || data?.capabilities?.prioritySupport },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.enabled ? (
                  <CheckCircle2 size={16} color="#10b981" />
                ) : (
                  <Lock size={16} color="#94a3b8" />
                )}
                <span style={{ fontSize: '0.85rem', color: item.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {item.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: item.enabled ? '#10b981' : 'var(--text-muted)',
                }}
              >
                {item.enabled ? pgt.included : pgt.requiresUpgrade}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            {pgt.closeBtn}
          </button>
          <Link
            to={language === 'tr' ? '/kurucu-uye' : '/founder'}
            className="btn btn-primary btn-sm"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            onClick={onClose}
          >
            <span>{pgt.founderPerksCta}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
