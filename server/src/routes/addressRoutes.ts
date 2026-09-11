import { Router } from 'express';
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware as any);

router.get('/', getUserAddresses as any);
router.post('/', createAddress as any);
router.put('/:id', updateAddress as any);
router.delete('/:id', deleteAddress as any);
router.patch('/:id/default', setDefaultAddress as any);

export default router;
