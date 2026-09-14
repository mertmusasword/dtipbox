import prisma from '../utils/prisma';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { emailService } from './email.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Character set for unambiguous customer card codes (excludes 0, O, 1, I, L)
const CARD_CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generate cryptographically random 6-character card code (e.g. "8F42K7")
 */
export async function generateUniqueCardCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = crypto.randomBytes(6);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CARD_CODE_CHARS[bytes[i] % CARD_CODE_CHARS.length];
    }
    const existing = await prisma.loyaltyCard.findUnique({
      where: { card_code: code },
    });
    if (!existing) return code;
  }
  // Fallback with timestamp randomness if collision persists
  return 'C' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

/**
 * Generate unique public card slug (e.g. "c_7a9f82d1b4c3e5a6")
 */
export function generatePublicCardId(): string {
  return 'c_' + crypto.randomBytes(8).toString('hex');
}

/**
 * Generate unique dynamic scan token (e.g. "t_...")
 */
export function generateScanToken(): string {
  return 't_' + crypto.randomBytes(16).toString('hex');
}

/**
 * Generate unique reward redemption verification code (e.g. "RDW-8A2F4B")
 */
export function generateRedemptionCode(): string {
  return 'RDW-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

/**
 * Mask email for privacy in staff/business tables (e.g. "m***@gmail.com")
 */
export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const visible = name.length > 2 ? name.slice(0, 2) : name.slice(0, 1);
  return `${visible}***@${domain}`;
}

export class LoyaltyService {
  /**
   * 1. Get or find business active loyalty program
   */
  async getBusinessProgram(businessId: string) {
    let program = await prisma.loyaltyProgram.findFirst({
      where: { business_id: businessId, is_active: true },
      orderBy: { created_at: 'desc' },
    });

    // If no active program, check if any exists
    if (!program) {
      program = await prisma.loyaltyProgram.findFirst({
        where: { business_id: businessId },
        orderBy: { created_at: 'desc' },
      });
    }

    return program;
  }

  /**
   * 2. Upsert (Create or Update) loyalty program for a business
   */
  async upsertBusinessProgram(
    businessId: string,
    data: {
      name: string;
      targetStamps: number;
      rewardDescription: string;
      isActive?: boolean;
    }
  ) {
    const cleanName = data.name.trim();
    const cleanReward = data.rewardDescription.trim();
    const target = Math.max(2, Math.min(50, Number(data.targetStamps) || 10));
    const active = data.isActive !== undefined ? Boolean(data.isActive) : true;

    if (!cleanName || !cleanReward) {
      throw new AppError('Program adı ve ödül açıklaması zorunludur', 400);
    }

    const existing = await prisma.loyaltyProgram.findFirst({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
    });

    if (existing) {
      return prisma.loyaltyProgram.update({
        where: { id: existing.id },
        data: {
          name: cleanName,
          target_stamps: target,
          reward_description: cleanReward,
          is_active: active,
        },
      });
    }

    return prisma.loyaltyProgram.create({
      data: {
        business_id: businessId,
        name: cleanName,
        target_stamps: target,
        reward_description: cleanReward,
        is_active: active,
      },
    });
  }

  /**
   * 3. Get loyalty program statistics for business dashboard
   */
  async getBusinessLoyaltyStats(businessId: string) {
    const [totalCards, activeCustomers, totalStampsGiven, redeemedRewards, pendingRewards] =
      await Promise.all([
        prisma.loyaltyCard.count({ where: { business_id: businessId } }),
        prisma.loyaltyCard.count({
          where: { business_id: businessId, current_stamps: { gt: 0 } },
        }),
        prisma.loyaltyStampTransaction.count({
          where: { business_id: businessId, action_type: 'STAMP_ADDED' },
        }),
        prisma.loyaltyRedemption.count({
          where: { business_id: businessId, status: 'REDEEMED' },
        }),
        prisma.loyaltyCard.count({
          where: {
            business_id: businessId,
            current_stamps: { gte: prisma.loyaltyCard.fields.target_stamps },
          },
        }),
      ]);

    return {
      totalCards,
      activeCustomers,
      totalStampsGiven,
      redeemedRewards,
      pendingRewards,
    };
  }

