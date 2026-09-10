import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, subtitle, trend }) => {
  return (
    <div className="glass-card glass-card-interactive metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
        {trend && (
          <div
            className="metric-subtitle"
            style={{ color: trend.positive ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};
