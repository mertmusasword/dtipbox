import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../utils/prisma';
import * as tableService from '../services/table.service';

describe('Table Service Unit & Integrity Tests', () => {
  let user: any;
  let business: any;
  let createdTable: any;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        email: `table_test_${Date.now()}@naponi.com`,
        password_hash: 'hash_test',
        role: 'BUSINESS',
      },
    });

    business = await prisma.business.create({
      data: {
        owner_user_id: user.id,
        name: 'Table Test Venue',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });
  });

  afterAll(async () => {
    if (business?.id) {
      await prisma.table.deleteMany({ where: { business_id: business.id } });
      await prisma.auditLog.deleteMany({ where: { business_id: business.id } });
      await prisma.business.delete({ where: { id: business.id } });
    }
    if (user?.id) {
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  it('should create a new table and prevent empty or duplicate table names in same business', async () => {
    // 1. Should reject empty table name
    await expect(
      tableService.createTable(business.id, user.id, { name: '   ' })
    ).rejects.toThrow('Table name is required');

    // 2. Should create table successfully
    createdTable = await tableService.createTable(business.id, user.id, { name: 'Masa 1' });
    expect(createdTable.id).toBeDefined();
    expect(createdTable.name).toBe('Masa 1');

    // 3. Should reject exact and case-insensitive duplicate
    await expect(
      tableService.createTable(business.id, user.id, { name: 'Masa 1' })
    ).rejects.toThrow('A table with this name already exists');

    await expect(
      tableService.createTable(business.id, user.id, { name: 'masa 1' })
    ).rejects.toThrow('A table with this name already exists');
  });

  it('should prevent updating a table to an existing duplicate name in the same business', async () => {
    // Create second table
    const table2 = await tableService.createTable(business.id, user.id, { name: 'Masa 2' });

    // Try to update table2 to 'Masa 1'
    await expect(
      tableService.updateTable(table2.id, business.id, user.id, { name: 'MASA 1' })
    ).rejects.toThrow('A table with this name already exists');

    // Updating to self name should succeed
    const updated = await tableService.updateTable(table2.id, business.id, user.id, { name: 'Masa 2' });
    expect(updated.name).toBe('Masa 2');
  });
});
