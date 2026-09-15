import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../utils/prisma';
import * as smartQrService from '../services/smartQr.service';

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
});
