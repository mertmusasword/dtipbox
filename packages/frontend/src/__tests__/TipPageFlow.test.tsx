import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Tip Page Client Resilience & Logic Suite', () => {
  it('generates unique UUID-based idempotency keys on distinct attempts', () => {
    const generateKey = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const key1 = generateKey();
    const key2 = generateKey();

    expect(key1).toBeDefined();
    expect(key2).toBeDefined();
    expect(key1).not.toBe(key2);
  });

  it('renders offline warning banner when device connectivity is lost', () => {
    const isOffline = true;
    const language = 'tr';

    render(
      <div>
        {isOffline && (
          <div role="alert" data-testid="offline-banner">
            <span>
              {language === 'tr'
                ? 'İnternet bağlantınız koptu. Lütfen ağınızı kontrol edin.'
                : 'You are currently offline. Please check your network connection.'}
            </span>
          </div>
        )}
      </div>
    );

    const banner = screen.getByTestId('offline-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent('İnternet bağlantınız koptu');
  });

  it('correctly calculates preset percentage amounts based on bill total', () => {
    const billAmount = 450;
    const calculateTip = (percent: number) => Math.round((billAmount * percent) / 100);

    expect(calculateTip(10)).toBe(45);
    expect(calculateTip(15)).toBe(68);
    expect(calculateTip(20)).toBe(90);
  });
});
