import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './styles/index.css';

const SENTRY_DSN =
  (import.meta as any).env?.VITE_SENTRY_DSN ||
  'https://e26ae0bcac487c16f7830d2c92bc0491@o4512186065092608.ingest.de.sentry.io/4512186076823632';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: (import.meta as any).env?.PROD ? 0.1 : 1.0,
    environment: (import.meta as any).env?.MODE || 'production',
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      'NetworkError when attempting to fetch resource',
      'AbortError',
      'Failed to fetch dynamically imported module',
      'Importing a module script failed',
      'error loading dynamically imported module',
      'Unable to preload CSS',
      'ChunkLoadError',
    ],
  });
}

// Auto-reload when Vite fails to load a dynamic chunk (e.g. after a new production deployment)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Vite] Preload error detected, reloading to fetch latest bundle...', event);
    const lastReload = Number(sessionStorage.getItem('naponi_chunk_reload') || '0');
    if (Date.now() - lastReload > 15000) {
      sessionStorage.setItem('naponi_chunk_reload', Date.now().toString());
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Progressive Web App (PWA) Service Worker
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New content available; please refresh.');
              }
            };
          }
        };
      })
      .catch((error) => {
        console.warn('[PWA] ServiceWorker registration failed:', error);
      });
  });
}
