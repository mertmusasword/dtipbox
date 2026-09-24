import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { paymentService } from './payment/core/payment.service';
import { PaymentMethodType, PaymentStatus, Prisma } from '@prisma/client';
import { getActivePaymentMethods, getCustomerPaymentMethodsCatalog } from './paymentMethod.service';
import { logger } from '../utils/logger';
import { eventBuffer } from '../utils/eventBuffer';

// Concurrency lock for in-flight requests with the same idempotency key
const inFlightTipCreations = new Map<string, Promise<any>>();

function sanitizeText(input?: string): string | undefined {
  if (!input) return undefined;
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 500);
}

interface CreateTipRequest {
  publicToken: string;
  employeeId?: string;
  tableId?: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  customerName?: string;
  customerMessage?: string;
  idempotencyKey?: string;
}

export async function getTipPageDetails(publicToken: string) {
  const qr = await prisma.qrCode.findUnique({
    where: { public_token: publicToken },
    include: {
      business: {
        include: {
          payment_account: {
            select: {
              account_holder_name: true,
              bank_name: true,
              iban: true,
              country: true,
            },
          },
          smart_qr_config: true,
          smart_qr_campaigns: {
            where: { is_active: true },
            orderBy: { created_at: 'desc' },
          },
        },
      },
      table: true,
    },
  });

  if (!qr || !qr.is_active) {
    throw new AppError('QR code not found or inactive', 404);
  }

  if (!qr.business.is_active) {
    throw new AppError('This business is currently not accepting tips', 403);
  }

  // Fetch active employees
  const employees = await prisma.employee.findMany({
    where: {
      business_id: qr.business_id,
      is_active: true,
      deleted_at: null,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      position: true,
      avatar: true,
    },
    orderBy: { first_name: 'asc' },
  });

  // Determine available payment methods dynamically based on business configuration
  const hasExternalPayment = Boolean(
    qr.business.external_payment_url &&
    qr.business.external_payment_url.trim().startsWith('https://')
  );
  const hasIbanPayment = Boolean(
    qr.business.payment_account?.iban &&
    qr.business.payment_account.iban.trim().length > 0
  );

  const availableMethods: { type: PaymentMethodType; provider?: string | null; label: string }[] = [];
  if (hasExternalPayment) {
    availableMethods.push({
      type: PaymentMethodType.CARD,
      provider: 'external_link',
      label: 'Güvenli Ödeme Sayfası',
    });
  }
  if (hasIbanPayment) {
    availableMethods.push({
      type: PaymentMethodType.IBAN_TRANSFER,
      provider: 'iban',
      label: 'Doğrudan Banka Transferi',
    });
  }
  const hasAnyPaymentMethod = availableMethods.length > 0;

  // Suggested preset tip amounts depending on currency
  const currencyPresets: Record<string, number[]> = {
    TRY: [50, 100, 200, 500],
    USD: [3, 5, 10, 20],
    EUR: [3, 5, 10, 20],
    GBP: [3, 5, 10, 20],
  };
  const presets = currencyPresets[qr.business.currency.toUpperCase()] || [5, 10, 20, 50];

  // Record SCAN event asynchronously via in-memory batch buffer
  eventBuffer.queueSmartQrEvent({
    business_id: qr.business_id,
    qr_id: qr.id,
    table_id: qr.table_id,
    event_type: 'SCAN',
  });

  const smartConfig = qr.business.smart_qr_config;

  return {
    qrCode: {
      id: qr.id,
      type: qr.type,
      publicToken: qr.public_token,
    },
    business: {
      id: qr.business.id,
      name: qr.business.name,
      logo: qr.business.logo,
      country: qr.business.country,
      currency: qr.business.currency,
      description: qr.business.description,
    },
    table: qr.table ? { id: qr.table.id, name: qr.table.name } : null,
    employees,
    activePaymentMethods: availableMethods,
    paymentOptions: {
      hasExternalPayment,
      externalPaymentUrl: hasExternalPayment ? qr.business.external_payment_url : null,
      hasIbanPayment,
      ibanDetails: hasIbanPayment ? {
        accountHolderName: qr.business.payment_account!.account_holder_name,
        bankName: qr.business.payment_account!.bank_name,
        iban: qr.business.payment_account!.iban,
        country: qr.business.payment_account!.country,
      } : null,
      hasAnyPaymentMethod,
    },
    paymentMethodsCatalog: availableMethods,
    presetAmounts: presets,
    hasAvailablePaymentMethod: hasAnyPaymentMethod,
    smartQr: smartConfig
      ? {
          isSmartEnabled: smartConfig.is_smart_enabled,
          enableTips: smartConfig.enable_tips,
          enableMenu: smartConfig.enable_menu,
          menuMode: (smartConfig.menu_mode as string) || (smartConfig.enable_menu ? 'EXTERNAL_URL' : 'DISABLED'),
          primaryAction: (smartConfig.primary_action as string) || 'TIP',
          menuUrl: smartConfig.menu_url,
          menuTitle: smartConfig.menu_title,
          menuTheme: (smartConfig.menu_theme as any) || 'DARK_LUXURY',
          menu_theme: (smartConfig.menu_theme as any) || 'DARK_LUXURY',
          menuCoverImage: smartConfig.menu_cover_image || null,
          menu_cover_image: smartConfig.menu_cover_image || null,
          menuCoverPosition: (smartConfig as any).menu_cover_position ?? 50,
          menu_cover_position: (smartConfig as any).menu_cover_position ?? 50,
          enableItemStories: smartConfig.enable_item_stories ?? true,
          enable_item_stories: smartConfig.enable_item_stories ?? true,
          enableWifi: smartConfig.enable_wifi,
          wifiSsid: smartConfig.wifi_ssid,
          wifiPassword: smartConfig.wifi_password,
          wifiEncryption: smartConfig.wifi_encryption,
          enableCampaigns: smartConfig.enable_campaigns,
          enableFeedback: smartConfig.enable_feedback,
          googleReviewUrl: smartConfig.google_review_url,
          socialInstagram: smartConfig.social_instagram,
          socialFacebook: smartConfig.social_facebook,
          socialTiktok: smartConfig.social_tiktok,
          socialTwitter: smartConfig.social_twitter,
          socialYoutube: smartConfig.social_youtube,
          socialWhatsapp: smartConfig.social_whatsapp,
          socialWebsite: smartConfig.social_website,
          socialLinks: {
            instagram: smartConfig.social_instagram || null,
            facebook: smartConfig.social_facebook || null,
            tiktok: smartConfig.social_tiktok || null,
            twitter: smartConfig.social_twitter || null,
            youtube: smartConfig.social_youtube || null,
            whatsapp: smartConfig.social_whatsapp || null,
            website: smartConfig.social_website || null,
          },
          customLinks: (() => {
            if (!smartConfig.custom_links) return [];
            try {
              const parsed = typeof smartConfig.custom_links === 'string'
                ? JSON.parse(smartConfig.custom_links)
                : smartConfig.custom_links;
              return Array.isArray(parsed) ? parsed : [];
            } catch (err) {
              logger.warn('Failed to parse custom_links JSON', 'TIP_SERVICE', { error: String(err) });
              return [];
            }
          })(),
          enableSignup: smartConfig.enable_signup,
          signupTitle: smartConfig.signup_title,
          signupReward: smartConfig.signup_reward,
          welcomeMessage: smartConfig.welcome_message,
          campaigns: (qr.business.smart_qr_campaigns || []).map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            badge: c.badge,
            discountCode: c.discount_code,
            expiresAt: c.expires_at,
          })),
        }
      : {
          isSmartEnabled: true,
          enableTips: true,
          enableMenu: false,
          menuMode: 'DISABLED',
          primaryAction: 'TIP',
          menuUrl: null,
          menuTitle: null,
          enableWifi: false,
          enableCampaigns: false,
          enableFeedback: false,
          googleReviewUrl: null,
          socialInstagram: null,
          socialFacebook: null,
          socialTiktok: null,
          socialTwitter: null,
          socialYoutube: null,
          socialWhatsapp: null,
          socialWebsite: null,
          socialLinks: {
            instagram: null,
            facebook: null,
            tiktok: null,
            twitter: null,
            youtube: null,
            whatsapp: null,
            website: null,
          },
          customLinks: [],
          enableSignup: false,
          campaigns: [],
        },
  };
}

