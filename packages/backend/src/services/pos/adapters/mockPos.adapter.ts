import {
  IPosProvider,
  PosConnectionTestResult,
  PosNormalizedEmployee,
  PosNormalizedLocation,
  PosNormalizedTip,
  PosSyncResult,
} from '../core/pos.interface';

/**
 * Functional Sandbox Mock POS Adapter
 * Provides simulated restaurant POS connectivity, locations, employees, and closed orders with tips.
 * Used for automated testing, sandbox verification, and customer demonstrations without requiring live proprietary POS credentials.
 */
export class MockPosAdapter implements IPosProvider {
  readonly name = 'mock_pos';
  readonly displayName = 'Naponi POS Sandbox';
  readonly supportedCountries = ['*'];
  readonly capabilities = ['GET_LOCATIONS', 'GET_EMPLOYEES', 'GET_TIPS', 'SYNC', 'TEST_CONNECTION'];

  async testConnection(credentials: Record<string, any>): Promise<PosConnectionTestResult> {
    const apiKey = credentials?.apiKey || credentials?.api_key;
    if (!apiKey || apiKey === 'invalid_key') {
      return {
        success: false,
        message: 'Sandbox API Key is required or invalid.',
      };
    }

    const locationId = credentials?.locationId || 'loc_main_dining';
    const locationName = credentials?.locationName || 'Main Dining Room & Bar';

    return {
      success: true,
      message: 'Connection to Naponi POS Sandbox verified successfully.',
      externalAccountId: 'sandbox_acc_001',
      externalLocationId: locationId,
      locationName: locationName,
    };
  }

  async getLocations(credentials: Record<string, any>): Promise<PosNormalizedLocation[]> {
    return [
      {
        externalId: 'loc_main_dining',
        name: 'Main Dining Room & Terrace',
        address: 'Downtown Avenue No: 42',
        currency: 'USD',
        timezone: 'UTC',
      },
      {
        externalId: 'loc_cocktail_lounge',
        name: 'Cocktail Lounge & Bar',
        address: 'Downtown Avenue No: 42 (Floor 2)',
        currency: 'USD',
        timezone: 'UTC',
      },
    ];
  }

  async getEmployees(credentials: Record<string, any>, locationId?: string): Promise<PosNormalizedEmployee[]> {
    return [
      {
        externalId: 'pos_emp_101',
        firstName: 'Alex',
        lastName: 'Rivers',
        email: 'alex.rivers@pos-mock.internal',
        roleTitle: 'Head Waiter',
        isActive: true,
      },
      {
        externalId: 'pos_emp_102',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@pos-mock.internal',
        roleTitle: 'Senior Bartender',
        isActive: true,
      },
      {
        externalId: 'pos_emp_103',
        firstName: 'Marcus',
        lastName: 'Chen',
        email: 'marcus.chen@pos-mock.internal',
        roleTitle: 'Server / Commis',
        isActive: true,
      },
      {
        externalId: 'pos_emp_104',
        firstName: 'Selin',
        lastName: 'Demir',
        email: 'selin.demir@pos-mock.internal',
        roleTitle: 'Hostess & Service',
        isActive: true,
      },
    ];
  }

  async getTips(
    credentials: Record<string, any>,
    options: { locationId?: string; since?: Date; until?: Date }
  ): Promise<PosNormalizedTip[]> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    return [
      {
        externalOrderId: 'chk_98241',
        externalEmployeeId: 'pos_emp_101',
        externalLocationId: options.locationId || 'loc_main_dining',
        amount: 25.0,
        currency: 'USD',
        posCreatedAt: twoHoursAgo,
        status: 'PAID',
        metadata: { table: 'Table 12', billTotal: 180.0 },
      },
      {
        externalOrderId: 'chk_98242',
        externalEmployeeId: 'pos_emp_102',
        externalLocationId: options.locationId || 'loc_main_dining',
        amount: 15.5,
        currency: 'USD',
        posCreatedAt: oneHourAgo,
        status: 'PAID',
        metadata: { table: 'Bar 3', billTotal: 95.0 },
      },
      {
        externalOrderId: 'chk_98243',
        externalEmployeeId: 'pos_emp_103',
        externalLocationId: options.locationId || 'loc_main_dining',
        amount: 32.0,
        currency: 'USD',
        posCreatedAt: now,
        status: 'PAID',
        metadata: { table: 'Table 8', billTotal: 240.0 },
      },
    ];
  }

  async sync(credentials: Record<string, any>, options: { locationId?: string; since?: Date } = {}): Promise<PosSyncResult> {
    const employees = await this.getEmployees(credentials, options?.locationId);
    const tips = await this.getTips(credentials, options);

    return {
      success: true,
      recordsSynced: employees.length + tips.length,
      tipsImported: tips.length,
      employeesFound: employees.length,
      message: `Successfully synchronized ${tips.length} tip events and ${employees.length} employees from POS Sandbox.`,
    };
  }
}

export const mockPosAdapter = new MockPosAdapter();
