import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export interface PlanCapabilities {
  unlimitedTables: boolean;
  maxTables: number; // -1 means unlimited
  unlimitedEmployees: boolean;
  maxEmployees: number; // -1 means unlimited
  posIntegrations: boolean;
  customBranding: boolean;
  multiCurrency: boolean;
  payrollExport: boolean;
  prioritySupport: boolean;
  smartQrCampaigns: boolean;
}

export interface BusinessPlanStatus {
  businessId: string;
  businessName: string;
  isFounderMember: boolean;
  isLifetimeFree: boolean;
  membershipPlan: string;
  membershipStatus: string;
  joinedAt: string;
  deadline2026: string;
  capabilities: PlanCapabilities;
  usage: {
    currentTables: number;
    currentEmployees: number;
    canAddTable: boolean;
    canAddEmployee: boolean;
  };
}

export class PlanGuardService {
  private readonly FOUNDER_DEADLINE = new Date('2026-12-31T23:59:59.999Z');

  public async getBusinessPlanStatus(businessId: string): Promise<BusinessPlanStatus> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        created_at: true,
        is_founder_member: true,
        is_lifetime_free: true,
        membership_plan: true,
        membership_status: true,
        founder_joined_at: true,
        _count: {
          select: {
            tables: true,
            employees: true,
          },
        },
      },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    const isFounder =
      business.is_founder_member ||
      business.is_lifetime_free ||
      business.created_at <= this.FOUNDER_DEADLINE;

    const capabilities: PlanCapabilities = {
      unlimitedTables: isFounder,
      maxTables: isFounder ? -1 : 10,
      unlimitedEmployees: isFounder,
      maxEmployees: isFounder ? -1 : 5,
      posIntegrations: isFounder,
      customBranding: isFounder,
      multiCurrency: isFounder,
      payrollExport: isFounder,
      prioritySupport: isFounder,
      smartQrCampaigns: isFounder,
    };

    const currentTables = business._count.tables;
    const currentEmployees = business._count.employees;

    return {
      businessId: business.id,
      businessName: business.name,
      isFounderMember: isFounder,
      isLifetimeFree: isFounder,
      membershipPlan: isFounder ? 'FOUNDER_LIFETIME' : business.membership_plan || 'STANDARD',
      membershipStatus: isFounder ? 'LIFETIME_FREE' : business.membership_status || 'ACTIVE',
      joinedAt: business.created_at.toISOString(),
      deadline2026: this.FOUNDER_DEADLINE.toISOString(),
      capabilities,
      usage: {
        currentTables,
        currentEmployees,
        canAddTable: isFounder || currentTables < 10,
        canAddEmployee: isFounder || currentEmployees < 5,
      },
    };
  }

  public async assertCanAddTable(businessId: string): Promise<void> {
    const status = await this.getBusinessPlanStatus(businessId);
    if (!status.usage.canAddTable) {
      throw new AppError(
        'Masa kotasına ulaşıldı. 2026 Kurucu Üyeleri sınırsız masa ekleyebilir.',
        403
      );
    }
  }

  public async assertCanAddEmployee(businessId: string): Promise<void> {
    const status = await this.getBusinessPlanStatus(businessId);
    if (!status.usage.canAddEmployee) {
      throw new AppError(
        'Personel kotasına ulaşıldı. 2026 Kurucu Üyeleri sınırsız personel ekleyebilir.',
        403
      );
    }
  }
}

export const planGuardService = new PlanGuardService();
