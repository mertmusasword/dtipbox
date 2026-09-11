import React, { useState } from 'react';
import { Headphones } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { SupportTicketModal } from './SupportTicketModal';
import '../styles/home.css';

export const FloatingSupportWidget: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Hide on tipping / checkout screens to maintain pure checkout focus
  if (
    location.pathname.startsWith('/tip/') ||
    location.pathname.startsWith('/pay/')
  ) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="support-floating-btn"
        onClick={() => setIsOpen(true)}
        aria-label={t('support.widgetBtn')}
        title={t('support.widgetBtn')}
      >
        <span className="support-pulse-dot" />
        <Headphones size={17} />
        <span>{t('support.widgetBtn')}</span>
      </button>

      <SupportTicketModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
