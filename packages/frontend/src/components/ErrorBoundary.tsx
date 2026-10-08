import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private isChunkLoadError(error: Error | null): boolean {
    if (!error) return false;
    const msg = error.message || '';
    return (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError'
    );
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);

    if (this.isChunkLoadError(error)) {
      const lastReload = Number(sessionStorage.getItem('naponi_chunk_reload') || '0');
      if (Date.now() - lastReload > 15000) {
        sessionStorage.setItem('naponi_chunk_reload', Date.now().toString());
        window.location.reload();
        return;
      }
    }

    try {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    } catch (_) {}
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunk = this.isChunkLoadError(this.state.error);

      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: isChunk ? 'rgba(99, 102, 241, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isChunk ? 'rgba(99, 102, 241, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isChunk ? '#818cf8' : '#ef4444',
            marginBottom: '1rem',
          }}>
            {isChunk ? <RefreshCw size={28} /> : <AlertTriangle size={28} />}
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {isChunk ? 'Yeni Bir Sürüm Yayınlandı' : 'Bir Hata Oluştu'}
          </h2>

          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {isChunk
              ? 'Naponi yeni bir sürüme güncellendi. En son özelliklere ve sayfalara erişmek için lütfen sayfayı yenileyin.'
              : 'Bu sayfa yüklenirken beklenmedik bir sorun meydana geldi. Lütfen sayfayı yenileyin veya tekrar deneyin.'}
          </p>

          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} />
            <span>{isChunk ? 'Güncelle ve Yenile' : 'Sayfayı Yenile'}</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
