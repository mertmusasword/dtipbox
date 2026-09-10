import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We couldn\'t load this data. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <AlertTriangle size={26} />
      </div>
      <div className="error-state-title">{title}</div>
      <div className="error-state-desc">{message}</div>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
};
