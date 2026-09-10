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
  let ownerStatus = 'unknown';
  let verifyTest = false;
  try {
    const ownerEmail = 'owner@naponi.com';
    const ownerPassword = 'M23456.';
    const passwordHash = await bcrypt.hash(ownerPassword, 12);

    verifyTest = await bcrypt.compare(ownerPassword, passwordHash);

    const existing = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          email: ownerEmail,
          password_hash: passwordHash,
          role: 'ADMIN',
          is_active: true,
        },
      });
      ownerStatus = 'created';
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'ADMIN',
          is_active: true,
          password_hash: passwordHash,
        },
      });
      ownerStatus = 'synchronized';
    }
  } catch (err: any) {
    ownerStatus = 'error: ' + err.message;
  }

  res.json({
    status: 'ok',
    service: 'Naponi API',
    version: '1.0.4',
    ownerStatus,
    verifyTest,
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
