import { Router } from 'express';
import { z } from 'zod';
import { register, login, logout, refresh, getProfile, updateProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Zod schemas ──────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Public routes (rate-limited) ─────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), register as any);
router.post('/login',    authLimiter, validate(loginSchema),    login    as any);
router.post('/refresh',  refresh as any);
router.post('/logout',   logout  as any);

// ─── Protected routes ─────────────────────────────────────────────────────────
router.get('/profile',  authMiddleware as any, getProfile    as any);
router.put('/profile',  authMiddleware as any, updateProfile as any);

export default router;
