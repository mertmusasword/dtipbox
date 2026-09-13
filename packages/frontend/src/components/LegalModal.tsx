import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Cookie, 
  Building2, 
  Mail, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { getLegalBundle } from '../content/legal/legal-data';

export type LegalTab = 'kvkk' | 'privacy' | 'terms' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'kvkk',
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const bundle = getLegalBundle(language);

  // Sync initial tab whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialTab]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDoc = bundle[activeTab];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          color: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/naponi-brand.svg" alt="Naponi" style={{ height: '28px', width: 'auto' }} />
            <div style={{ height: '18px', width: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {language === 'tr' ? 'Yasal & Uyumluluk Merkezi' : 'Legal & Compliance Center'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Printer size={14} />
              <span>{bundle.printBtn}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={bundle.closeBtn}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div 
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('kvkk')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'kvkk' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'kvkk' ? '#34d399' : '#94a3b8',
              outline: activeTab === 'kvkk' ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <ShieldCheck size={16} />
            <span>{bundle.tabs.kvkk}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'privacy' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'privacy' ? '#38bdf8' : '#94a3b8',
              outline: activeTab === 'privacy' ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Lock size={16} />
            <span>{bundle.tabs.privacy}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'terms' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'terms' ? '#f59e0b' : '#94a3b8',
              outline: activeTab === 'terms' ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <FileText size={16} />
            <span>{bundle.tabs.terms}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cookies')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'cookies' ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
              color: activeTab === 'cookies' ? '#a78bfa' : '#94a3b8',
              outline: activeTab === 'cookies' ? '1px solid rgba(167, 139, 250, 0.4)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Cookie size={16} />
            <span>{bundle.tabs.cookies}</span>
          </button>
        </div>

        {/* Scrollable Document Body */}
        <div 
          style={{
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            flex: 1,
            lineHeight: 1.65,
            fontSize: '0.92rem',
            color: '#cbd5e1',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              {currentDoc.title}
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              {currentDoc.subtitle}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', background: 'rgba(255, 255, 255, 0.04)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              {currentDoc.lastUpdated}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {currentDoc.sections.map((section, idx) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.65rem' }}>
                  {section.heading}
                </h3>
                {Array.isArray(section.content) ? (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {section.content.map((item, itemIdx) => (
                      <li key={itemIdx} style={{ color: '#cbd5e1' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, color: '#cbd5e1' }}>
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Official Registered Company Card */}
          <div 
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: '0.85rem',
              color: '#cbd5e1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#34d399', fontWeight: 700 }}>
              <CheckCircle2 size={16} />
              <span>{language === 'tr' ? 'Resmi Şirket & Veri Sorumlusu Bilgileri' : 'Official Data Controller Credentials'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Building2 size={15} color="#94a3b8" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#ffffff', display: 'block' }}>{bundle.companyInfo.title}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>VKN: {bundle.companyInfo.vkn}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={15} color="#94a3b8" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>{bundle.companyInfo.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                <span style={{ color: '#ffffff' }}>{bundle.companyInfo.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <span>© {new Date().getFullYear()} Naponi Technologies. All rights reserved.</span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 1.25rem' }}
          >
            {bundle.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
