import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, subtitle }) => {
  return (
    <div className="glass-card metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
