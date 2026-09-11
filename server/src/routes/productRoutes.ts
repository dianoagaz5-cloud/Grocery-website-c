import { Router } from 'express';
import {
  getAllProducts,
  getFlashDeals,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

router.get('/', getAllProducts);
router.get('/deals', getFlashDeals);
router.get('/:id', getProductById);

// Admin-protected product routes
router.post('/', authMiddleware as any, adminMiddleware as any, createProduct);
router.put('/:id', authMiddleware as any, adminMiddleware as any, updateProduct);
router.delete('/:id', authMiddleware as any, adminMiddleware as any, deleteProduct);

export default router;
