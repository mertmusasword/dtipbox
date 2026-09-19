import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../utils/prisma';
import * as smartQrService from '../services/smartQr.service';
import * as tipService from '../services/tip.service';

describe('Naponi Smart QR Integration Service', () => {
  let testBusiness: any;
  let testQr: any;

  beforeAll(async () => {
    // Create test user and business
    const testUser = await prisma.user.create({
      data: {
        email: `smartqr-test-${Date.now()}@naponi.com`,
        password_hash: 'hashedpassword',
        role: 'BUSINESS',
      },
    });

    testBusiness = await prisma.business.create({
      data: {
        owner_user_id: testUser.id,
        name: 'Smart QR Test Cafe',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });

    testQr = await prisma.qrCode.create({
      data: {
        business_id: testBusiness.id,
        public_token: `sqr_${Date.now().toString(36)}`,
      },
    });
  });

  afterAll(async () => {
    if (testBusiness) {
      await prisma.smartQrEvent.deleteMany({ where: { business_id: testBusiness.id } });
      await prisma.customerLead.deleteMany({ where: { business_id: testBusiness.id } });
      await prisma.smartQrCampaign.deleteMany({ where: { business_id: testBusiness.id } });
      await prisma.smartQrConfig.deleteMany({ where: { business_id: testBusiness.id } });
      await prisma.qrCode.deleteMany({ where: { business_id: testBusiness.id } });
      await prisma.business.delete({ where: { id: testBusiness.id } });
      await prisma.user.delete({ where: { id: testBusiness.owner_user_id } });
    }
  });

  it('should initialize default Smart QR configuration with Tips ON and others OFF', async () => {
    const config = await smartQrService.getOrCreateSmartQrConfig(testBusiness.id);

    expect(config).toBeDefined();
    expect(config.business_id).toBe(testBusiness.id);
    expect(config.is_smart_enabled).toBe(true);
    expect(config.enable_tips).toBe(true);
    expect(config.enable_wifi).toBe(false);
    expect(config.enable_campaigns).toBe(false);
    expect(config.enable_feedback).toBe(false);
    expect(config.enable_signup).toBe(false);
    expect(config.wifi_encryption).toBe('WPA');
  });

  it('should update Smart QR config with Wi-Fi and welcome message', async () => {
    const updated = await smartQrService.updateSmartQrConfig(testBusiness.id, {
      enable_wifi: true,
      wifi_ssid: 'Naponi_Guest_WiFi',
      wifi_password: 'SafePassword123',
      enable_campaigns: true,
      welcome_message: 'Hoş Geldiniz!',
    });

    expect(updated.enable_wifi).toBe(true);
    expect(updated.wifi_ssid).toBe('Naponi_Guest_WiFi');
    expect(updated.wifi_password).toBe('SafePassword123');
    expect(updated.enable_campaigns).toBe(true);
    expect(updated.welcome_message).toBe('Hoş Geldiniz!');
  });

  it('should create and list campaigns for business', async () => {
    const campaign = await smartQrService.createCampaign(testBusiness.id, {
      title: 'Cheesecake %20 İndirim',
      description: 'Kahve yanındaki tatlılarda geçerlidir',
      badge: '%20 İNDİRİM',
      discount_code: 'SWEET20',
    });

    expect(campaign.id).toBeDefined();
    expect(campaign.title).toBe('Cheesecake %20 İndirim');
    expect(campaign.badge).toBe('%20 İNDİRİM');

    const campaigns = await smartQrService.getCampaigns(testBusiness.id);
    expect(campaigns.length).toBeGreaterThanOrEqual(1);
    expect(campaigns[0].title).toBe('Cheesecake %20 İndirim');
  });

  it('should collect customer lead with explicit marketing consent', async () => {
    const lead = await smartQrService.submitCustomerLead(testQr.public_token, {
      name: 'Mert Müşteri',
      email: 'musteri@example.com',
      phone: '+905551234567',
      consent_marketing: true,
    });

    expect(lead.id).toBeDefined();
    expect(lead.name).toBe('Mert Müşteri');
    expect(lead.email).toBe('musteri@example.com');
    expect(lead.consent_marketing).toBe(true);
    expect(lead.consent_at).toBeDefined();

    const leads = await smartQrService.getCustomerLeads(testBusiness.id);
    expect(leads.length).toBe(1);
    expect(leads[0].email).toBe('musteri@example.com');
  });

  it('should record real analytics events and provide aggregated report', async () => {
    await smartQrService.recordSmartQrEvent(testQr.public_token, 'SCAN');
    await smartQrService.recordSmartQrEvent(testQr.public_token, 'WIFI_CLICK');
    await smartQrService.recordSmartQrEvent(testQr.public_token, 'TIP_CLICK');

    const analytics = await smartQrService.getSmartQrAnalytics(testBusiness.id);

    expect(analytics.metrics).toBeDefined();
    expect(analytics.metrics.scans).toBeGreaterThanOrEqual(1);
    expect(analytics.metrics.wifiClicks).toBeGreaterThanOrEqual(1);
    expect(analytics.metrics.tipClicks).toBeGreaterThanOrEqual(1);
    expect(analytics.metrics.totalLeads).toBeGreaterThanOrEqual(1);
  });

  it('should update Smart QR config with social media links, normalize handles and phone numbers, and reject dangerous URLs', async () => {
    const updated = await smartQrService.updateSmartQrConfig(testBusiness.id, {
      social_instagram: '@naponicoffee',
      social_facebook: 'https://facebook.com/naponicoffee',
      social_tiktok: '@naponitok',
      social_twitter: 'naponix',
      social_youtube: 'https://youtube.com/@naponichannel',
      social_whatsapp: '+90 555 123 4567',
      social_website: 'naponicafe.com',
    });

    expect(updated.social_instagram).toBe('https://instagram.com/naponicoffee');
    expect(updated.social_facebook).toBe('https://facebook.com/naponicoffee');
    expect(updated.social_tiktok).toBe('https://tiktok.com/@naponitok');
    expect(updated.social_twitter).toBe('https://x.com/naponix');
    expect(updated.social_youtube).toBe('https://youtube.com/@naponichannel');
    expect(updated.social_whatsapp).toBe('https://wa.me/905551234567');
    expect(updated.social_website).toBe('https://naponicafe.com');

    // Reject dangerous protocol
    await expect(
      smartQrService.updateSmartQrConfig(testBusiness.id, {
        social_website: 'javascript:alert("XSS")',
      })
    ).rejects.toThrow('Geçersiz veya tehlikeli');
  });

  it('should serve social links to public customer TipPageDetails and track SOCIAL_CLICK events', async () => {
    const publicDetails = await tipService.getTipPageDetails(testQr.public_token);

    expect(publicDetails).toBeDefined();
    expect(publicDetails.smartQr).toBeDefined();
    expect(publicDetails.smartQr?.socialLinks).toBeDefined();
    expect(publicDetails.smartQr?.socialLinks?.instagram).toBe('https://instagram.com/naponicoffee');
    expect(publicDetails.smartQr?.socialLinks?.whatsapp).toBe('https://wa.me/905551234567');

    // Customer clicks Instagram link
    await smartQrService.recordSmartQrEvent(testQr.public_token, 'SOCIAL_CLICK', {
      platform: 'instagram',
      url: 'https://instagram.com/naponicoffee',
    });

    const analytics = await smartQrService.getSmartQrAnalytics(testBusiness.id);
    expect(analytics.metrics.socialClicks).toBeGreaterThanOrEqual(1);
  });

  it('should enforce strict cross-business isolation for social links', async () => {
    // Create second business
    const user2 = await prisma.user.create({
      data: {
        email: `smartqr-biz2-${Date.now()}@naponi.com`,
        password_hash: 'hashedpassword',
        role: 'BUSINESS',
      },
    });
    const business2 = await prisma.business.create({
      data: {
        owner_user_id: user2.id,
        name: 'Another Cafe',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });

    try {
      const config2 = await smartQrService.getOrCreateSmartQrConfig(business2.id);
      expect(config2.social_instagram).toBeNull();
      expect(config2.social_website).toBeNull();

      // Ensure business 1 config remains unaffected
      const config1 = await smartQrService.getOrCreateSmartQrConfig(testBusiness.id);
      expect(config1.social_instagram).toBe('https://instagram.com/naponicoffee');
    } finally {
      await prisma.smartQrConfig.deleteMany({ where: { business_id: business2.id } });
      await prisma.business.delete({ where: { id: business2.id } });
      await prisma.user.delete({ where: { id: user2.id } });
    }
  });

  it('should save and validate custom links (WeChat, Telegram, TripAdvisor) and serve to public QR', async () => {
    const customLinks = [
      { id: '1', title: 'WeChat', platform: 'wechat', value: '@naponi_kafe' },
      { id: '2', title: 'Telegram Kanalımız', platform: 'telegram', value: '@naponichat' },
      { id: '3', title: 'TripAdvisor', platform: 'tripadvisor', value: 'tripadvisor.com/Restaurant_Review-naponi' },
      { id: '4', title: 'Spotify Listemiz', platform: 'spotify', value: 'https://open.spotify.com/playlist/naponi' },
    ];

    const updated = await smartQrService.updateSmartQrConfig(testBusiness.id, {
      custom_links: customLinks,
    });

    expect(updated.custom_links).toBeDefined();
    const parsed = JSON.parse(updated.custom_links!);
    expect(parsed).toHaveLength(4);
    expect(parsed[0].value).toBe('naponi_kafe'); // @ stripped
    expect(parsed[1].value).toBe('https://t.me/naponichat');
    expect(parsed[2].value).toBe('https://tripadvisor.com/Restaurant_Review-naponi');
    expect(parsed[3].value).toBe('https://open.spotify.com/playlist/naponi');

    // Public QR verification
    const publicDetails = await tipService.getTipPageDetails(testQr.public_token);
    expect(publicDetails.smartQr?.customLinks).toHaveLength(4);
    expect(publicDetails.smartQr?.customLinks?.[0].platform).toBe('wechat');
    expect(publicDetails.smartQr?.customLinks?.[0].value).toBe('naponi_kafe');
  });

  it('should block dangerous schemes in custom links and enforce max 6 limit', async () => {
    await expect(
      smartQrService.updateSmartQrConfig(testBusiness.id, {
        custom_links: [
          { id: '1', title: 'Zararlı', platform: 'custom', value: 'javascript:alert("pwned")' },
        ],
      })
    ).rejects.toThrow('Geçersiz veya tehlikeli');

    // Test max 6 limit
    const eightLinks = Array.from({ length: 8 }, (_, i) => ({
      id: `${i}`,
      title: `Link ${i}`,
      platform: 'custom',
      value: `https://site${i}.com`,
    }));
    const updated = await smartQrService.updateSmartQrConfig(testBusiness.id, {
      custom_links: eightLinks,
    });
    const parsed = JSON.parse(updated.custom_links!);
    expect(parsed).toHaveLength(6);
  });
});
