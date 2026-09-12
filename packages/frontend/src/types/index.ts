export type Role = 'ADMIN' | 'BUSINESS' | 'EMPLOYEE' | 'CUSTOMER';

export type TipDistributionMode = 'INDIVIDUAL' | 'EQUAL_POOL' | 'POINT_POOL';
export type PosFeePayer = 'STAFF' | 'BUSINESS' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  role: Role;
  business?: Business | null;
  employee?: {
    id: string;
    business_id: string;
    first_name: string;
    last_name: string;
    position?: string;
    avatar?: string;
  } | null;
}

export interface Business {
  id: string;
  name: string;
  logo?: string | null;
  country: string;
  currency: string;
  timezone: string;
  locale?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  description?: string | null;
  is_active: boolean;
  tip_distribution_mode?: TipDistributionMode;
  pos_fee_payer?: PosFeePayer;
  custom_pos_fee_rate?: number | string | null;
  tax_deduction_enabled?: boolean;
  tax_deduction_rate?: number | string | null;
  payment_account?: BusinessPaymentAccount | null;
}

export interface BusinessPaymentAccount {
  id: string;
  business_id: string;
  country: string;
  account_holder_name: string;
  iban?: string | null;
  account_number?: string | null;
  routing_number?: string | null;
  sort_code?: string | null;
  swift_bic?: string | null;
  bank_name?: string | null;
}

export interface Employee {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  position?: string | null;
  role_title?: string | null;
  share_weight?: number | string;
  avatar?: string | null;
  is_active: boolean;
  created_at: string;
  user?: { id: string; email: string } | null;
  _count?: { tips: number };
}

export interface Table {
  id: string;
  business_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  _count?: { qr_codes: number; tips: number };
}

export interface QrCode {
  id: string;
  business_id: string;
  table_id?: string | null;
  type: 'DTIPBOX' | 'BANK_PAYMENT';
  public_token: string;
  is_active: boolean;
  created_at: string;
  table?: { id: string; name: string } | null;
}

export type PaymentMethodType = 'IBAN_TRANSFER' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY';
export type PaymentMethodStatus = 'ACTIVE' | 'INACTIVE';
export type PaymentIntegrationStatus = 'NOT_CONNECTED' | 'CONNECTED' | 'ERROR';

export type ProviderType = 'CARD' | 'VIRTUAL_POS' | 'BANK_TRANSFER' | 'WALLET' | 'OTHER';
export type ProviderCatalogStatus = 'ACTIVE' | 'INACTIVE' | 'DEVELOPMENT' | 'COMING_SOON';
export type ProviderRequestStatus = 'PENDING' | 'REVIEWED' | 'PLANNED' | 'REJECTED';

export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password';
  required: boolean;
  placeholder?: string;
  description?: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  logo_url?: string;
  type: ProviderType;
  status: ProviderCatalogStatus;
  countries: string[];
  supported_currencies: string[];
  capabilities: string[];
  required_credentials: CredentialField[];
  has_adapter: boolean;
  is_global: boolean;
  connectedBusinessCount?: number;
}

export interface PaymentIntegrationItem {
  id: string;
  provider: string;
  status: PaymentIntegrationStatus;
  last_tested_at?: string;
  last_error_message?: string;
  hasCredentials: boolean;
  credentials: Record<string, any>;
  meta?: PaymentProvider | null;
}

export interface PaymentProviderRequest {
  id: string;
  business_id: string;
  provider_name: string;
  country: string;
  website?: string | null;
  payment_type: string;
  description?: string | null;
  status: ProviderRequestStatus;
  created_at: string;
  business?: {
    id: string;
    name: string;
    email: string;
    country: string;
    currency: string;
  };
}

export interface PaymentMethodItem {
  id?: string;
  type: PaymentMethodType;
  status: PaymentMethodStatus;
  connectionStatus: 'CONNECTED' | 'NOT_CONNECTED';
  canActivate: boolean;
  provider?: string | null;
}

export interface TipPageDetails {
  qrCode: {
    id: string;
    type: string;
    publicToken: string;
  };
  business: {
    id: string;
    name: string;
    logo?: string | null;
    country: string;
    currency: string;
    description?: string | null;
  };
  table?: { id: string; name: string } | null;
  employees: Array<{
    id: string;
    first_name: string;
    last_name: string;
    position?: string | null;
    avatar?: string | null;
  }>;
  activePaymentMethods: Array<{
    type: PaymentMethodType;
    provider?: string | null;
  }>;
  paymentMethodsCatalog?: Array<{
    type: PaymentMethodType;
    isUsable: boolean;
    status: 'USABLE' | 'DISABLED';
    reason?: string;
  }>;
  presetAmounts: number[];
  hasAvailablePaymentMethod: boolean;
}

export interface BusinessAnalytics {
  todayTips: number;
  weeklyTips: number;
  monthlyTips: number;
  totalTips: number;
  tipCount: number;
  averageTip: number;
  pendingTipCount?: number;
  pendingTipAmount?: number;
  employeeCount: number;
  tableCount: number;
  qrCount: number;
  activePaymentMethodsCount: number;
  employeePerformance: Array<{ name: string; count: number; total: number }>;
  tablePerformance: Array<{ name: string; count: number; total: number }>;
  paymentMethodUsage: Array<{ method: string; count: number; total: number }>;
  qrUsage?: Array<{ token: string; label: string; table: string | null; count: number; total: number }>;
    recentTips: Array<{
    id: string;
    amount: number;
    currency: string;
    payment_method: string;
    status?: string;
    created_at: string;
  }>;
}

export interface EmployeeAnalytics {
  todayTips: number;
  weeklyTips: number;
  monthlyTips: number;
  totalTips: number;
  tipCount: number;
  averageTip: number;
  recentTips: Array<{
    id: string;
    amount: number;
    currency: string;
    payment_method: string;
    created_at: string;
    customer_name?: string | null;
    customer_message?: string | null;
  }>;
}

export interface TipPoolSimulationEmployee {
  employeeId: string;
  employeeName: string;
  position?: string | null;
  roleTitle?: string | null;
  shareWeight: number;
  grossShare: number;
  posFeeShare: number;
  taxFeeShare: number;
  netShare: number;
}

export interface TipPoolSimulation {
  period: {
    start: string;
    end: string;
  };
  currency: string;
  settings: {
    mode: TipDistributionMode;
    posFeePayer: PosFeePayer;
    posFeeRate: number;
    taxDeductionEnabled: boolean;
    taxFeeRate: number;
  };
  summary: {
    grossAmount: number;
    tipCount: number;
    posFeeAmount: number;
    taxFeeAmount: number;
    netDistributedAmount: number;
    participatingCount: number;
  };
  employees: TipPoolSimulationEmployee[];
}

export interface TipPoolDistribution {
  id: string;
  business_id: string;
  period_start: string;
  period_end: string;
  gross_amount: number | string;
  pos_fee_amount: number | string;
  tax_fee_amount: number | string;
  net_distributed_amount: number | string;
  notes?: string | null;
  created_at: string;
  shares?: Array<{
    id: string;
    employee_id: string;
    share_weight: number | string;
    gross_share: number | string;
    net_share: number | string;
    is_paid: boolean;
    paid_at?: string | null;
    employee?: {
      id: string;
      first_name: string;
      last_name: string;
      position?: string | null;
      role_title?: string | null;
    };
  }>;
}
