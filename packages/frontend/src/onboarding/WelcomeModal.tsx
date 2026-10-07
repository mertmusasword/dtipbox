import React, { useState } from 'react';
import { useLanguage } from '../i18n';
import { useOnboardingText, OnboardingKey } from '../i18n/onboardingLocales';
import { useOnboarding, VenueType } from './OnboardingContext';

const VENUES: { id: VenueType; icon: string; key: OnboardingKey }[] = [
  { id: 'restaurant', icon: '🍽️', key: 'venueRestaurant' },
  { id: 'cafe', icon: '☕', key: 'venueCafe' },
  { id: 'hotel', icon: '🏨', key: 'venueHotel' },
  { id: 'bar', icon: '🍸', key: 'venueBar' },
  { id: 'barber', icon: '💈', key: 'venueBarber' },
  { id: 'valet', icon: '🚗', key: 'venueValet' },
];

export const WelcomeModal: React.FC = () => {
  const ob = useOnboarding();
  const o = useOnboardingText();
  const { dir } = useLanguage();
  const [venue, setVenue] = useState<VenueType | null>(null);
  if (!ob) return null;

  const hint = venue ? (venue === 'restaurant' || venue === 'cafe' || venue === 'bar' ? o('hintTable') : o('hintStaff')) : null;

  return (
    <div className="onb-welcome-backdrop" dir={dir} role="dialog" aria-modal="true" aria-labelledby="onb-welcome-title">
      <div className="onb-welcome">
        <h2 id="onb-welcome-title">{o('welcomeTitle')}</h2>
        <p className="onb-welcome-sub">{o('welcomeSub')}</p>
        <div className="onb-venue-q">{o('venueQ')}</div>
        <div className="onb-venue-grid">
          {VENUES.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`onb-venue ${venue === v.id ? 'active' : ''}`}
              onClick={() => setVenue(v.id)}
            >
              <span className="onb-venue-icon">{v.icon}</span>
              <span>{o(v.key)}</span>
            </button>
          ))}
        </div>
        {hint && <div className="onb-hint">💡 {hint}</div>}
        <div className="onb-welcome-actions">
          <button type="button" className="btn btn-primary" onClick={() => ob.completeWelcome(venue, true)}>
            {o('startSetup')}
          </button>
          <button type="button" className="onb-link-btn" onClick={() => ob.completeWelcome(venue, false)}>
            {o('skipExplore')}
          </button>
        </div>
      </div>
    </div>
  );
};