  /**
   * 4. Get paginated loyalty stamp audit transactions
   */
  async getBusinessLoyaltyTransactions(businessId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.loyaltyStampTransaction.findMany({
        where: { business_id: businessId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          employee: {
            select: { id: true, first_name: true, last_name: true, role_title: true },
          },
          card: {
            select: {
              id: true,
              public_id: true,
              card_code: true,
              customer_email: true,
              customer_name: true,
            },
          },
        },
      }),
      prisma.loyaltyStampTransaction.count({ where: { business_id: businessId } }),
    ]);

    const formatted = items.map((tx) => ({
      id: tx.id,
      action_type: tx.action_type,
      method: tx.method,
      previous_stamps: tx.previous_stamps,
      new_stamps: tx.new_stamps,
      created_at: tx.created_at,
      staff_name: tx.employee
        ? `${tx.employee.first_name} ${tx.employee.last_name}`
        : 'Yönetici / Kasa',
      customer_masked_email: tx.card?.customer_email ? maskEmail(tx.card.customer_email) : 'Misafir',
      customer_name: tx.card?.customer_name || null,
      card_code: tx.card?.card_code || '------',
    }));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 5. Public enrollment info for customer when scanning business enrollment QR
   */
  async getPublicEnrollmentInfo(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, logo: true, is_active: true },
    });

    if (!business || !business.is_active) {
      throw new AppError('İşletme bulunamadı veya aktif değil', 404);
    }

    const program = await prisma.loyaltyProgram.findFirst({
      where: { business_id: businessId, is_active: true },
      orderBy: { created_at: 'desc' },
    });

    if (!program) {
      throw new AppError('Bu işletmeye ait aktif bir sadakat programı bulunamadı', 404);
    }

    return {
      business: {
        id: business.id,
        name: business.name,
        logo: business.logo,
      },
      program: {
        id: program.id,
        name: program.name,
        target_stamps: program.target_stamps,
        reward_description: program.reward_description,
      },
    };
  }

  /**
   * 6. Enroll customer & create or return existing card
   */
  async enrollCustomer(params: {
    businessId: string;
    programId?: string;
    email: string;
    name?: string;
  }) {
    const cleanEmail = params.email.toLowerCase().trim();
    const cleanName = params.name?.trim() || null;

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new AppError('Geçerli bir e-posta adresi giriniz', 400);
    }

    const business = await prisma.business.findUnique({
      where: { id: params.businessId },
      select: { id: true, name: true, is_active: true },
    });
    if (!business || !business.is_active) {
      throw new AppError('İşletme bulunamadı', 404);
    }

    // Program check
    let program = params.programId
      ? await prisma.loyaltyProgram.findUnique({ where: { id: params.programId } })
      : await prisma.loyaltyProgram.findFirst({
          where: { business_id: params.businessId, is_active: true },
          orderBy: { created_at: 'desc' },
        });

    if (!program || !program.is_active) {
      throw new AppError('Aktif sadakat programı bulunamadı', 404);
    }

    // Check if customer already has a card for this business & program
    let card = await prisma.loyaltyCard.findUnique({
      where: {
        business_id_program_id_customer_email: {
          business_id: business.id,
          program_id: program.id,
          customer_email: cleanEmail,
        },
      },
    });

    let isNew = false;
    if (!card) {
      isNew = true;
      const publicId = generatePublicCardId();
      const cardCode = await generateUniqueCardCode();

      card = await prisma.loyaltyCard.create({
        data: {
          public_id: publicId,
          business_id: business.id,
          program_id: program.id,
          customer_email: cleanEmail,
          customer_name: cleanName,
          card_code: cardCode,
          current_stamps: 0,
          target_stamps: program.target_stamps,
          is_active: true,
        },
      });
    }

    const cardUrl = `${env.APP_URL}/loyalty/card/${card.public_id}`;

    // Send welcome email asynchronously
    emailService
      .sendLoyaltyCardWelcomeEmail({
        to: card.customer_email,
        businessName: business.name,
        programName: program.name,
        cardUrl,
        cardCode: card.card_code,
        targetStamps: card.target_stamps,
        rewardDescription: program.reward_description,
      })
      .catch((err) => {
        logger.error('Failed to send loyalty welcome email', 'LOYALTY', {
          error: String(err),
          cardId: card?.id,
        });
      });

    return {
      card: {
        public_id: card.public_id,
        card_code: card.card_code,
        current_stamps: card.current_stamps,
        target_stamps: card.target_stamps,
        customer_name: card.customer_name,
        customer_email: card.customer_email,
        card_url: cardUrl,
      },
      isNew,
    };
  }

  /**
   * 7. Get Customer Card state by public card ID
   */
  async getCardByPublicId(publicId: string) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { public_id: publicId },
      include: {
        business: {
          select: { id: true, name: true, logo: true, currency: true },
        },
        program: {
          select: {
            id: true,
            name: true,
            target_stamps: true,
            reward_description: true,
            is_active: true,
          },
        },
        redemptions: {
          where: { status: 'PENDING' },
          select: { id: true, code: true, reward_title: true, created_at: true },
          take: 1,
        },
      },
    });

    if (!card || !card.is_active) {
      throw new AppError('Sadakat kartı bulunamadı veya pasife alınmış', 404);
    }

    const hasReward = card.current_stamps >= card.target_stamps;
    const pendingRedemption = card.redemptions.length > 0 ? card.redemptions[0] : null;

    return {
      public_id: card.public_id,
      card_code: card.card_code,
      current_stamps: card.current_stamps,
      target_stamps: card.target_stamps,
      total_rewards_earned: card.total_rewards_earned,
      customer_name: card.customer_name,
      customer_masked_email: maskEmail(card.customer_email),
      has_reward: hasReward,
      pending_redemption: pendingRedemption,
      business: card.business,
      program: card.program,
    };
  }

  /**
   * 8. Generate dynamic scan token for customer card (auto-refreshes every 30-45s)
   */
  async generateCardScanToken(publicId: string) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { public_id: publicId },
      include: { program: true },
    });

    if (!card || !card.is_active || !card.program.is_active) {
      throw new AppError('Kart veya program aktif değil', 400);
    }

    const tokenString = generateScanToken();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60s window (UI auto-polls every 25s)

    const scanToken = await prisma.loyaltyScanToken.create({
      data: {
        card_id: card.id,
        token: tokenString,
        expires_at: expiresAt,
      },
    });

    return {
      token: scanToken.token,
      expires_at: scanToken.expires_at,
      valid_seconds: 60,
    };
  }

  /**
   * 9. Customer clicks "Ödülü Kullan" -> creates or gets pending redemption code
   */
  async requestCardRedemption(publicId: string) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { public_id: publicId },
      include: { program: true },
    });

    if (!card || !card.is_active) {
      throw new AppError('Kart bulunamadı', 404);
    }

    if (card.current_stamps < card.target_stamps) {
      throw new AppError('Ödülü kullanabilmek için hedef damgaya ulaşmış olmalısınız', 400);
    }

    // Check existing pending redemption
    let redemption = await prisma.loyaltyRedemption.findFirst({
      where: {
        card_id: card.id,
        status: 'PENDING',
      },
      orderBy: { created_at: 'desc' },
    });

    if (!redemption) {
      redemption = await prisma.loyaltyRedemption.create({
        data: {
          card_id: card.id,
          business_id: card.business_id,
          program_id: card.program_id,
          reward_title: card.program.reward_description,
          code: generateRedemptionCode(),
          status: 'PENDING',
        },
      });
    }

    return {
      code: redemption.code,
      reward_title: redemption.reward_title,
      status: redemption.status,
    };
  }

  /**
   * 10. Staff Stamp via Scanned QR Token (Atomic Transaction)
   */
  async addStampViaQr(params: {
    token: string;
    businessId: string;
    employeeId?: string | null;
    userId?: string | null;
  }) {
    const cleanToken = params.token.trim();
    if (!cleanToken) {
      throw new AppError('Geçersiz QR kodu', 400);
    }

    return prisma.$transaction(async (tx) => {
      // Find scan token
      const scanToken = await tx.loyaltyScanToken.findUnique({
        where: { token: cleanToken },
        include: {
          card: {
            include: { program: true, business: true },
          },
        },
      });

      if (!scanToken) {
        throw new AppError('QR kod geçersiz veya bulunamadı', 400);
      }

      if (scanToken.used_at) {
        throw new AppError('Bu QR kod daha önce kullanılmış. Lütfen kartı yenileyip tekrar okutun.', 400);
      }

      if (new Date() > scanToken.expires_at) {
        throw new AppError('QR kodun süresi dolmuş (30 sn). Lütfen kartı yenileyip tekrar gösterin.', 400);
      }

      const card = scanToken.card;
      if (!card || !card.is_active) {
        throw new AppError('Sadakat kartı aktif değil', 400);
      }

      // Business isolation check
      if (card.business_id !== params.businessId) {
        throw new AppError('Bu sadakat kartı bu işletmeye ait değil!', 403);
      }

      if (!card.program.is_active) {
        throw new AppError('İşletmenin sadakat programı şu anda pasif durumda', 400);
      }

      // Mark token as used immediately (replay protection)
      await tx.loyaltyScanToken.update({
        where: { id: scanToken.id },
        data: { used_at: new Date() },
      });

      // Increment stamp
      const prevStamps = card.current_stamps;
      const newStamps = prevStamps + 1;

      await tx.loyaltyCard.update({
        where: { id: card.id },
        data: { current_stamps: newStamps },
      });

      // Audit transaction
      await tx.loyaltyStampTransaction.create({
        data: {
          card_id: card.id,
          business_id: params.businessId,
          program_id: card.program_id,
          employee_id: params.employeeId || null,
          user_id: params.userId || null,
          action_type: 'STAMP_ADDED',
          method: 'QR',
          previous_stamps: prevStamps,
          new_stamps: newStamps,
          scan_token_id: scanToken.id,
        },
      });

      const rewardEarned = newStamps >= card.target_stamps;

      return {
        success: true,
        previousStamps: prevStamps,
        currentStamps: newStamps,
        targetStamps: card.target_stamps,
        rewardEarned,
        rewardDescription: card.program.reward_description,
        customerName: card.customer_name || 'Misafir',
        cardCode: card.card_code,
      };
    });
  }

  /**
   * 11. Staff Stamp via 6-8 char Customer Card Code (Atomic Transaction)
   */
  async addStampViaCode(params: {
    cardCode: string;
    businessId: string;
    employeeId?: string | null;
    userId?: string | null;
  }) {
    const cleanCode = params.cardCode.toUpperCase().trim();
    if (!cleanCode || cleanCode.length < 4) {
      throw new AppError('Lütfen geçerli bir müşteri kart kodu giriniz', 400);
    }

    return prisma.$transaction(async (tx) => {
      const card = await tx.loyaltyCard.findUnique({
        where: { card_code: cleanCode },
        include: { program: true },
      });

      if (!card || !card.is_active) {
        throw new AppError('Bu koda sahip sadakat kartı bulunamadı', 404);
      }

      // Business isolation check
      if (card.business_id !== params.businessId) {
        throw new AppError('Bu sadakat kartı bu işletmeye ait değil!', 403);
      }

      if (!card.program.is_active) {
        throw new AppError('İşletmenin sadakat programı şu anda pasif durumda', 400);
      }

      // Increment stamp
      const prevStamps = card.current_stamps;
      const newStamps = prevStamps + 1;

      await tx.loyaltyCard.update({
        where: { id: card.id },
        data: { current_stamps: newStamps },
      });

      // Audit transaction
      await tx.loyaltyStampTransaction.create({
        data: {
          card_id: card.id,
          business_id: params.businessId,
          program_id: card.program_id,
          employee_id: params.employeeId || null,
          user_id: params.userId || null,
          action_type: 'STAMP_ADDED',
          method: 'CODE',
          previous_stamps: prevStamps,
          new_stamps: newStamps,
        },
      });

      const rewardEarned = newStamps >= card.target_stamps;

      return {
        success: true,
        previousStamps: prevStamps,
        currentStamps: newStamps,
        targetStamps: card.target_stamps,
        rewardEarned,
        rewardDescription: card.program.reward_description,
        customerName: card.customer_name || 'Misafir',
        cardCode: card.card_code,
      };
    });
  }

  /**
   * 12. Staff verifies & confirms Reward Redemption (Atomic Transaction)
   */
  async confirmRewardRedemption(params: {
    code: string;
    businessId: string;
    employeeId?: string | null;
    userId?: string | null;
  }) {
    const cleanCode = params.code.toUpperCase().trim();
    if (!cleanCode) {
      throw new AppError('Lütfen ödül kullanım kodunu giriniz', 400);
    }

    return prisma.$transaction(async (tx) => {
      const redemption = await tx.loyaltyRedemption.findUnique({
        where: { code: cleanCode },
        include: { card: true, program: true },
      });

      if (!redemption) {
        throw new AppError('Ödül kullanım kodu bulunamadı', 404);
      }

      if (redemption.status === 'REDEEMED') {
        throw new AppError('Bu ödül daha önce kullanılmıştır!', 400);
      }

      if (redemption.business_id !== params.businessId) {
        throw new AppError('Bu ödül başka bir işletmeye aittir!', 403);
      }

      // Mark redemption as redeemed
      await tx.loyaltyRedemption.update({
        where: { id: redemption.id },
        data: {
          status: 'REDEEMED',
          redeemed_at: new Date(),
          employee_id: params.employeeId || null,
        },
      });

      // Deduct target stamps and increment total rewards earned
      const prevStamps = redemption.card.current_stamps;
      const newStamps = Math.max(0, prevStamps - redemption.card.target_stamps);

      await tx.loyaltyCard.update({
        where: { id: redemption.card_id },
        data: {
          current_stamps: newStamps,
          total_rewards_earned: { increment: 1 },
        },
      });

      // Audit transaction
      await tx.loyaltyStampTransaction.create({
        data: {
          card_id: redemption.card_id,
          business_id: params.businessId,
          program_id: redemption.program_id,
          employee_id: params.employeeId || null,
          user_id: params.userId || null,
          action_type: 'REWARD_REDEEMED',
          method: 'CODE',
          previous_stamps: prevStamps,
          new_stamps: newStamps,
          notes: `Ödül kullanıldı: ${redemption.reward_title}`,
        },
      });

      return {
        success: true,
        rewardTitle: redemption.reward_title,
        customerName: redemption.card.customer_name || 'Misafir',
        cardCode: redemption.card.card_code,
        remainingStamps: newStamps,
      };
    });
  }

  /**
   * 13. Recover cards by customer email
   */
  async recoverCardsByEmail(email: string, businessId?: string) {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new AppError('Geçerli bir e-posta adresi giriniz', 400);
    }

    const where: any = { customer_email: cleanEmail, is_active: true };
    if (businessId) {
      where.business_id = businessId;
    }

    const cards = await prisma.loyaltyCard.findMany({
      where,
      include: {
        business: { select: { name: true } },
        program: { select: { name: true, target_stamps: true } },
      },
    });

    if (cards.length > 0) {
      const cardsList = cards.map((c) => ({
        businessName: c.business.name,
        programName: c.program.name,
        cardUrl: `${env.APP_URL}/loyalty/card/${c.public_id}`,
        cardCode: c.card_code,
        currentStamps: c.current_stamps,
        targetStamps: c.target_stamps,
      }));

      emailService
        .sendLoyaltyCardRecoveryEmail({
          to: cleanEmail,
          cards: cardsList,
        })
        .catch((err) => {
          logger.error('Failed to send loyalty recovery email', 'LOYALTY', { error: String(err) });
        });
    }

    // Always return success message to prevent user enumeration
    return {
      success: true,
      message: 'Kayıtlı kartlarınız varsa e-posta adresinize erişim bağlantısı gönderildi.',
    };
  }
}

export const loyaltyService = new LoyaltyService();
export default loyaltyService;
