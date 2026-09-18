import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../utils/prisma';
import * as menuService from '../services/menu.service';
import * as qrService from '../services/qr.service';

describe('Naponi Native QR Menu & Allergen System Suite', () => {
  let userA: any;
  let businessA: any;
  let qrA: any;

  let userB: any;
  let businessB: any;

  beforeAll(async () => {
    // Setup Business A
    userA = await prisma.user.create({
      data: {
        email: `menu_test_a_${Date.now()}@naponi.com`,
        password_hash: 'hash_test',
        role: 'BUSINESS',
      },
    });

    businessA = await prisma.business.create({
      data: {
        owner_user_id: userA.id,
        name: 'Naponi Test Cafe A',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });

    qrA = await qrService.createQrCode(businessA.id, userA.id, {
      type: 'DTIPBOX',
    });

    // Setup Business B (for multi-tenant isolation testing)
    userB = await prisma.user.create({
      data: {
        email: `menu_test_b_${Date.now()}@naponi.com`,
        password_hash: 'hash_test',
        role: 'BUSINESS',
      },
    });

    businessB = await prisma.business.create({
      data: {
        owner_user_id: userB.id,
        name: 'Naponi Test Bistro B',
        country: 'DE',
        currency: 'EUR',
        timezone: 'Europe/Berlin',
      },
    });
  });

  afterAll(async () => {
    if (businessA?.id) {
      await prisma.smartQrEvent.deleteMany({ where: { business_id: businessA.id } });
      await prisma.menuItem.deleteMany({ where: { business_id: businessA.id } });
      await prisma.menuCategory.deleteMany({ where: { business_id: businessA.id } });
      await prisma.qrCode.deleteMany({ where: { business_id: businessA.id } });
      await prisma.smartQrConfig.deleteMany({ where: { business_id: businessA.id } });
      await prisma.business.delete({ where: { id: businessA.id } });
    }
    if (userA?.id) {
      await prisma.user.delete({ where: { id: userA.id } });
    }

    if (businessB?.id) {
      await prisma.menuItem.deleteMany({ where: { business_id: businessB.id } });
      await prisma.menuCategory.deleteMany({ where: { business_id: businessB.id } });
      await prisma.qrCode.deleteMany({ where: { business_id: businessB.id } });
      await prisma.smartQrConfig.deleteMany({ where: { business_id: businessB.id } });
      await prisma.business.delete({ where: { id: businessB.id } });
    }
    if (userB?.id) {
      await prisma.user.delete({ where: { id: userB.id } });
    }
  });

  it('should initialize default menu config as DISABLED', async () => {
    const menuData = await menuService.getBusinessMenu(businessA.id);
    expect(menuData).toBeDefined();
    expect(menuData.config.menu_mode).toBe('DISABLED');
    expect(menuData.config.primary_action).toBe('TIP');
    expect(menuData.categories).toHaveLength(0);
    expect(menuData.allergensCatalog.length).toBeGreaterThanOrEqual(14);
  });

  it('should update menu mode to EXTERNAL_URL and preserve existing link flow', async () => {
    const updated = await menuService.updateMenuConfig(businessA.id, {
      menu_mode: 'EXTERNAL_URL',
      menu_url: 'https://menu.finedine.co/naponi-test',
      menu_title: 'FineDine Menümüz',
    });

    expect(updated.menu_mode).toBe('EXTERNAL_URL');
    expect(updated.enable_menu).toBe(true);
    expect(updated.menu_url).toBe('https://menu.finedine.co/naponi-test');
    expect(updated.menu_title).toBe('FineDine Menümüz');
  });

  it('should switch menu mode to NATIVE with primary action MENU', async () => {
    const updated = await menuService.updateMenuConfig(businessA.id, {
      menu_mode: 'NATIVE',
      primary_action: 'MENU',
      menu_title: 'Lezzet Menüsü',
    });

    expect(updated.menu_mode).toBe('NATIVE');
    expect(updated.enable_menu).toBe(true);
    expect(updated.primary_action).toBe('MENU');
    expect(updated.menu_title).toBe('Lezzet Menüsü');
  });

  let catCoffees: any;
  let catDesserts: any;

  it('should create menu categories with auto sort_order', async () => {
    catCoffees = await menuService.createCategory(businessA.id, {
      name: 'Kahveler',
      description: 'Taze kavrulmuş sıcak & soğuk kahveler',
    });
    expect(catCoffees.id).toBeDefined();
    expect(catCoffees.name).toBe('Kahveler');
    expect(catCoffees.sort_order).toBe(0);

    catDesserts = await menuService.createCategory(businessA.id, {
      name: 'Tatlılar',
      description: 'Günlük taze ev yapımı tatlılar',
    });
    expect(catDesserts.id).toBeDefined();
    expect(catDesserts.name).toBe('Tatlılar');
    expect(catDesserts.sort_order).toBe(1);
  });

  let itemLatte: any;
  let itemCheesecake: any;

  it('should create menu items with price, currency, and standard allergens', async () => {
    itemLatte = await menuService.createMenuItem(businessA.id, {
      category_id: catCoffees.id,
      name: 'Latte',
      description: 'Espresso ve buharda ısıtılmış kadifemsi süt',
      price: 150,
      currency: 'TRY',
      allergens: ['DAIRY'],
      tags: ['POPULAR'],
    });

    expect(itemLatte.id).toBeDefined();
    expect(Number(itemLatte.price)).toBe(150);
    expect(itemLatte.allergens).toContain('DAIRY');
    expect(itemLatte.is_active).toBe(true);

    itemCheesecake = await menuService.createMenuItem(businessA.id, {
      category_id: catDesserts.id,
      name: 'San Sebastian Cheesecake',
      description: 'Fırınlanmış karamelize İspanyol keki',
      price: 190,
      currency: 'TRY',
      allergens: ['DAIRY', 'EGGS', 'GLUTEN'],
      tags: ['CHEF_CHOICE'],
    });

    expect(itemCheesecake.id).toBeDefined();
    expect(itemCheesecake.allergens).toHaveLength(3);
    expect(itemCheesecake.allergens).toEqual(expect.arrayContaining(['DAIRY', 'EGGS', 'GLUTEN']));
  });

  it('should allow business to toggle item active/passive status (out of stock)', async () => {
    const toggled = await menuService.toggleMenuItemStatus(businessA.id, itemCheesecake.id, false);
    expect(toggled.is_active).toBe(false);

    // Reactivate
    const reactivated = await menuService.toggleMenuItemStatus(businessA.id, itemCheesecake.id, true);
    expect(reactivated.is_active).toBe(true);
  });

  it('should enforce business multi-tenant isolation', async () => {
    // Business B should NOT be able to modify Business A's category
    await expect(
      menuService.updateCategory(businessB.id, catCoffees.id, { name: 'Hacked Category' })
    ).rejects.toThrow();

    // Business B should NOT be able to add item to Business A's category
    await expect(
      menuService.createMenuItem(businessB.id, {
        category_id: catCoffees.id,
        name: 'Illegal Item',
        price: 99,
      })
    ).rejects.toThrow();

    // Business B should NOT be able to toggle Business A's item
    await expect(
      menuService.toggleMenuItemStatus(businessB.id, itemLatte.id, false)
    ).rejects.toThrow();
  });

  it('should batch reorder categories and items', async () => {
    // Reorder categories: Tatlılar first (0), Kahveler second (1)
    await menuService.reorderCategories(businessA.id, [catDesserts.id, catCoffees.id]);

    const menu = await menuService.getBusinessMenu(businessA.id);
    expect(menu.categories[0].id).toBe(catDesserts.id);
    expect(menu.categories[1].id).toBe(catCoffees.id);
  });

  it('should fetch public menu via QR publicToken with active items and allergens', async () => {
    const publicMenu = await menuService.getPublicMenu(qrA.public_token);

    expect(publicMenu.venue.name).toBe('Naponi Test Cafe A');
    expect(publicMenu.venue.currency).toBe('TRY');
    expect(publicMenu.smartQr.enableTips).toBe(true);
    expect(publicMenu.smartQr.menuMode).toBe('NATIVE');
    expect(publicMenu.menu.categories.length).toBeGreaterThanOrEqual(2);

    // Verify allergens and disclaimer presence
    expect(publicMenu.allergenCatalog.length).toBeGreaterThanOrEqual(14);
    expect(publicMenu.allergenDisclaimer.tr).toContain('Alerjen Bilgisi');
    expect(publicMenu.allergenDisclaimer.tr).toContain('çapraz bulaşma');

    // Make cheesecake inactive and verify it disappears from public menu
    await menuService.toggleMenuItemStatus(businessA.id, itemCheesecake.id, false);
    const updatedPublic = await menuService.getPublicMenu(qrA.public_token);

    const dessertCat = updatedPublic.menu.categories.find((c) => c.id === catDesserts.id);
    expect(dessertCat?.items.find((i) => i.id === itemCheesecake.id)).toBeUndefined();
  });
});
