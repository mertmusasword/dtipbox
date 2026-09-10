import { Router } from 'express';
import authRoutes from './auth.routes';
import businessRoutes from './business.routes';
import employeeRoutes from './employee.routes';
import tipRoutes from './tip.routes';
import adminRoutes from './admin.routes';
import webhookRoutes from './webhook.routes';

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'D-TIPBOX API',
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
