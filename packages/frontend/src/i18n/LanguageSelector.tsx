import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { SupportedLanguage } from './types';
import { trackLanguageSelected } from '../analytics';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'compact' | 'flagOnly' | 'footer' | 'floating' | 'minimal';
  direction?: 'up' | 'down' | 'auto';
  className?: string;
  theme?: 'dark' | 'light';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  direction = 'auto',
  className = '',
  theme = 'dark',
}) => {
  const { language, setLanguage, supportedLanguages, currentMeta, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(direction === 'up');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  // Determine opening direction
  useEffect(() => {
    if (direction === 'up') {
      setOpenUpwards(true);
    } else if (direction === 'down') {
      setOpenUpwards(false);
    } else if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 360 && rect.top > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen, direction]);

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
    trackLanguageSelected(code);
    setIsOpen(false);
  };

  const isMinimal = variant === 'minimal';
  const isFlagOnly = variant === 'flagOnly';
  const isCompact = variant === 'compact' || isFlagOnly || isMinimal;

  return (
    <div
      ref={dropdownRef}
      className={`lang-selector-container ${variant} ${className}`}
      style={{ position: 'relative', display: 'inline-block', zIndex: 9999 }}
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
          gap: isMinimal ? '5px' : isFlagOnly ? '4px' : '8px',
          padding: isMinimal
            ? '6px 11px'
            : isFlagOnly
            ? '5px 8px'
            : variant === 'compact'
            ? '6px 12px'
            : '7px 14px',
          borderRadius: '9999px',
          background: isMinimal
            ? 'rgba(255, 255, 255, 0.05)'
            : isLight
            ? '#FFFFFF'
            : 'rgba(255, 255, 255, 0.12)',
          border: isMinimal
            ? '1px solid rgba(255, 255, 255, 0.14)'
            : isLight
            ? '1px solid rgba(0, 0, 0, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.28)',
          boxShadow: isMinimal
            ? 'none'
            : isLight
            ? '0 2px 8px rgba(0, 0, 0, 0.04)'
            : '0 2px 10px rgba(0, 0, 0, 0.25)',
          color: isLight ? '#1C1917' : '#cbd5e1',
          fontSize: isMinimal ? '13px' : '14px',
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
      >
        {isMinimal ? (
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.04em' }}>
            {currentMeta.code.toUpperCase()}
          </span>
        ) : (
          <span style={{ fontSize: isFlagOnly ? '20px' : '18px', lineHeight: 1 }}>{currentMeta.flag}</span>
        )}
        {!isCompact && (
          <span className="lang-name-text" style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
            {currentMeta.nativeName}
          </span>
        )}
        <svg
          style={{
            width: isMinimal || isFlagOnly ? '11px' : '14px',
            height: isMinimal || isFlagOnly ? '11px' : '14px',
            opacity: 0.75,
            color: isLight ? '#78716C' : 'currentColor',
            transform: openUpwards
              ? isOpen ? 'rotate(0deg)' : 'rotate(180deg)'
              : isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className="lang-dropdown-menu"
          style={{
            position: 'absolute',
            ...(openUpwards
              ? { bottom: 'calc(100% + 8px)', top: 'auto' }
              : { top: 'calc(100% + 8px)', bottom: 'auto' }
            ),
            [dir === 'rtl' ? 'left' : 'right']: 0,
            zIndex: 99999,
            minWidth: '220px',
            maxHeight: '340px',
            overflowY: 'auto',
            background: isLight ? '#FFFFFF' : '#0f172a',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '16px',
            boxShadow: isLight
              ? '0 16px 36px -6px rgba(0, 0, 0, 0.15)'
              : openUpwards
                ? '0 -16px 36px -6px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                : '0 16px 36px -6px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)',
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
              color: isLight ? '#78716C' : '#94a3b8',
              borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.06)',
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
                  background: isSelected
                    ? isLight
                      ? 'rgba(5, 150, 105, 0.1)'
                      : 'rgba(99, 102, 241, 0.18)'
                    : 'transparent',
                  border: isSelected
                    ? isLight
                      ? '1px solid rgba(5, 150, 105, 0.25)'
                      : '1px solid rgba(99, 102, 241, 0.3)'
                    : '1px solid transparent',
                  color: isSelected
                    ? isLight
                      ? '#065F46'
                      : '#a5b4fc'
                    : isLight
                      ? '#1C1917'
                      : '#e2e8f0',
                  fontSize: '13.5px',
                  textAlign: dir === 'rtl' ? 'right' : 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = isLight ? '#F5F5F4' : 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>{lang.flag}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: isSelected ? 600 : 500 }}>{lang.nativeName}</span>
                    <span style={{ fontSize: '11px', color: isLight ? '#78716C' : '#64748b' }}>{lang.name}</span>
                  </div>
                </div>
                {isSelected && (
                  <svg
                    style={{
                      width: '16px',
                      height: '16px',
                      color: isLight ? '#059669' : '#818cf8',
                      flexShrink: 0,
                    }}
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
