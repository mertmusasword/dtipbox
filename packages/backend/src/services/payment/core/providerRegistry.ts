import { IPaymentProvider } from './provider.interface';
import { stripeProvider } from '../providers/stripe/stripe.provider';
import { iyzicoProvider } from '../providers/iyzico/iyzico.provider';
import { paytrProvider } from '../providers/paytr/paytr.provider';
import prisma from '../../../utils/prisma';
import { ProviderCatalogStatus, ProviderType } from '@prisma/client';

export interface CredentialFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'password';
  required: boolean;
  placeholder?: string;
  description?: string;
}

export interface CatalogProviderDefinition {
  id: string;
  name: string;
  display_name: string;
  description: string;
  logo_url?: string;
  type: ProviderType;
  status: ProviderCatalogStatus;
  countries: string[];
  supported_currencies: string[];
  capabilities: string[];
  required_credentials: CredentialFieldDefinition[];
  has_adapter: boolean;
  is_global: boolean;
}

/**
 * Standard global payment provider catalog.
 * Only providers with has_adapter: true have real backend execution adapters.
 */
export const GLOBAL_PROVIDER_CATALOG: CatalogProviderDefinition[] = [
  {
    id: 'stripe',
    name: 'stripe',
    display_name: 'Stripe Payments',
    description: 'Global credit cards, debit cards, Apple Pay & Google Pay direct settlement.',
    type: ProviderType.CARD,
    status: ProviderCatalogStatus.ACTIVE,
    countries: ['US', 'CA', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'AU', 'NZ', 'SG', 'JP', 'TR', '*'],
    supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'TRY', 'JPY', 'CHF', 'SGD', 'NZD'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'TEST_CONNECTION', 'WEBHOOK'],
    required_credentials: [
      {
        key: 'publishableKey',
        label: 'Publishable Key',
        type: 'text',
        required: true,
        placeholder: 'pk_live_... or pk_test_...',
        description: 'Public client token from your Stripe dashboard.',
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        required: true,
        placeholder: 'sk_live_... or sk_test_...',
        description: 'Restricted secret API key for backend charge authorization.',
      },
      {
        key: 'webhookSecret',
        label: 'Webhook Signing Secret',
        type: 'password',
        required: false,
        placeholder: 'whsec_...',
        description: 'Required to verify cryptographic signatures of Stripe webhook events.',
      },
    ],
    has_adapter: true,
    is_global: true,
  },
  {
    id: 'square',
    name: 'square',
    display_name: 'Square POS & Online',
    description: 'In-person and online card processing widely adopted in US, Canada, UK, and Australia.',
    type: ProviderType.CARD,
    status: ProviderCatalogStatus.DEVELOPMENT,
    countries: ['US', 'CA', 'GB', 'AU', 'JP', 'IE', 'ES', 'FR'],
    supported_currencies: ['USD', 'CAD', 'GBP', 'AUD', 'JPY', 'EUR'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'REFUND'],
    required_credentials: [
      { key: 'applicationId', label: 'Application ID', type: 'text', required: true, placeholder: 'sq0idp-...' },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'EAAA...' },
      { key: 'locationId', label: 'Location ID', type: 'text', required: true, placeholder: 'L...' },
    ],
    has_adapter: false,
    is_global: false,
  },
  {
    id: 'moneris',
    name: 'moneris',
    display_name: 'Moneris Solutions',
    description: "Canada's leading financial technology and debit/credit payment processor.",
    type: ProviderType.VIRTUAL_POS,
    status: ProviderCatalogStatus.COMING_SOON,
    countries: ['CA'],
    supported_currencies: ['CAD', 'USD'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS'],
    required_credentials: [
      { key: 'storeId', label: 'Store ID', type: 'text', required: true, placeholder: 'moneris01' },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true, placeholder: 'yesguy...' },
      { key: 'checkoutId', label: 'Checkout ID', type: 'text', required: false, placeholder: 'chkt_...' },
    ],
    has_adapter: false,
    is_global: false,
  },
  {
    id: 'iyzico',
    name: 'iyzico',
    display_name: 'iyzico Sanal POS',
    description: 'PayU / iyzico Türkiye sanal POS altyapısı (Troy, Visa, Mastercard yerel ve uluslararası kartlar).',
    type: ProviderType.VIRTUAL_POS,
    status: ProviderCatalogStatus.ACTIVE,
    countries: ['TR'],
    supported_currencies: ['TRY', 'USD', 'EUR', 'GBP'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'TEST_CONNECTION', 'WEBHOOK'],
    required_credentials: [
      { key: 'apiKey', label: 'API Key', type: 'text', required: true, placeholder: 'sandbox-... veya canlı API anahtarınız', description: 'iyzico kontrol panelinden aldığınız API Anahtarı.' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, placeholder: 'sandbox-... veya canlı Gizli anahtarınız', description: 'iyzico kontrol panelinden aldığınız Gizli Anahtar.' },
      { key: 'baseUrl', label: 'API Ortamı / URL', type: 'text', required: false, placeholder: 'https://sandbox-api.iyzipay.com (Boş bırakılırsa anahtara göre otomatik algılanır)', description: 'Test için: https://sandbox-api.iyzipay.com | Canlı için: https://api.iyzipay.com' },
    ],
    has_adapter: true,
    is_global: false,
  },
  {
    id: 'paytr',
    name: 'paytr',
    display_name: 'PayTR Sanal POS',
    description: 'PayTR doğrudan sanal POS altyapısı (Troy, Visa, Mastercard yerel ve uluslararası kartlar).',
    type: ProviderType.VIRTUAL_POS,
    status: ProviderCatalogStatus.ACTIVE,
    countries: ['TR'],
    supported_currencies: ['TRY', 'USD', 'EUR'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'TEST_CONNECTION', 'WEBHOOK'],
    required_credentials: [
      { key: 'merchantId', label: 'Merchant ID (Mağaza No)', type: 'text', required: true, placeholder: '123456 veya sandbox-...', description: 'PayTR mağaza yönetim panelinden aldığınız Mağaza Numarası.' },
      { key: 'merchantKey', label: 'Merchant Key (Mağaza Parolası)', type: 'password', required: true, placeholder: 'Mağaza parolanız', description: 'PayTR mağaza yönetim panelinden aldığınız API Mağaza Parolası.' },
      { key: 'merchantSalt', label: 'Merchant Salt (Gizli Anahtar)', type: 'password', required: true, placeholder: 'Gizli anahtarınız', description: 'PayTR mağaza yönetim panelinden aldığınız Gizli Anahtar.' },
      { key: 'testMode', label: 'Test Modu (1: Test, 0: Canlı)', type: 'text', required: false, placeholder: '1 veya 0 (Boş bırakılırsa anahtara göre algılanır)', description: 'Test işlemleri için 1, gerçek tahsilat için 0 giriniz.' },
    ],
    has_adapter: true,
    is_global: false,
  },
  {
    id: 'adyen',
    name: 'adyen',
    display_name: 'Adyen Global Platform',
    description: 'Enterprise end-to-end global payments infrastructure.',
    type: ProviderType.CARD,
    status: ProviderCatalogStatus.COMING_SOON,
    countries: ['US', 'CA', 'GB', 'EU', 'SG', 'AU', '*'],
    supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'CHF', 'JPY'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'REFUND', 'WEBHOOK'],
    required_credentials: [
      { key: 'merchantAccount', label: 'Merchant Account', type: 'text', required: true, placeholder: 'YourMerchantAccount' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'AQEy...' },
      { key: 'clientKey', label: 'Client Key', type: 'text', required: true, placeholder: 'live_...' },
    ],
    has_adapter: false,
    is_global: true,
  },
  {
    id: 'paypal',
    name: 'paypal',
    display_name: 'PayPal Commerce',
    description: 'Global wallet and card payments for consumers and merchants in 200+ markets.',
    type: ProviderType.WALLET,
    status: ProviderCatalogStatus.COMING_SOON,
    countries: ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'AU', '*'],
    supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'WEBHOOK'],
    required_credentials: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true, placeholder: 'AZ...' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true, placeholder: 'EL...' },
    ],
    has_adapter: false,
    is_global: true,
  },
  {
    id: 'alipay',
    name: 'alipay',
    display_name: 'Alipay Global',
    description: 'Cross-border mobile payments for Chinese and global consumers.',
    type: ProviderType.WALLET,
    status: ProviderCatalogStatus.COMING_SOON,
    countries: ['CN', 'HK', 'SG', 'MY', 'TH', 'JP', 'US', 'GB', 'FR', 'DE', '*'],
    supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'CNY', 'HKD', 'SGD', 'JPY'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'WEBHOOK'],
    required_credentials: [
      { key: 'appId', label: 'App ID', type: 'text', required: true, placeholder: '2021...' },
      { key: 'privateKey', label: 'Merchant Private Key', type: 'password', required: true, placeholder: 'MIIE...' },
      { key: 'alipayPublicKey', label: 'Alipay Public Key', type: 'password', required: true, placeholder: 'MIIB...' },
    ],
    has_adapter: false,
    is_global: true,
  },
  {
    id: 'wechatpay',
    name: 'wechatpay',
    display_name: 'WeChat Pay (微信支付)',
    description: 'Leading mobile payment wallet in China and international travel hubs.',
    type: ProviderType.WALLET,
    status: ProviderCatalogStatus.COMING_SOON,
    countries: ['CN', 'HK', 'SG', 'MY', 'TH', 'JP', 'US', 'GB', 'FR', 'DE', '*'],
    supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'CNY', 'HKD', 'SGD', 'JPY'],
    capabilities: ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'WEBHOOK'],
    required_credentials: [
      { key: 'mchId', label: 'Merchant ID (Mch ID)', type: 'text', required: true, placeholder: '1900...' },
      { key: 'apiV3Key', label: 'API v3 Key', type: 'password', required: true, placeholder: '32-char key' },
      { key: 'serialNo', label: 'Certificate Serial Number', type: 'text', required: true, placeholder: '...' },
    ],
    has_adapter: false,
    is_global: true,
  },
];

