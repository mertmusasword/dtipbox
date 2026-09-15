import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export interface UpdateSmartQrConfigInput {
  is_smart_enabled?: boolean;
  enable_tips?: boolean;
  enable_menu?: boolean;
  enable_wifi?: boolean;
  enable_campaigns?: boolean;
  enable_feedback?: boolean;
  enable_signup?: boolean;
  menu_url?: string | null;
  menu_title?: string | null;
  wifi_ssid?: string | null;
  wifi_password?: string | null;
  wifi_encryption?: string;
  welcome_message?: string | null;
  signup_title?: string | null;
  signup_reward?: string | null;
}

export interface CreateCampaignInput {
  title: string;
  description?: string;
  badge?: string;
  discount_code?: string;
  expires_at?: Date | string | null;
  is_active?: boolean;
}

/**
 * Get or create default Smart QR configuration for a business.
 */
export async function getOrCreateSmartQrConfig(businessId: string) {
  let config = await prisma.smartQrConfig.findUnique({
    where: { business_id: businessId },
  });

  if (!config) {
    config = await prisma.smartQrConfig.create({
      data: {
        business_id: businessId,
        is_smart_enabled: true,
        enable_tips: true,
        enable_menu: false,
        enable_wifi: false,
        enable_campaigns: false,
        enable_feedback: false,
        enable_signup: false,
        wifi_encryption: 'WPA',
      },
    });
  }

  return config;
}

/**
 * Update Smart QR configuration for a business.
 */
export async function updateSmartQrConfig(
  businessId: string,
  input: UpdateSmartQrConfigInput
) {
  // Ensure config exists first
  await getOrCreateSmartQrConfig(businessId);

  return prisma.smartQrConfig.update({
    where: { business_id: businessId },
    data: {
      ...(input.is_smart_enabled !== undefined && { is_smart_enabled: input.is_smart_enabled }),
      ...(input.enable_tips !== undefined && { enable_tips: input.enable_tips }),
      ...(input.enable_menu !== undefined && { enable_menu: input.enable_menu }),
      ...(input.enable_wifi !== undefined && { enable_wifi: input.enable_wifi }),
      ...(input.enable_campaigns !== undefined && { enable_campaigns: input.enable_campaigns }),
      ...(input.enable_feedback !== undefined && { enable_feedback: input.enable_feedback }),
      ...(input.enable_signup !== undefined && { enable_signup: input.enable_signup }),
      ...(input.menu_url !== undefined && { menu_url: input.menu_url?.trim() || null }),
      ...(input.menu_title !== undefined && { menu_title: input.menu_title?.trim() || null }),
      ...(input.wifi_ssid !== undefined && { wifi_ssid: input.wifi_ssid?.trim() || null }),
      ...(input.wifi_password !== undefined && { wifi_password: input.wifi_password?.trim() || null }),
      ...(input.wifi_encryption !== undefined && { wifi_encryption: input.wifi_encryption }),
      ...(input.welcome_message !== undefined && { welcome_message: input.welcome_message?.trim() || null }),
      ...(input.signup_title !== undefined && { signup_title: input.signup_title?.trim() || null }),
      ...(input.signup_reward !== undefined && { signup_reward: input.signup_reward?.trim() || null }),
    },
  });
}

/**
 * List campaigns for a business.
 */
