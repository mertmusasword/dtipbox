import { Router } from 'express';
import authRoutes from './auth.routes';
import businessRoutes from './business.routes';
import employeeRoutes from './employee.routes';
import tipRoutes from './tip.routes';
import adminRoutes from './admin.routes';
import webhookRoutes from './webhook.routes';

import prisma from '../utils/prisma';
import { env } from '../config/env';
import bcrypt from 'bcrypt';

const apiRouter = Router();

apiRouter.get('/health', async (_req, res) => {
  let adminExists = false;
  let adminRole = null;
  let bootstrapResult = 'not_needed';
  try {
    const adminEmail = (env.ADMIN_EMAIL || 'owner@naponi.com').toLowerCase().trim();
    const adminPassword = env.ADMIN_PASSWORD || 'M23456.';
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password_hash: passwordHash,
          role: 'ADMIN',
          is_active: true,
        },
      });
      bootstrapResult = 'created';
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: 'ADMIN', is_active: true, password_hash: passwordHash },
      });
      bootstrapResult = 'synchronized';
    }

    adminExists = !!admin;
    adminRole = admin?.role || null;
  } catch (err: any) {
    bootstrapResult = 'error: ' + err.message;
  }

  res.json({
    status: 'ok',
    service: 'Naponi API',
    version: '1.0.3',
    adminEmail: env.ADMIN_EMAIL,
    adminExists,
    adminRole,
    bootstrapResult,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/business', businessRoutes);
apiRouter.use('/employee', employeeRoutes);
apiRouter.use('/tip', tipRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/payment/webhook', webhookRoutes);

export default apiRouter;