export class ProviderRegistry {
  private adapters: Map<string, IPaymentProvider> = new Map();

  constructor() {
    // Register active backend code adapters
    this.registerAdapter('stripe', stripeProvider);
    this.registerAdapter('iyzico', iyzicoProvider);
    this.registerAdapter('paytr', paytrProvider);
  }

  registerAdapter(name: string, adapter: IPaymentProvider) {
    this.adapters.set(name.toLowerCase(), adapter);
  }

  getAdapter(name: string): IPaymentProvider | undefined {
    return this.adapters.get(name.toLowerCase());
  }

  hasAdapter(name: string): boolean {
    return this.adapters.has(name.toLowerCase());
  }

  /**
   * Sync static catalog definitions into PostgreSQL database.
   * Ensures database payment_providers table is always seeded and fresh.
   */
  async syncCatalogToDatabase() {
    try {
      for (const item of GLOBAL_PROVIDER_CATALOG) {
        await prisma.paymentProvider.upsert({
          where: { id: item.id },
          create: {
            id: item.id,
            name: item.name,
            display_name: item.display_name,
            description: item.description,
            logo_url: item.logo_url,
            type: item.type,
            status: item.status,
            countries: item.countries,
            supported_currencies: item.supported_currencies,
            capabilities: item.capabilities,
            required_credentials: item.required_credentials as any,
            has_adapter: item.has_adapter,
            is_global: item.is_global,
          },
          update: {
            display_name: item.display_name,
            description: item.description,
            status: item.status,
            countries: item.countries,
            supported_currencies: item.supported_currencies,
            capabilities: item.capabilities,
            required_credentials: item.required_credentials as any,
            has_adapter: item.has_adapter,
            is_global: item.is_global,
          },
        });
      }
      console.log('[ProviderRegistry] Successfully synchronized global payment provider catalog to database.');
    } catch (err: any) {
      console.error('[ProviderRegistry] Failed to synchronize catalog to database:', err.message);
    }
  }
}

export const providerRegistry = new ProviderRegistry();
