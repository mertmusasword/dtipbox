import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { useOnboardingText } from '../i18n/onboardingLocales';
import { useOnboarding } from './OnboardingContext';

/** Non-blocking warning shown while payment details are missing. */
export const SetupWarning: React.FC = () => {
  const ob = useOnboarding();
  const o = useOnboardingText();
  const { dir } = useLanguage();
  if (!ob || !ob.loaded || !ob.isPending('payment')) return null;

  return (
    <div className="onb-warning" dir={dir} role="alert">
      <span className="onb-warning-icon">⚠️</span>
      <div className="onb-warning-text">
        <strong>{o('warnTitle')}</strong>
        <div>{o('warnBody')}</div>
      </div>
      <Link to="/business/payment-settings" className="btn btn-secondary btn-sm">
        {o('warnCta')}
      </Link>
    </div>
  );
};
