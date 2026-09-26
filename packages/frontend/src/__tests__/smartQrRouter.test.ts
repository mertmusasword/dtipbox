import { describe, it, expect } from 'vitest';

export interface SmartQrConfigInput {
  isSmartEnabled?: boolean;
  enableTips?: boolean;
  enableMenu?: boolean;
  menuMode?: string;
  hasNativeMenu?: boolean;
  primaryAction?: 'TIP' | 'MENU';
  enableWifi?: boolean;
  enableCampaigns?: boolean;
  enableFeedback?: boolean;
  enableSignup?: boolean;
}

export function resolveSmartQrNavigation(
  sq: SmartQrConfigInput | undefined,
  publicToken: string,
  searchParams: URLSearchParams
): { action: 'REDIRECT_MENU'; url: string } | { action: 'ACTIVE_TAB'; tab: string } | { action: 'STAY_TIPPING' } {
  if (!sq?.isSmartEnabled) {
    return { action: 'STAY_TIPPING' };
  }

  const forceTipView = searchParams.get('view') === 'tip';
  const isNativeMenu = sq?.menuMode === 'NATIVE' || sq?.hasNativeMenu;

  if (!forceTipView && isNativeMenu && sq?.enableMenu) {
    if (sq.primaryAction === 'MENU' || sq.enableTips === false) {
      const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return { action: 'REDIRECT_MENU', url: `/menu/${publicToken}${searchStr}` };
    }
  }

  if (sq.enableTips === false) {
    if (sq.enableWifi) return { action: 'ACTIVE_TAB', tab: 'wifi' };
    if (sq.enableCampaigns) return { action: 'ACTIVE_TAB', tab: 'campaigns' };
    if (sq.enableFeedback) return { action: 'ACTIVE_TAB', tab: 'feedback' };
    if (sq.enableSignup) return { action: 'ACTIVE_TAB', tab: 'signup' };
  }

  return { action: 'STAY_TIPPING' };
}

describe('Smart QR Routing & Redirection State Machine', () => {
  const token = 'tok_cafe_table_12';

  it('redirects to native menu when primaryAction is MENU and menu is enabled', () => {
    const sq: SmartQrConfigInput = {
      isSmartEnabled: true,
      enableMenu: true,
      menuMode: 'NATIVE',
      primaryAction: 'MENU',
      enableTips: true,
    };
    const res = resolveSmartQrNavigation(sq, token, new URLSearchParams());
    expect(res).toEqual({
      action: 'REDIRECT_MENU',
      url: `/menu/${token}`,
    });
  });

  it('bypasses menu redirect and stays on tipping when query param ?view=tip is provided', () => {
    const sq: SmartQrConfigInput = {
      isSmartEnabled: true,
      enableMenu: true,
      menuMode: 'NATIVE',
      primaryAction: 'MENU',
      enableTips: true,
    };
    const search = new URLSearchParams('view=tip&ref=bill');
    const res = resolveSmartQrNavigation(sq, token, search);
    expect(res).toEqual({ action: 'STAY_TIPPING' });
  });

  it('redirects to menu when tips are explicitly disabled by merchant (enableTips === false)', () => {
    const sq: SmartQrConfigInput = {
      isSmartEnabled: true,
      enableMenu: true,
      menuMode: 'NATIVE',
      primaryAction: 'TIP',
      enableTips: false,
    };
    const res = resolveSmartQrNavigation(sq, token, new URLSearchParams());
    expect(res).toEqual({
      action: 'REDIRECT_MENU',
      url: `/menu/${token}`,
    });
  });

  it('falls back to active Wi-Fi tab when tips and menu are disabled but Wi-Fi is enabled', () => {
    const sq: SmartQrConfigInput = {
      isSmartEnabled: true,
      enableTips: false,
      enableMenu: false,
      enableWifi: true,
    };
    const res = resolveSmartQrNavigation(sq, token, new URLSearchParams());
    expect(res).toEqual({ action: 'ACTIVE_TAB', tab: 'wifi' });
  });

  it('falls back to feedback tab when tips, menu, and wifi are disabled but feedback is enabled', () => {
    const sq: SmartQrConfigInput = {
      isSmartEnabled: true,
      enableTips: false,
      enableMenu: false,
      enableWifi: false,
      enableFeedback: true,
    };
    const res = resolveSmartQrNavigation(sq, token, new URLSearchParams());
    expect(res).toEqual({ action: 'ACTIVE_TAB', tab: 'feedback' });
  });

  it('stays on standard tipping page when isSmartEnabled is false', () => {
    const sq: SmartQrConfigInput = {
      isSmartEnabled: false,
      enableTips: true,
      primaryAction: 'MENU',
    };
    const res = resolveSmartQrNavigation(sq, token, new URLSearchParams());
    expect(res).toEqual({ action: 'STAY_TIPPING' });
  });
});
