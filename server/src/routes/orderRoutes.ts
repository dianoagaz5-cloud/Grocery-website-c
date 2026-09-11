import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateLiveLocation,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware as any);

router.post('/', createOrder as any);
router.get('/my-orders', getMyOrders as any);
router.get('/:id', getOrderById as any);
router.put('/:id/location', updateLiveLocation as any);

export default router;
