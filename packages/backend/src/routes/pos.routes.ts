import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { authenticate, authorize, requireBusinessOwnership, AuthRequest } from '../middleware/auth';
import { posService } from '../services/pos/pos.service';

const router = Router();

// Apply auth & business checks
router.use(authenticate);
router.use(authorize('BUSINESS', 'ADMIN'));
router.use(requireBusinessOwnership);

/**
 * 1. GET /api/pos/providers - List POS providers filtered by country or search
 */
router.get('/providers', (req: AuthRequest, res, next) => {
  try {
    const { country, search } = req.query;
    const catalog = posService.getCatalog({
      country: country as string | undefined,
      search: search as string | undefined,
    });
    res.json({ success: true, data: catalog });
  } catch (error) {
    next(error);
  }
});

/**
 * 2. GET /api/pos/connections - List active POS connections for current business
 */
router.get('/connections', async (req: AuthRequest, res, next) => {
  try {
    const connections = await posService.getBusinessConnections(req.user!.businessId!);
    res.json({ success: true, data: connections });
  } catch (error) {
    next(error);
  }
});

/**
 * 3. POST /api/pos/connections - Connect a POS system
 */
const connectPosSchema = {
  body: z.object({
    provider: z.string().min(1, 'POS sağlayıcı seçilmelidir'),
    credentials: z.record(z.any()),
    branchId: z.string().optional(),
    locationName: z.string().optional(),
  }),
};

router.post('/connections', validate(connectPosSchema), async (req: AuthRequest, res, next) => {
  try {
    const result = await posService.connectPos(
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * 4. DELETE /api/pos/connections/:id - Disconnect POS
 */
router.delete('/connections/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await posService.disconnectPos(
      req.user!.businessId!,
      req.user!.id,
      req.params.id as string
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 5. POST /api/pos/connections/:id/sync - Trigger POS sync
 */
router.post('/connections/:id/sync', async (req: AuthRequest, res, next) => {
  try {
    const result = await posService.syncPosConnection(
      req.user!.businessId!,
      req.user!.id,
      req.params.id as string
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 6. GET /api/pos/connections/:id/employees - Get employee mappings
 */
router.get('/connections/:id/employees', async (req: AuthRequest, res, next) => {
  try {
    const result = await posService.getEmployeeMappings(
      req.user!.businessId!,
      req.params.id as string
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * 7. PUT /api/pos/connections/:id/employees/map - Map external employee to Naponi employee
 */
const mapEmployeeSchema = {
  body: z.object({
    externalEmployeeId: z.string().min(1, 'External employee ID gereklidir'),
    employeeId: z.string().nullable(),
  }),
};

router.put('/connections/:id/employees/map', validate(mapEmployeeSchema), async (req: AuthRequest, res, next) => {
  try {
    const { externalEmployeeId, employeeId } = req.body;
    const result = await posService.mapEmployee(
      req.user!.businessId!,
      req.params.id as string,
      externalEmployeeId,
      employeeId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 8. POST /api/pos/request - Submit a custom/unlisted POS integration request
 */
const posRequestSchema = {
  body: z.object({
    providerName: z.string().min(2, 'POS adı en az 2 karakter olmalıdır'),
    country: z.string().length(2, '2 haneli ülke kodu girilmelidir (örn: TR, US)'),
    website: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
    notes: z.string().optional(),
  }),
};

router.post('/request', validate(posRequestSchema), async (req: AuthRequest, res, next) => {
  try {
    const result = await posService.submitPosRequest(
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.status(201).json({
      success: true,
      data: result,
      message: 'POS entegrasyon talebiniz alındı. Ekibimiz sizinle iletişime geçecektir.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
