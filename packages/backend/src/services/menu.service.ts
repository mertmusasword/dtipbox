import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { ALLERGEN_CATALOG, ALLERGEN_DISCLAIMER } from '../constants/allergens';
import { getOrCreateSmartQrConfig } from './smartQr.service';

export interface UpdateMenuConfigInput {
  menu_mode?: 'DISABLED' | 'EXTERNAL_URL' | 'NATIVE';
  primary_action?: 'TIP' | 'MENU';
  menu_url?: string | null;
  menu_title?: string | null;
  menu_theme?: 'DARK_LUXURY' | 'WARM_ARTISAN' | 'MODERN_EMERALD' | 'MIDNIGHT_ROSE';
  menu_cover_image?: string | null;
  menu_cover_position?: number | null;
  enable_item_stories?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
  sort_order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateMenuItemInput {
  category_id: string;
  name: string;
  description?: string | null;
  price: number;
  currency?: string;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
  allergens?: string[];
  tags?: string[];
  is_featured?: boolean;
}

export interface UpdateMenuItemInput {
  category_id?: string;
  name?: string;
  description?: string | null;
  price?: number;
  currency?: string;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
  allergens?: string[];
  tags?: string[];
  is_featured?: boolean;
}

/**
 * Get full menu with categories, items, and settings for a business.
 */
export async function getBusinessMenu(businessId: string) {
  const smartConfig = await getOrCreateSmartQrConfig(businessId);
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { currency: true, name: true, logo: true },
  });

  const categories = await prisma.menuCategory.findMany({
    where: { business_id: businessId },
    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    include: {
      items: {
        orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
      },
    },
  });

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);

  return {
    config: {
      menu_mode: (smartConfig.menu_mode as 'DISABLED' | 'EXTERNAL_URL' | 'NATIVE') || (smartConfig.enable_menu ? 'EXTERNAL_URL' : 'DISABLED'),
      primary_action: (smartConfig.primary_action as 'TIP' | 'MENU') || 'TIP',
      menu_url: smartConfig.menu_url,
      menu_title: smartConfig.menu_title,
      menu_theme: (smartConfig.menu_theme as 'DARK_LUXURY' | 'WARM_ARTISAN' | 'MODERN_EMERALD' | 'MIDNIGHT_ROSE') || 'DARK_LUXURY',
      menu_cover_image: smartConfig.menu_cover_image || null,
      menu_cover_position: (smartConfig as any).menu_cover_position ?? 50,
      enable_item_stories: smartConfig.enable_item_stories ?? true,
      enable_menu: smartConfig.enable_menu,
    },
    businessCurrency: business?.currency || 'TRY',
    categories,
    totalItems,
    allergensCatalog: ALLERGEN_CATALOG,
  };
}

/**
 * Update menu configuration (mode, external url, label, primary action).
 */
export async function updateMenuConfig(businessId: string, input: UpdateMenuConfigInput) {
  const smartConfig = await getOrCreateSmartQrConfig(businessId);

  const enableMenu = input.menu_mode ? input.menu_mode !== 'DISABLED' : smartConfig.enable_menu;

  const updated = await prisma.smartQrConfig.update({
    where: { business_id: businessId },
    data: {
      ...(input.menu_mode !== undefined && { menu_mode: input.menu_mode }),
      ...(input.primary_action !== undefined && { primary_action: input.primary_action }),
      ...(input.menu_url !== undefined && { menu_url: input.menu_url?.trim() || null }),
      ...(input.menu_title !== undefined && { menu_title: input.menu_title?.trim() || null }),
      ...(input.menu_theme !== undefined && { menu_theme: input.menu_theme }),
      ...(input.menu_cover_image !== undefined && { menu_cover_image: input.menu_cover_image?.trim() || null }),
      ...(input.menu_cover_position !== undefined && { menu_cover_position: input.menu_cover_position ?? 50 }),
      ...(input.enable_item_stories !== undefined && { enable_item_stories: input.enable_item_stories }),
      enable_menu: enableMenu,
    },
  });

  return {
    menu_mode: updated.menu_mode,
    primary_action: updated.primary_action,
    menu_url: updated.menu_url,
    menu_title: updated.menu_title,
    menu_theme: updated.menu_theme,
    menu_cover_image: updated.menu_cover_image,
    menu_cover_position: (updated as any).menu_cover_position ?? 50,
    enable_item_stories: updated.enable_item_stories,
    enable_menu: updated.enable_menu,
  };
}

/**
 * Create a new category for the business menu.
 */
export async function createCategory(businessId: string, input: CreateCategoryInput) {
  if (!input.name || !input.name.trim()) {
    throw new AppError('Category name is required', 400);
  }

  let sortOrder = input.sort_order;
  if (sortOrder === undefined) {
    const lastCategory = await prisma.menuCategory.findFirst({
      where: { business_id: businessId },
      orderBy: { sort_order: 'desc' },
      select: { sort_order: true },
    });
    sortOrder = (lastCategory?.sort_order ?? -1) + 1;
  }

  return prisma.menuCategory.create({
    data: {
      business_id: businessId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      sort_order: sortOrder,
      is_active: true,
    },
    include: {
      items: true,
    },
  });
}

