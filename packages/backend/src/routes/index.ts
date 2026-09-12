import { Router } from 'express';
import authRoutes from './auth.routes';
import businessRoutes from './business.routes';
import employeeRoutes from './employee.routes';
import tipRoutes from './tip.routes';
import adminRoutes from './admin.routes';
import webhookRoutes from './webhook.routes';
import agreementRoutes from './agreement.routes';
import corporateRoutes from './corporate.routes';
import supportRoutes from './support.routes';

import prisma from '../utils/prisma';

const apiRouter = Router();

apiRouter.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    // Light database ping to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = 'error: ' + (err?.message || 'Database unreachable');
  }

  const isHealthy = dbStatus === 'connected';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'Naponi API',
    version: '1.0.4',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/business', businessRoutes);
apiRouter.use('/employee', employeeRoutes);
apiRouter.use('/tip', tipRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/payment/webhook', webhookRoutes);
apiRouter.use('/payments/webhook', webhookRoutes);
apiRouter.use('/agreements', agreementRoutes);
apiRouter.use('/corporate-applications', corporateRoutes);
apiRouter.use('/support-tickets', supportRoutes);

export default apiRouter;
