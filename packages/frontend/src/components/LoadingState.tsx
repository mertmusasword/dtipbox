import React from 'react';

interface LoadingStateProps {
  message?: string;
  compact?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...', compact }) => {
  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', justifyContent: 'center' }}>
        <div className="spinner spinner-sm" />
        <span className="loading-text" style={{ fontSize: '0.85rem' }}>{message}</span>
      </div>
    );
  }

  return (
    <div className="loading-wrapper">
      <div className="spinner" />
      <div className="loading-text">{message}</div>
    </div>
  );
};

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="metrics-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '10px', marginBottom: '0.75rem' }} />
        <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton skeleton-line" style={{ width: '40%', height: '20px' }} />
      </div>
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="glass-card">
    <div style={{ marginBottom: '1rem' }}>
      <div className="skeleton skeleton-line" style={{ width: '30%' }} />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="skeleton skeleton-line" style={{ flex: 1, marginBottom: 0 }} />
        ))}
      </div>
    ))}
  </div>
);
