import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA4, trackPageView } from './ga4';

export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  // Initialize GA4 once on startup
  useEffect(() => {
    initGA4();
  }, []);

  // Track page views on route changes (SPA)
  useEffect(() => {
    const fullPath = location.pathname + location.search;
    trackPageView(fullPath, document.title);
  }, [location.pathname, location.search]);

  return null;
};
