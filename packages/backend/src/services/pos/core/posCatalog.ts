/**
 * Global POS Integration Catalog Definitions
 * Multi-country directory of restaurant, hospitality, and cloud POS systems.
 */

export interface PosCredentialField {
  key: string;
  label: string;
  type: 'text' | 'password';
  required: boolean;
  placeholder?: string;
  description?: string;
}

export interface PosCatalogItem {
  id: string;
  name: string;
  display_name: string;
  description: string;
  region_label: string;
  countries: string[]; // ISO 3166-1 alpha-2 or ['*'] for global
  supported_currencies: string[];
  capabilities: string[];
  required_credentials: PosCredentialField[];
  status: 'ACTIVE' | 'COMING_SOON';
  has_adapter: boolean;
  is_global: boolean;
  logo_badge: string; // Color identifier or symbol
}

export const GLOBAL_POS_CATALOG: PosCatalogItem[] = [
  // 1. Sandbox Test Provider (Functional Live Adapter for Architecture Verification & Demo)
  {
    id: 'mock_pos',
    name: 'mock_pos',
    display_name: 'Naponi POS Sandbox (Test Engine)',
    description: 'Fully functional sandbox POS engine to test branch mapping, employee syncing, and tip data flow.',
    region_label: 'Global Test Environment',
    countries: ['*'],
    supported_currencies: ['USD', 'EUR', 'GBP', 'TRY', 'CAD', 'AUD', 'AED', 'SAR', 'BRL', 'IDR', 'JPY', 'CNY'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC', 'TEST_CONNECTION'],
    required_credentials: [
      {
        key: 'apiKey',
        label: 'Sandbox API Key',
        type: 'text',
        required: true,
        placeholder: 'sandbox_test_key_123',
        description: 'Enter any test key or leave default to connect instantly.',
      },
      {
        key: 'locationId',
        label: 'Location / Branch Identifier',
        type: 'text',
        required: false,
        placeholder: 'main-dining-room',
        description: 'Optional store or branch identifier.',
      },
    ],
    status: 'ACTIVE',
    has_adapter: true,
    is_global: true,
    logo_badge: '#6366f1',
  },

  // 2. United States & North America
  {
    id: 'toast',
    name: 'toast',
    display_name: 'Toast POS',
    description: 'All-in-one restaurant management and cloud POS system widely used across North America.',
    region_label: 'United States & Canada',
    countries: ['US', 'CA'],
    supported_currencies: ['USD', 'CAD'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'clientId', label: 'Toast Client ID', type: 'text', required: true, placeholder: 'Client ID from Toast Developer Portal' },
      { key: 'clientSecret', label: 'Toast Client Secret', type: 'password', required: true, placeholder: '••••••••••••••••' },
      { key: 'restaurantId', label: 'Restaurant GUID', type: 'text', required: true, placeholder: 'Toast Restaurant GUID' },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#f97316',
  },
  {
    id: 'square_pos',
    name: 'square_pos',
    display_name: 'Square for Restaurants',
    description: 'Popular point-of-sale platform used by independent cafes, bars, and restaurants globally.',
    region_label: 'US, UK, Canada, Australia, Japan',
    countries: ['US', 'CA', 'GB', 'AU', 'JP', 'ES', 'FR', 'IE'],
    supported_currencies: ['USD', 'CAD', 'GBP', 'AUD', 'JPY', 'EUR'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'accessToken', label: 'Square Access Token', type: 'password', required: true, placeholder: 'EAAAE...' },
      { key: 'locationId', label: 'Square Location ID', type: 'text', required: true, placeholder: 'L...' },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#10b981',
  },
  {
    id: 'clover',
    name: 'clover',
    display_name: 'Clover POS',
    description: 'Cloud-based Android POS hardware and software ecosystem powered by Fiserv.',
    region_label: 'US, Canada, UK, Germany',
    countries: ['US', 'CA', 'GB', 'DE'],
    supported_currencies: ['USD', 'CAD', 'GBP', 'EUR'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'merchantId', label: 'Clover Merchant ID', type: 'text', required: true, placeholder: 'MID' },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true, placeholder: '••••••••' },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#22c55e',
  },
  {
    id: 'touchbistro',
    name: 'touchbistro',
    display_name: 'TouchBistro',
    description: 'iPad restaurant POS and management system popular in Canada and the United States.',
    region_label: 'Canada & United States',
    countries: ['CA', 'US'],
    supported_currencies: ['CAD', 'USD'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'venueId', label: 'Venue ID', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#0ea5e9',
  },

  // 3. United Kingdom & Europe
  {
    id: 'lightspeed',
    name: 'lightspeed',
    display_name: 'Lightspeed Restaurant (K-Series)',
    description: 'Advanced hospitality cloud POS widely deployed across the UK, Europe, Australia, and North America.',
    region_label: 'UK, Europe, Australia, North America',
    countries: ['GB', 'DE', 'FR', 'NL', 'BE', 'ES', 'IT', 'CH', 'AU', 'NZ', 'US', 'CA'],
    supported_currencies: ['GBP', 'EUR', 'CHF', 'AUD', 'USD', 'CAD'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'apiToken', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'businessLocationId', label: 'Business Location ID', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#ef4444',
  },
  {
    id: 'sumup_pos',
    name: 'sumup_pos',
    display_name: 'SumUp POS & Tiller',
    description: 'Simple and flexible cloud POS solutions for European cafes, bistros, and small restaurants.',
    region_label: 'United Kingdom, France, Germany, Spain',
    countries: ['GB', 'FR', 'DE', 'ES', 'IT', 'CH', 'AT'],
    supported_currencies: ['GBP', 'EUR', 'CHF'],
    capabilities: ['GET_LOCATIONS', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'apiKey', label: 'SumUp API Key', type: 'password', required: true },
      { key: 'merchantCode', label: 'Merchant Code', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#0284c7',
  },
  {
    id: 'vectron',
    name: 'vectron',
    display_name: 'Vectron POS (Germany & DACH)',
    description: 'Leading certified fiscal POS systems in Germany and Austria complying with KassenSichV and TSE.',
    region_label: 'Germany, Austria, Switzerland',
    countries: ['DE', 'AT', 'CH'],
    supported_currencies: ['EUR', 'CHF'],
    capabilities: ['GET_LOCATIONS', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'cloudApiKey', label: 'Vectron Cloud API Key', type: 'password', required: true },
      { key: 'branchId', label: 'Filial ID', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#eab308',
  },

  // 4. Gulf / Middle East (UAE, Saudi Arabia, Qatar)
  {
    id: 'foodics',
    name: 'foodics',
    display_name: 'Foodics Cloud POS',
    description: 'Leading cloud-based restaurant management and POS ecosystem across the GCC and MENA region.',
    region_label: 'UAE, Saudi Arabia, Qatar, Kuwait, Egypt',
    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'EG'],
    supported_currencies: ['AED', 'SAR', 'QAR', 'KWD', 'USD', 'EGP'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'foodicsToken', label: 'Foodics API Access Token', type: 'password', required: true },
      { key: 'businessId', label: 'Foodics Business Reference', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#8b5cf6',
  },

  // 5. Turkey
  {
    id: 'simpra',
    name: 'simpra',
    display_name: 'Simpra POS',
    description: 'Bulut tabanlı modern restoran, kafe ve otel adisyon yönetim sistemi.',
    region_label: 'Türkiye',
    countries: ['TR'],
    supported_currencies: ['TRY', 'USD', 'EUR'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'apiKey', label: 'Simpra Entegrasyon Anahtarı', type: 'password', required: true },
      { key: 'branchCode', label: 'Şube Kodu', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#3b82f6',
  },
  {
    id: 'sambapos',
    name: 'sambapos',
    display_name: 'SambaPOS',
    description: 'Türkiye ve dünya genelinde yaygın kullanılan esnek restoran ve adisyon otomasyonu.',
    region_label: 'Türkiye & Global',
    countries: ['TR', '*'],
    supported_currencies: ['TRY', 'USD', 'EUR'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'sambaposUrl', label: 'GraphQL Sunucu Adresi', type: 'text', required: true, placeholder: 'http://kasa.yerel:9000/graphql' },
      { key: 'apiKey', label: 'Erişim Belirteci (Token)', type: 'password', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#ec4899',
  },
  {
    id: 'menulux',
    name: 'menulux',
    display_name: 'Menulux POS',
    description: 'Restoran ve kafeler için bulut tabanlı tablet ve masaüstü adisyon sistemi.',
    region_label: 'Türkiye',
    countries: ['TR'],
    supported_currencies: ['TRY', 'USD', 'EUR'],
    capabilities: ['GET_LOCATIONS', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'apiKey', label: 'API Anahtarı', type: 'password', required: true },
      { key: 'storeId', label: 'İşletme Mağaza No', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#14b8a6',
  },

  // 6. Asia & Pacific (Indonesia/Bali, Japan, China)
  {
    id: 'moka_pos',
    name: 'moka_pos',
    display_name: 'Moka POS (Gojek / GoTo)',
    description: 'Indonesia\'s #1 cloud POS, trusted by thousands of cafes, beach clubs, and hotels in Bali and Jakarta.',
    region_label: 'Indonesia (Bali & Jakarta)',
    countries: ['ID'],
    supported_currencies: ['IDR', 'USD'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'apiSecret', label: 'Moka Secret Key', type: 'password', required: true },
      { key: 'outletId', label: 'Outlet ID', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#059669',
  },
  {
    id: 'smaregi',
    name: 'smaregi',
    display_name: 'Smaregi (スマレジ) Japan',
    description: 'Leading Japanese cloud POS system for hospitality, bars, and premium dining venues.',
    region_label: 'Japan',
    countries: ['JP'],
    supported_currencies: ['JPY', 'USD'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'contractId', label: '契約ID (Contract ID)', type: 'text', required: true },
      { key: 'accessToken', label: 'API Access Token', type: 'password', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#64748b',
  },
  {
    id: 'meituan_pos',
    name: 'meituan_pos',
    display_name: 'Meituan POS (美团餐饮系统)',
    description: 'China\'s dominant restaurant and dining point-of-sale platform.',
    region_label: 'China',
    countries: ['CN'],
    supported_currencies: ['CNY'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'appAuthToken', label: '美团授权令牌 (Auth Token)', type: 'password', required: true },
      { key: 'poiId', label: '门店ID (POI ID)', type: 'text', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: false,
    logo_badge: '#fbbf24',
  },

  // 7. Global Enterprise Hotel & Luxury Chains
  {
    id: 'micros_simphony',
    name: 'micros_simphony',
    display_name: 'Oracle MICROS Simphony',
    description: 'Enterprise point-of-sale solution used by global hotel chains, luxury resorts, and high-volume multi-unit restaurant groups worldwide.',
    region_label: 'Global Enterprise (Hotels & Chains)',
    countries: ['*'],
    supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'TRY', 'AED', 'JPY', 'CHF', 'SGD'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'orgShortName', label: 'Oracle Enterprise Org Name', type: 'text', required: true },
      { key: 'apiEndpoint', label: 'Simphony Transaction Services URL', type: 'text', required: true },
      { key: 'serviceAuthKey', label: 'API Auth Key', type: 'password', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: true,
    logo_badge: '#dc2626',
  },
  {
    id: 'ncr_aloha',
    name: 'ncr_aloha',
    display_name: 'NCR Voyix Aloha',
    description: 'Industry-standard enterprise point-of-sale platform for global multi-location restaurant brands.',
    region_label: 'Global Enterprise',
    countries: ['*'],
    supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    capabilities: ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC'],
    required_credentials: [
      { key: 'alohaEnterpriseId', label: 'NCR Enterprise Unit ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
    ],
    status: 'COMING_SOON',
    has_adapter: false,
    is_global: true,
    logo_badge: '#475569',
  },
];
