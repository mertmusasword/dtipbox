import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { paymentService } from './payment/core/payment.service';
import { PaymentMethodType, PaymentStatus, Prisma } from '@prisma/client';
import { getActivePaymentMethods } from './paymentMethod.service';

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

  // Fetch active and connected payment methods
  const activeMethods = await getActivePaymentMethods(qr.business_id);

  // Suggested preset tip amounts depending on currency
  const currencyPresets: Record<string, number[]> = {
    TRY: [50, 100, 200, 500],
    USD: [3, 5, 10, 20],
    EUR: [3, 5, 10, 20],
    GBP: [3, 5, 10, 20],
  };
  const presets = currencyPresets[qr.business.currency.toUpperCase()] || [5, 10, 20, 50];

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
    activePaymentMethods: activeMethods.map((m) => ({
      type: m.type,
      provider: m.provider,
    })),
    presetAmounts: presets,
    hasAvailablePaymentMethod: activeMethods.length > 0,
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

  // Determine effective table ID (either from QR or from customer selection)
  const effectiveTableId = qr.table_id || data.tableId || null;

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

  return {
    tip: {
      id: tip.id,
      amount: tip.amount,
      currency: tip.currency,
      status: paymentResult.status,
      created_at: tip.created_at,
    },
    payment: paymentResult,
  };
}