export async function getCampaigns(businessId: string) {
  return prisma.smartQrCampaign.findMany({
    where: { business_id: businessId },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Create a new campaign.
 */
export async function createCampaign(businessId: string, input: CreateCampaignInput) {
  return prisma.smartQrCampaign.create({
    data: {
      business_id: businessId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      badge: input.badge?.trim() || null,
      discount_code: input.discount_code?.trim() || null,
      expires_at: input.expires_at ? new Date(input.expires_at) : null,
      is_active: input.is_active !== undefined ? input.is_active : true,
    },
  });
}

/**
 * Update an existing campaign.
 */
export async function updateCampaign(
  businessId: string,
  campaignId: string,
  input: Partial<CreateCampaignInput>
) {
  const existing = await prisma.smartQrCampaign.findFirst({
    where: { id: campaignId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Campaign not found', 404);
  }

  return prisma.smartQrCampaign.update({
    where: { id: campaignId },
    data: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.badge !== undefined && { badge: input.badge?.trim() || null }),
      ...(input.discount_code !== undefined && { discount_code: input.discount_code?.trim() || null }),
      ...(input.expires_at !== undefined && {
        expires_at: input.expires_at ? new Date(input.expires_at) : null,
      }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    },
  });
}

/**
 * Delete a campaign.
 */
export async function deleteCampaign(businessId: string, campaignId: string) {
  const existing = await prisma.smartQrCampaign.findFirst({
    where: { id: campaignId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Campaign not found', 404);
  }

  await prisma.smartQrCampaign.delete({
    where: { id: campaignId },
  });

  return { success: true };
}

/**
 * Submit customer lead (e.g. email/phone signup with consent).
 */
export async function submitCustomerLead(
  publicToken: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    consent_marketing?: boolean;
    ip_address?: string;
  }
) {
  const qr = await prisma.qrCode.findUnique({
    where: { public_token: publicToken },
  });

  if (!qr || !qr.is_active) {
    throw new AppError('QR code not found or inactive', 404);
  }

  const cleanEmail = data.email?.toLowerCase().trim() || null;
  const cleanPhone = data.phone?.trim() || null;
  const cleanName = data.name?.trim() || null;

  if (!cleanEmail && !cleanPhone) {
    throw new AppError('Please provide either an email or phone number', 400);
  }

  const lead = await prisma.customerLead.create({
    data: {
      business_id: qr.business_id,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      consent_marketing: Boolean(data.consent_marketing),
      consent_at: data.consent_marketing ? new Date() : null,
      ip_address: data.ip_address || null,
    },
  });

  // Track event
  await prisma.smartQrEvent.create({
    data: {
      business_id: qr.business_id,
      qr_id: qr.id,
      table_id: qr.table_id,
      event_type: 'LEAD_SUBMIT',
      metadata: { hasEmail: Boolean(cleanEmail), hasPhone: Boolean(cleanPhone) },
    },
  });

  return lead;
}

/**
 * Record a Smart QR interaction event (real metrics).
 */
export async function recordSmartQrEvent(
  publicToken: string,
  eventType: string,
  metadata?: any
) {
  const qr = await prisma.qrCode.findUnique({
    where: { public_token: publicToken },
  });

  if (!qr) return null;

  return prisma.smartQrEvent.create({
    data: {
      business_id: qr.business_id,
      qr_id: qr.id,
      table_id: qr.table_id,
      event_type: eventType,
      metadata: metadata || undefined,
    },
  });
}

/**
 * Submit independent feedback from Smart QR (with or without a tip).
 */
export async function submitSmartQrFeedback(
  publicToken: string,
  data: { rating: number; comment?: string }
) {
  const qr = await prisma.qrCode.findUnique({
    where: { public_token: publicToken },
  });

  if (!qr || !qr.is_active) {
    throw new AppError('QR code not found', 404);
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  const feedback = await prisma.feedback.create({
    data: {
      business_id: qr.business_id,
      rating: data.rating,
      comment: data.comment?.trim() || null,
    },
  });

  await prisma.smartQrEvent.create({
    data: {
      business_id: qr.business_id,
      qr_id: qr.id,
      table_id: qr.table_id,
      event_type: 'FEEDBACK_SUBMIT',
      metadata: { rating: data.rating },
    },
  });

  return feedback;
}

/**
 * Get Smart QR analytics for business dashboard.
 */
export async function getSmartQrAnalytics(businessId: string) {
  // Aggregate events count by type
  const events = await prisma.smartQrEvent.groupBy({
    by: ['event_type'],
    where: { business_id: businessId },
    _count: { id: true },
  });

  const eventCounts: Record<string, number> = {
    SCAN: 0,
    TIP_CLICK: 0,
    TIP_SUCCESS: 0,
    MENU_CLICK: 0,
    WIFI_CLICK: 0,
    CAMPAIGN_CLICK: 0,
    FEEDBACK_SUBMIT: 0,
    LEAD_SUBMIT: 0,
  };

  events.forEach((e) => {
    eventCounts[e.event_type] = e._count.id;
  });

  const totalLeads = await prisma.customerLead.count({
    where: { business_id: businessId },
  });

  const feedbackAggregate = await prisma.feedback.aggregate({
    where: { business_id: businessId },
    _avg: { rating: true },
    _count: { id: true },
  });

  return {
    metrics: {
      scans: eventCounts.SCAN || 0,
      tipClicks: eventCounts.TIP_CLICK || 0,
      tipsCompleted: eventCounts.TIP_SUCCESS || 0,
      menuClicks: eventCounts.MENU_CLICK || 0,
      wifiClicks: eventCounts.WIFI_CLICK || 0,
      campaignClicks: eventCounts.CAMPAIGN_CLICK || 0,
      feedbackSubmissions: feedbackAggregate._count.id || 0,
      averageRating: feedbackAggregate._avg.rating ? Number(feedbackAggregate._avg.rating.toFixed(1)) : 5.0,
      totalLeads,
    },
  };
}

/**
 * Get leads list for business dashboard.
 */
export async function getCustomerLeads(businessId: string) {
  return prisma.customerLead.findMany({
    where: { business_id: businessId },
    orderBy: { created_at: 'desc' },
  });
}
