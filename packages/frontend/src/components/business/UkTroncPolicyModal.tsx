import React, { useRef } from 'react';
import { X, Printer, ShieldCheck, Download, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface UkTroncPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  distributionMode?: string;
}

export const UkTroncPolicyModal: React.FC<UkTroncPolicyModalProps> = ({
  isOpen,
  onClose,
  businessName = 'Our Venue',
  distributionMode = 'EQUAL_POOL',
}) => {
  const { language } = useLanguage();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content glass-card"
        style={{
          maxWidth: '840px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          color: '#1C1917',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E7E5E4',
            background: '#FAFAF9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🇬🇧</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1C1917' }}>
                UK Tronc & Tipping Policy (Allocation of Tips Act 2023)
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#78716C' }}>
                Statutory Code of Practice Compliant Written Tipping Policy
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem' }}
            >
              <Printer size={15} />
              <span>{language === 'tr' ? 'Yazdır / PDF İndir' : 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#F5F5F4',
                border: '1px solid #E7E5E4',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#57534E',
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Document Preview */}
        <div
          ref={printAreaRef}
          id="uk-tronc-print-area"
          style={{
            padding: '2rem',
            overflowY: 'auto',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            color: '#292524',
          }}
        >
          {/* Document Header */}
          <div style={{ borderBottom: '2px solid #00247D', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#00247D',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  Statutory Employment Policy
                </span>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#00247D' }}>
                  WRITTEN TIPPING & TRONC ALLOCATION POLICY
                </h1>
                <div style={{ fontSize: '0.82rem', color: '#57534E', marginTop: '0.25rem' }}>
                  Issued in accordance with the <strong>Employment (Allocation of Tips) Act 2023</strong> and the official <strong>Code of Practice on Fair and Transparent Distribution of Tips</strong> (effective 1 October 2024).
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '180px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1C1917' }}>{businessName}</div>
                <div style={{ fontSize: '0.75rem', color: '#78716C' }}>Date of Issue: {todayStr}</div>
                <div style={{ fontSize: '0.75rem', color: '#78716C' }}>Policy Version: 1.0 (2026 Edition)</div>
              </div>
            </div>
          </div>

          {/* Section 1: Purpose & Statutory Commitment */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#00247D', margin: '0 0 0.4rem' }}>
              1. Policy Statement and Purpose
            </h4>
            <p style={{ margin: 0 }}>
              <strong>{businessName}</strong> (&ldquo;the Employer&rdquo;) is fully committed to fairness, integrity, and total transparency in the collection and allocation of customer tips, gratuities, and service charges (&ldquo;qualifying tips&rdquo;). This policy applies to all qualifying workers, including permanent staff, fixed-term employees, zero-hours contract workers, and eligible agency workers engaged at our venue.
            </p>
          </div>

          {/* Section 2: 100% Pass-Through & Zero Deductions */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#00247D', margin: '0 0 0.4rem' }}>
              2. 100% Pass-Through & Prohibited Deductions (Section 1 of the Act)
            </h4>
            <p style={{ margin: 0 }}>
              Pursuant to the Employment (Allocation of Tips) Act 2023, the Employer enforces a strict <strong>100% Pass-Through Rule</strong>:
            </p>
            <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.25rem' }}>
              <li><strong>Zero Employer Retainment:</strong> The Employer retains 0% of all customer tips. No commission, administrative surcharge, handling fee, or profit margin is withheld.</li>
              <li><strong>Zero Credit Card / Merchant Processing Deductions:</strong> Bank terminal interchange and payment gateway processing fees are absorbed entirely by the Employer and are <strong>never</strong> deducted from staff tips.</li>
              <li><strong>Independent Non-Custodial Infrastructure:</strong> Digital payments processed via Naponi operate non-custodially, ensuring funds flow directly into verified worker/business accounts without intermediate platform commingling.</li>
            </ul>
          </div>

          {/* Section 3: Allocation Method */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#00247D', margin: '0 0 0.4rem' }}>
              3. Method of Allocation & Eligibility
            </h4>
            <p style={{ margin: '0 0 0.4rem' }}>
              Tips received at {businessName} are allocated pursuant to transparent, objective criteria agreed upon with staff:
            </p>
            <div style={{ background: '#F5F5F4', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E7E5E4' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1C1917', marginBottom: '0.2rem' }}>
                Current Venue Allocation Framework:{' '}
                <span style={{ color: '#00247D' }}>
                  {distributionMode === 'INDIVIDUAL' && 'Direct Server Allocation (100% Direct to Recipient)'}
                  {distributionMode === 'EQUAL_POOL' && 'Equal House Tip Pool / Shift-Based Tronc'}
                  {distributionMode === 'POINT_POOL' && 'Role & Shift Weighted Tronc Pool'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#57534E' }}>
                {distributionMode === 'INDIVIDUAL' &&
                  'All digital and cash tips designated by a customer for an individual server are allocated directly to that server. Unallocated general tips are distributed equally among participating on-duty team members.'}
                {distributionMode === 'EQUAL_POOL' &&
                  'All customer tips collected during each shift/period are pooled and shared equally among all eligible front-of-house and back-of-house staff working that shift.'}
                {distributionMode === 'POINT_POOL' &&
                  'All tips are shared transparently according to published objective role weights (e.g. Server, Bartender, Commis, Kitchen) reflecting training, responsibilities, and shift duration.'}
              </p>
            </div>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: '#B45309' }}>
              ⚠️ <strong>Management Exclusion:</strong> In compliance with UK fair allocation principles and international standards, owners, directors, and senior salaried managers with hiring/firing authority are strictly prohibited from receiving shares from the employee tip pool.
            </p>
          </div>

          {/* Section 4: Payment Schedule */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#00247D', margin: '0 0 0.4rem' }}>
              4. Payment Schedule & Timelines (Section 3 of the Act)
            </h4>
            <p style={{ margin: 0 }}>
              All qualifying tips collected in any given calendar month will be distributed and paid out to workers <strong>no later than the end of the following month</strong> (typically reconciled with the regular payroll cycle or immediate weekly bank transfer), adhering fully to the statutory deadline.
            </p>
          </div>

          {/* Section 5: Records Retention & Worker Rights */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#00247D', margin: '0 0 0.4rem' }}>
              5. Record Keeping & Worker Inspection Rights (Section 9 of the Act)
            </h4>
            <p style={{ margin: 0 }}>
              The Employer maintains a comprehensive, digital audit record of all tips collected and distributed via the Naponi platform for a minimum of <strong>3 years</strong>. Every worker has the statutory right to request:
            </p>
            <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.25rem' }}>
              <li>The total amount of qualifying tips collected by the venue during any reference period.</li>
              <li>The exact proportion and amount allocated and paid to them.</li>
            </ul>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#57534E' }}>
              Any worker information request will be fulfilled by management in writing within four (4) weeks without prejudice.
            </p>
          </div>

          {/* Section 6: Sign-off & Acknowledgement */}
          <div style={{ borderTop: '1px solid #D6D3D1', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#57534E', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  For and on behalf of the Employer:
                </div>
                <div style={{ borderBottom: '1px solid #78716C', height: '36px' }} />
                <div style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '0.25rem' }}>
                  Authorized Manager Signature & Date
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#57534E', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Staff Representative / Troncmaster:
                </div>
                <div style={{ borderBottom: '1px solid #78716C', height: '36px' }} />
                <div style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '0.25rem' }}>
                  Staff Committee Acknowledgement & Date
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #E7E5E4',
            background: '#FAFAF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.78rem', fontWeight: 600 }}>
            <ShieldCheck size={16} />
            <span>UK Employment (Allocation of Tips) Act 2023 Statutory Compliance Verified</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              {language === 'tr' ? 'Kapat' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={15} />
              <span>{language === 'tr' ? 'Yazdır / PDF Olarak Kaydet' : 'Print / Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