export async function createTip(data: CreateTipRequest) {
  if (!data.amount || data.amount <= 0) {
    throw new AppError('Tip amount must be greater than zero', 400);
  }

  const qr = await prisma.qrCode.findUnique({
    where: { public_token: data.publicToken },
    include: { business: true },
  });

  if (!qr || !qr.is_active || !qr.business.is_active) {
    throw new AppError('Invalid or inactive QR code', 404);
  }

  // Validate employee belongs to business if supplied
  if (data.employeeId) {
    const emp = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        business_id: qr.business_id,
        is_active: true,
        deleted_at: null,
      },
    });
    if (!emp) {
      throw new AppError('Selected employee is invalid or no longer active', 400);
    }
  }

  // Validate table belongs to business if supplied
  if (data.tableId) {
    const tbl = await prisma.table.findFirst({
      where: {
        id: data.tableId,
        business_id: qr.business_id,
        is_active: true,
      },
    });
    if (!tbl) {
      throw new AppError('Selected table is invalid or no longer active', 400);
    }
  }

  // Determine effective table ID (either from QR or from customer selection)
  const effectiveTableId = qr.table_id || data.tableId || null;

  // Check payment method availability dynamically based on business configuration
  const hasExternalPayment = Boolean(
    qr.business.external_payment_url &&
    qr.business.external_payment_url.trim().startsWith('https://')
  );
  const paymentAccount = await prisma.businessPaymentAccount.findUnique({
    where: { business_id: qr.business_id },
  });
  const hasIbanPayment = Boolean(paymentAccount?.iban && paymentAccount.iban.trim().length > 0);

  if (data.paymentMethod === PaymentMethodType.IBAN_TRANSFER) {
    if (!hasIbanPayment) {
      throw new AppError('Doğrudan banka transferi (IBAN) bu işletme için henüz yapılandırılmamış.', 400);
    }
  } else {
    if (!hasExternalPayment) {
      throw new AppError('Güvenli harici ödeme bağlantısı bu işletme için henüz yapılandırılmamış.', 400);
    }
  }

  const cleanName = sanitizeText(data.customerName);
  const cleanMessage = sanitizeText(data.customerMessage);

  // 1. Idempotency Check & In-Flight Concurrency Lock
  if (data.idempotencyKey) {
    const existingInFlight = inFlightTipCreations.get(data.idempotencyKey);
    if (existingInFlight) {
      return await existingInFlight;
    }

    const existingTip = await prisma.tip.findUnique({
      where: { idempotency_key: data.idempotencyKey },
      include: { business: { include: { payment_account: true } } },
    });

    if (existingTip) {
      return buildTipResponse(existingTip, data.paymentMethod, qr);
    }
  }

  // Helper to execute tip creation safely
  const executeTipCreation = async () => {
    // Anti-duplicate protection: fallback check if submitted within 5 seconds without key
    if (!data.idempotencyKey) {
      const fiveSecondsAgo = new Date(Date.now() - 5000);
      const recentDuplicate = await prisma.tip.findFirst({
        where: {
          business_id: qr.business_id,
          employee_id: data.employeeId || null,
          table_id: effectiveTableId,
          amount: new Prisma.Decimal(data.amount),
          payment_method: data.paymentMethod,
          customer_name: cleanName || null,
          customer_message: cleanMessage || null,
          created_at: { gte: fiveSecondsAgo },
        },
        orderBy: { created_at: 'desc' },
      });

      if (recentDuplicate) {
        return buildTipResponse(recentDuplicate, data.paymentMethod, qr);
      }
    }

    let tip: any;
    try {
      tip = await prisma.tip.create({
        data: {
          business_id: qr.business_id,
          employee_id: data.employeeId || null,
          table_id: effectiveTableId,
          amount: new Prisma.Decimal(data.amount),
          currency: qr.business.currency,
          payment_method: data.paymentMethod,
          payment_status: PaymentStatus.PENDING,
          customer_name: cleanName || null,
          customer_message: cleanMessage || null,
          idempotency_key: data.idempotencyKey || null,
        },
      });
    } catch (err: any) {
      // If unique constraint violation occurs concurrently on idempotency_key
      if (err.code === 'P2002' && data.idempotencyKey) {
        const raceTip = await prisma.tip.findUnique({
          where: { idempotency_key: data.idempotencyKey },
          include: { business: { include: { payment_account: true } } },
        });
        if (raceTip) {
          return buildTipResponse(raceTip, data.paymentMethod, qr);
        }
      }
      throw err;
    }

    // Process through payment orchestrator
    const paymentResult = await paymentService.processPayment({
      tipId: tip.id,
      businessId: qr.business_id,
      amount: data.amount,
      currency: qr.business.currency,
      paymentMethodType: data.paymentMethod,
      metadata: {
        employeeId: data.employeeId || '',
        tableId: effectiveTableId || '',
      },
    });

    // Record initial tip initiation event via batch eventBuffer
    const initialEventType = paymentResult.status === PaymentStatus.SUCCESS ? 'TIP_SUCCESS' : 'TIP_INITIATED';
    eventBuffer.queueSmartQrEvent({
      business_id: qr.business_id,
      qr_id: qr.id,
      table_id: effectiveTableId || null,
      event_type: initialEventType,
      metadata: { amount: data.amount, paymentMethod: data.paymentMethod },
    });

    return {
      tip: {
        id: tip.id,
        amount: tip.amount,
        currency: tip.currency,
        payment_method: tip.payment_method,
        status: paymentResult.status,
        created_at: tip.created_at,
      },
      payment: paymentResult,
    };
  };

  if (data.idempotencyKey) {
    const promise = executeTipCreation();
    inFlightTipCreations.set(data.idempotencyKey, promise);
    try {
      return await promise;
    } finally {
      inFlightTipCreations.delete(data.idempotencyKey);
    }
  }

  return await executeTipCreation();
}

