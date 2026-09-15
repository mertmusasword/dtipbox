/**
 * Global POS Integration Provider Interface & Normalized Types
 * Provider-independent abstraction for all POS integrations (Toast, Square, Clover, Lightspeed, Foodics, Simpra, etc.)
 */

export interface PosConnectionTestResult {
  success: boolean;
  message: string;
  externalAccountId?: string;
  externalLocationId?: string;
  locationName?: string;
}

export interface PosNormalizedEmployee {
  externalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  roleTitle?: string;
  isActive: boolean;
}

export interface PosNormalizedLocation {
  externalId: string;
  name: string;
  address?: string;
  currency?: string;
  timezone?: string;
}

export interface PosNormalizedTip {
  externalOrderId: string;
  externalEmployeeId?: string;
  externalLocationId?: string;
  amount: number;
  currency: string;
  posCreatedAt: Date;
  status: 'PAID' | 'REFUNDED' | 'VOIDED';
  metadata?: Record<string, any>;
}

export interface PosSyncResult {
  success: boolean;
  recordsSynced: number;
  tipsImported: number;
  employeesFound: number;
  message?: string;
  errors?: string[];
}

export interface IPosProvider {
  readonly name: string;
  readonly displayName: string;
  readonly supportedCountries: string[];
  readonly capabilities: string[];

  /**
   * Test credentials and connectivity with POS gateway/cloud API.
   */
  testConnection(credentials: Record<string, any>): Promise<PosConnectionTestResult>;

  /**
   * Fetch merchant locations/branches registered in the POS.
   */
  getLocations(credentials: Record<string, any>): Promise<PosNormalizedLocation[]>;

  /**
   * Fetch staff/employees configured in the POS.
   */
  getEmployees(credentials: Record<string, any>, locationId?: string): Promise<PosNormalizedEmployee[]>;

  /**
   * Fetch closed orders and tips since a specific timestamp.
   */
  getTips(credentials: Record<string, any>, options: { locationId?: string; since?: Date; until?: Date }): Promise<PosNormalizedTip[]>;

  /**
   * Execute full sync pipeline.
   */
  sync(credentials: Record<string, any>, options: { locationId?: string; since?: Date }): Promise<PosSyncResult>;
}
