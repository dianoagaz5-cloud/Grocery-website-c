import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { serve } from 'inngest/express';

import { inngest, inngestFunctions } from './inngest';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import addressRoutes from './routes/addressRoutes';
import adminRoutes from './routes/adminRoutes';
import deliveryPartnerRoutes from './routes/deliveryPartnerRoutes';
import webhookRoutes from './routes/webhookRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ─── Security headers (OWASP) ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow Inngest dashboard
  contentSecurityPolicy: IS_PROD,
}));

// ─── CORS — strict origin from env ────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman in dev) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true, // Required for HttpOnly cookies
}));

// ─── Cookie parser (required for HttpOnly JWT cookies) ────────────────────────
app.use(cookieParser());

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Raw body for Stripe Webhook before express.json ─────────────────────────
app.use('/api/webhooks', webhookRoutes);

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'InstantMart API' });
});

// ─── Inngest Serve Handler ─────────────────────────────────────────────────────
app.use('/api/inngest', serve({ client: inngest, functions: inngestFunctions }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/delivery', deliveryPartnerRoutes);
app.use('/api/upload',   uploadRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// ─── Global Error Handler — masks stack traces in production ──────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  // Log full error server-side
  console.error(`[${new Date().toISOString()}] Error ${status}:`, err);

  // Never expose internals to clients in production
  const message = IS_PROD && status === 500
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  res.status(status).json({ success: false, message });
});

app.listen(PORT, () => {
  console.log(`🚀 InstantMart API Server listening on port ${PORT}`);
  console.log(`🔒 CORS allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`📡 Inngest endpoint active at http://localhost:${PORT}/api/inngest`);
});

export default app;
