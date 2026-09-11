import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware as any, getProfile as any);
router.put('/profile', authMiddleware as any, updateProfile as any);

export default router;
