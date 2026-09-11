import { Router } from 'express';
import {
  partnerLogin,
  getMyDeliveries,
  updateDeliveryStatus,
  completeDeliveryWithOtp,
  updatePartnerLocation,
} from '../controllers/deliveryPartnerController';
import { deliveryAuthMiddleware } from '../middleware/deliveryAuth';

const router = Router();

router.post('/login', partnerLogin as any);

// Protected delivery partner actions
router.use(deliveryAuthMiddleware as any);
router.get('/deliveries', getMyDeliveries as any);
router.put('/deliveries/:id/status', updateDeliveryStatus as any);
router.post('/deliveries/:id/complete', completeDeliveryWithOtp as any);
router.post('/location', updatePartnerLocation as any);

export default router;