/**
 * Update an existing category.
 */
export async function updateCategory(businessId: string, categoryId: string, input: UpdateCategoryInput) {
  const existing = await prisma.menuCategory.findFirst({
    where: { id: categoryId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Category not found or does not belong to this venue', 404);
  }

  return prisma.menuCategory.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    },
    include: {
      items: true,
    },
  });
}

/**
 * Delete a category and its items (cascade).
 */
export async function deleteCategory(businessId: string, categoryId: string) {
  const existing = await prisma.menuCategory.findFirst({
    where: { id: categoryId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Category not found or does not belong to this venue', 404);
  }

  await prisma.menuCategory.delete({
    where: { id: categoryId },
  });

  return { success: true, deletedId: categoryId };
}

/**
 * Batch reorder categories.
 */
export async function reorderCategories(businessId: string, categoryIds: string[]) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    throw new AppError('categoryIds array is required', 400);
  }

  const updates = categoryIds.map((id, index) =>
    prisma.menuCategory.updateMany({
      where: { id, business_id: businessId },
      data: { sort_order: index },
    })
  );

  await prisma.$transaction(updates);
  return { success: true };
}

/**
 * Create a new menu item.
 */
export async function createMenuItem(businessId: string, input: CreateMenuItemInput) {
  if (!input.name || !input.name.trim()) {
    throw new AppError('Item name is required', 400);
  }

  if (input.price === undefined || input.price === null || isNaN(input.price) || input.price < 0) {
    throw new AppError('Valid price is required (>= 0)', 400);
  }

  const category = await prisma.menuCategory.findFirst({
    where: { id: input.category_id, business_id: businessId },
  });

  if (!category) {
    throw new AppError('Invalid category: Category does not belong to this venue', 400);
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { currency: true },
  });

  let sortOrder = input.sort_order;
  if (sortOrder === undefined) {
    const lastItem = await prisma.menuItem.findFirst({
      where: { category_id: input.category_id, business_id: businessId },
      orderBy: { sort_order: 'desc' },
      select: { sort_order: true },
    });
    sortOrder = (lastItem?.sort_order ?? -1) + 1;
  }

  // Filter valid allergens
  const validAllergenIds = new Set(ALLERGEN_CATALOG.map((a) => a.id));
  const allergens = Array.isArray(input.allergens)
    ? input.allergens.filter((a) => validAllergenIds.has(a.toUpperCase())).map((a) => a.toUpperCase())
    : [];

  return prisma.menuItem.create({
    data: {
      business_id: businessId,
      category_id: input.category_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      currency: input.currency || business?.currency || 'TRY',
      image_url: input.image_url?.trim() || null,
      is_active: input.is_active !== undefined ? input.is_active : true,
      sort_order: sortOrder,
      allergens,
      tags: Array.isArray(input.tags) ? input.tags.map((t) => t.trim()) : [],
      is_featured: input.is_featured !== undefined ? input.is_featured : false,
    },
  });
}

/**
 * Update an existing menu item.
 */
