import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from './audit.service';
import { Role } from '@prisma/client';

interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  position?: string;
  avatar?: string;
  email?: string;
  password?: string;
}

interface UpdateEmployeeInput {
  first_name?: string;
  last_name?: string;
  position?: string;
  avatar?: string;
  is_active?: boolean;
}

const SALT_ROUNDS = 12;

/**
 * Get all employees for a business.
 */
export async function getEmployees(businessId: string) {
  return prisma.employee.findMany({
    where: {
      business_id: businessId,
      deleted_at: null,
    },
    include: {
      user: { select: { id: true, email: true } },
      _count: { select: { tips: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Get a single employee (ownership-checked).
 */
export async function getEmployee(employeeId: string, businessId: string) {
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      business_id: businessId,
      deleted_at: null,
    },
    include: {
      user: { select: { id: true, email: true } },
      _count: { select: { tips: true } },
    },
  });

  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  return employee;
}

/**
 * Create a new employee.
 * Optionally creates a user account if email+password provided.
 */
export async function createEmployee(
  businessId: string,
  actorUserId: string,
  input: CreateEmployeeInput
) {
  let userId: string | undefined;

  // If email provided, create a user account for the employee
  if (input.email && input.password) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: Role.EMPLOYEE,
      },
    });
    userId = user.id;
  }

  const employee = await prisma.employee.create({
    data: {
      business_id: businessId,
      user_id: userId,
      first_name: input.first_name,
      last_name: input.last_name,
      position: input.position,
      avatar: input.avatar,
    },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'EMPLOYEE_CREATED',
    entityType: 'employee',
    entityId: employee.id,
    metadata: { name: `${input.first_name} ${input.last_name}` },
  });

  return employee;
}

/**
 * Update an employee.
 */
export async function updateEmployee(
  employeeId: string,
  businessId: string,
  actorUserId: string,
  input: UpdateEmployeeInput
) {
  // Verify ownership
  const existing = await prisma.employee.findFirst({
    where: { id: employeeId, business_id: businessId, deleted_at: null },
  });

  if (!existing) {
    throw new AppError('Employee not found', 404);
  }

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: input,
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  const action = input.is_active !== undefined
    ? (input.is_active ? 'EMPLOYEE_ACTIVATED' : 'EMPLOYEE_DEACTIVATED')
    : 'EMPLOYEE_UPDATED';

  await createAuditLog({
    actorUserId,
    businessId,
    action,
    entityType: 'employee',
    entityId: employeeId,
    metadata: { changes: Object.keys(input) },
  });

  return employee;
}

/**
 * Soft-delete an employee.
 */
export async function deleteEmployee(
  employeeId: string,
  businessId: string,
  actorUserId: string
) {
  const existing = await prisma.employee.findFirst({
    where: { id: employeeId, business_id: businessId, deleted_at: null },
  });

  if (!existing) {
    throw new AppError('Employee not found', 404);
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: { deleted_at: new Date(), is_active: false },
  });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'EMPLOYEE_DELETED',
    entityType: 'employee',
    entityId: employeeId,
    metadata: { name: `${existing.first_name} ${existing.last_name}` },
  });
}