async function buildTipResponse(tipRecord: any, paymentMethod: PaymentMethodType, qr: any) {
  let paymentResult: any = {
    transactionId: tipRecord.provider_transaction_id || `DUP_${tipRecord.id}`,
    status: tipRecord.payment_status,
  };

  if (paymentMethod === PaymentMethodType.IBAN_TRANSFER) {
    const paymentAccount = await prisma.businessPaymentAccount.findUnique({
      where: { business_id: qr.business_id },
    });
    if (paymentAccount) {
      const referenceCode = `TIP-${tipRecord.id.slice(0, 8).toUpperCase()}`;
      paymentResult = {
        transactionId: tipRecord.provider_transaction_id || `IBAN_${referenceCode}`,
        status: tipRecord.payment_status,
        instructions: `Please transfer ${tipRecord.amount} ${qr.business.currency} to the following bank account with reference code "${referenceCode}".`,
        ibanDetails: {
          accountHolderName: paymentAccount.account_holder_name,
          iban: paymentAccount.iban,
          bankName: paymentAccount.bank_name,
          swiftBic: paymentAccount.swift_bic,
          referenceCode,
        },
      };
    }
  }

  return {
    tip: {
      id: tipRecord.id,
      amount: tipRecord.amount,
      currency: tipRecord.currency,
      payment_method: tipRecord.payment_method,
      status: tipRecord.payment_status,
      created_at: tipRecord.created_at,
    },
    payment: paymentResult,
  };
}
