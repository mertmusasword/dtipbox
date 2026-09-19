import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { paymentService } from './payment/core/payment.service';
import { PaymentMethodType, PaymentStatus, Prisma } from '@prisma/client';
import { getActivePaymentMethods, getCustomerPaymentMethodsCatalog } from './paymentMethod.service';

interface CreateTipRequest {
  publicToken: string;
  employeeId?: string;
  tableId?: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  customerName?: string;
  customerMessage?: string;
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

  // Record SCAN event asynchronously
  prisma.smartQrEvent.create({
    data: {
      business_id: qr.business_id,
      qr_id: qr.id,
      table_id: qr.table_id,
      event_type: 'SCAN',
    },
  }).catch(() => {});

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
              return JSON.parse(smartConfig.custom_links);
            } catch {
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

  // Anti-duplicate protection: prevent duplicate tip creation if submitted multiple times within 5 seconds
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  const recentDuplicate = await prisma.tip.findFirst({
    where: {
      business_id: qr.business_id,
      employee_id: data.employeeId || null,
      table_id: effectiveTableId,
      amount: new Prisma.Decimal(data.amount),
      payment_method: data.paymentMethod,
      customer_name: data.customerName || null,
      customer_message: data.customerMessage || null,
      created_at: { gte: fiveSecondsAgo },
    },
    orderBy: { created_at: 'desc' },
  });

  if (recentDuplicate) {
    let duplicatePaymentResult: any = {
      transactionId: recentDuplicate.provider_transaction_id || `DUP_${recentDuplicate.id}`,
      status: recentDuplicate.payment_status,
    };
    if (data.paymentMethod === PaymentMethodType.IBAN_TRANSFER) {
      const paymentAccount = await prisma.businessPaymentAccount.findUnique({
        where: { business_id: qr.business_id },
      });
      if (paymentAccount) {
        const referenceCode = `TIP-${recentDuplicate.id.slice(0, 8).toUpperCase()}`;
        duplicatePaymentResult = {
          transactionId: recentDuplicate.provider_transaction_id || `IBAN_${referenceCode}`,
          status: recentDuplicate.payment_status,
          instructions: `Please transfer ${data.amount} ${qr.business.currency} to the following bank account with reference code "${referenceCode}".`,
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
        id: recentDuplicate.id,
        amount: recentDuplicate.amount,
        currency: recentDuplicate.currency,
        payment_method: recentDuplicate.payment_method,
        status: recentDuplicate.payment_status,
        created_at: recentDuplicate.created_at,
      },
      payment: duplicatePaymentResult,
    };
  }

  // Create initial tip entry in PENDING state
  const tip = await prisma.tip.create({
    data: {
      business_id: qr.business_id,
      employee_id: data.employeeId || null,
      table_id: effectiveTableId,
      amount: new Prisma.Decimal(data.amount),
      currency: qr.business.currency,
      payment_method: data.paymentMethod,
      payment_status: PaymentStatus.PENDING,
      customer_name: data.customerName || null,
      customer_message: data.customerMessage || null,
    },
  });

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

  // Record initial tip initiation event (TIP_SUCCESS is recorded upon confirmed webhook/payout)
  const initialEventType = paymentResult.status === PaymentStatus.SUCCESS ? 'TIP_SUCCESS' : 'TIP_INITIATED';
  prisma.smartQrEvent.create({
    data: {
      business_id: qr.business_id,
      qr_id: qr.id,
      table_id: effectiveTableId || null,
      event_type: initialEventType,
      metadata: { amount: data.amount, paymentMethod: data.paymentMethod },
    },
  }).catch(() => {});

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
}
