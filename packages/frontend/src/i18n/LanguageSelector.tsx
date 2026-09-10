import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { SupportedLanguage } from './types';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'compact' | 'flagOnly' | 'footer' | 'floating';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'navbar', className = '' }) => {
  const { language, setLanguage, supportedLanguages, currentMeta, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const isFlagOnly = variant === 'flagOnly';
  const isCompact = variant === 'compact' || isFlagOnly;

  return (
    <div
      ref={dropdownRef}
      className={`lang-selector-container ${variant} ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language"
        className="lang-selector-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isFlagOnly ? '4px' : '8px',
          padding: isFlagOnly ? '5px 8px' : variant === 'compact' ? '6px 12px' : '8px 16px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.28)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
      >
        <span style={{ fontSize: isFlagOnly ? '20px' : '18px', lineHeight: 1 }}>{currentMeta.flag}</span>
        {!isCompact && (
          <span className="lang-name-text" style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
            {currentMeta.nativeName}
          </span>
        )}
        <svg
          style={{
            width: isFlagOnly ? '11px' : '14px',
            height: isFlagOnly ? '11px' : '14px',
            opacity: 0.75,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className="lang-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [dir === 'rtl' ? 'left' : 'right']: 0,
            zIndex: 99999,
            minWidth: '220px',
            maxHeight: '360px',
            overflowY: 'auto',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            padding: '6px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            style={{
              padding: '6px 12px 8px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '4px',
            }}
          >
            Select Language / Dil Seçin
          </div>
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  color: isSelected ? '#a5b4fc' : '#e2e8f0',
                  fontSize: '13.5px',
                  textAlign: dir === 'rtl' ? 'right' : 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>{lang.flag}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: isSelected ? 600 : 500 }}>{lang.nativeName}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{lang.name}</span>
                  </div>
                </div>
                {isSelected && (
                  <svg
                    style={{ width: '16px', height: '16px', color: '#818cf8', flexShrink: 0 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
