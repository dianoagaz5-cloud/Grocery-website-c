import { Router } from 'express';
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  assignDeliveryPartner,
  getAllDeliveryPartners,
  createDeliveryPartner,
  toggleDeliveryPartnerStatus,
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

router.use(authMiddleware as any);
router.use(adminMiddleware as any);

router.get('/stats', getDashboardStats as any);
router.get('/orders', getAllOrders as any);
router.put('/orders/:id/status', updateOrderStatus as any);
router.put('/orders/:id/assign', assignDeliveryPartner as any);

router.get('/delivery-partners', getAllDeliveryPartners as any);
router.post('/delivery-partners', createDeliveryPartner as any);
router.patch('/delivery-partners/:id/toggle', toggleDeliveryPartnerStatus as any);

export default router;