export async function updateMenuItem(businessId: string, itemId: string, input: UpdateMenuItemInput) {
  const existing = await prisma.menuItem.findFirst({
    where: { id: itemId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Menu item not found or does not belong to this venue', 404);
  }

  if (input.category_id && input.category_id !== existing.category_id) {
    const category = await prisma.menuCategory.findFirst({
      where: { id: input.category_id, business_id: businessId },
    });
    if (!category) {
      throw new AppError('Target category not found or does not belong to this venue', 400);
    }
  }

  let allergens = undefined;
  if (input.allergens !== undefined) {
    const validAllergenIds = new Set(ALLERGEN_CATALOG.map((a) => a.id));
    allergens = Array.isArray(input.allergens)
      ? input.allergens.filter((a) => validAllergenIds.has(a.toUpperCase())).map((a) => a.toUpperCase())
      : [];
  }

  return prisma.menuItem.update({
    where: { id: itemId },
    data: {
      ...(input.category_id !== undefined && { category_id: input.category_id }),
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.image_url !== undefined && { image_url: input.image_url?.trim() || null }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
      ...(allergens !== undefined && { allergens }),
      ...(input.tags !== undefined && { tags: Array.isArray(input.tags) ? input.tags.map((t) => t.trim()) : [] }),
      ...(input.is_featured !== undefined && { is_featured: input.is_featured }),
    },
  });
}

/**
 * Fast toggle of item status (active/inactive stock toggle).
 */
export async function toggleMenuItemStatus(businessId: string, itemId: string, isActive: boolean) {
  const existing = await prisma.menuItem.findFirst({
    where: { id: itemId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Menu item not found', 404);
  }

  return prisma.menuItem.update({
    where: { id: itemId },
    data: { is_active: isActive },
  });
}

/**
 * Delete a menu item.
 */
export async function deleteMenuItem(businessId: string, itemId: string) {
  const existing = await prisma.menuItem.findFirst({
    where: { id: itemId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Menu item not found', 404);
  }

  await prisma.menuItem.delete({
    where: { id: itemId },
  });

  return { success: true, deletedId: itemId };
}

/**
 * Batch reorder items in a category.
 */
export async function reorderMenuItems(businessId: string, itemIds: string[]) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    throw new AppError('itemIds array is required', 400);
  }

  const updates = itemIds.map((id, index) =>
    prisma.menuItem.updateMany({
      where: { id, business_id: businessId },
      data: { sort_order: index },
    })
  );

  await prisma.$transaction(updates);
  return { success: true };
}

/**
 * Public Customer Native Menu Fetcher.
 * Resolves by QR public_token, records MENU_VIEW event, returns categories, items, allergens, and tipping hook.
 */
export async function getPublicMenu(publicToken: string) {
  const qr = await prisma.qrCode.findUnique({
    where: { public_token: publicToken },
    include: {
      business: {
        include: {
          smart_qr_config: true,
        },
      },
      table: true,
    },
  });

  if (!qr) {
    throw new AppError('QR code not found or invalid', 404);
  }

  if (!qr.business.is_active) {
    throw new AppError('This venue is currently not active', 403);
  }

  // Record MENU_VIEW event asynchronously
  prisma.smartQrEvent
    .create({
      data: {
        business_id: qr.business_id,
        qr_id: qr.id,
        table_id: qr.table_id,
        event_type: 'MENU_VIEW',
      },
    })
    .catch(() => {});

  const smartConfig = qr.business.smart_qr_config;

  // Fetch active categories and their items (only active items for public view)
  const categories = await prisma.menuCategory.findMany({
    where: {
      business_id: qr.business_id,
      is_active: true,
    },
    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    include: {
      items: {
        where: { is_active: true },
        orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
      },
    },
  });

  return {
    qrCode: {
      id: qr.id,
      type: qr.type,
      publicToken: qr.public_token,
    },
    venue: {
      id: qr.business.id,
      name: qr.business.name,
      logo: qr.business.logo,
      country: qr.business.country,
      currency: qr.business.currency,
      description: qr.business.description,
    },
    table: qr.table ? { id: qr.table.id, name: qr.table.name } : null,
    menu: {
      categories,
      totalItems: categories.reduce((acc, cat) => acc + cat.items.length, 0),
    },
    allergenCatalog: ALLERGEN_CATALOG,
    allergenDisclaimer: ALLERGEN_DISCLAIMER,
    smartQr: {
      isSmartEnabled: smartConfig?.is_smart_enabled ?? true,
      enableTips: smartConfig?.enable_tips ?? true,
      menuMode: (smartConfig?.menu_mode as string) || (smartConfig?.enable_menu ? 'EXTERNAL_URL' : 'DISABLED'),
      menuTitle: smartConfig?.menu_title || null,
      menuTheme: (smartConfig?.menu_theme as any) || 'DARK_LUXURY',
      menu_theme: (smartConfig?.menu_theme as any) || 'DARK_LUXURY',
      menuCoverImage: smartConfig?.menu_cover_image || null,
      menu_cover_image: smartConfig?.menu_cover_image || null,
      menuCoverPosition: (smartConfig as any)?.menu_cover_position ?? 50,
      menu_cover_position: (smartConfig as any)?.menu_cover_position ?? 50,
      enableItemStories: smartConfig?.enable_item_stories ?? true,
      enable_item_stories: smartConfig?.enable_item_stories ?? true,
      primaryAction: (smartConfig?.primary_action as string) || 'TIP',
      enableWifi: smartConfig?.enable_wifi ?? false,
      wifiSsid: smartConfig?.wifi_ssid || null,
      wifiPassword: smartConfig?.wifi_password || null,
      wifiEncryption: smartConfig?.wifi_encryption || 'WPA',
      googleReviewUrl: smartConfig?.google_review_url || null,
      socialInstagram: smartConfig?.social_instagram || null,
      socialFacebook: smartConfig?.social_facebook || null,
      socialTiktok: smartConfig?.social_tiktok || null,
      socialTwitter: smartConfig?.social_twitter || null,
      socialYoutube: smartConfig?.social_youtube || null,
      socialWhatsapp: smartConfig?.social_whatsapp || null,
      socialWebsite: smartConfig?.social_website || null,
      socialLinks: {
        instagram: smartConfig?.social_instagram || null,
        facebook: smartConfig?.social_facebook || null,
        tiktok: smartConfig?.social_tiktok || null,
        twitter: smartConfig?.social_twitter || null,
        youtube: smartConfig?.social_youtube || null,
        whatsapp: smartConfig?.social_whatsapp || null,
        website: smartConfig?.social_website || null,
      },
      customLinks: (() => {
        if (!smartConfig?.custom_links) return [];
        try {
          return JSON.parse(smartConfig.custom_links);
        } catch {
          return [];
        }
      })(),
    },
  };
}
