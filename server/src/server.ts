import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { serve } from 'inngest/express';

import { inngest, inngestFunctions } from './inngest';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import addressRoutes from './routes/addressRoutes';
import adminRoutes from './routes/adminRoutes';
import deliveryPartnerRoutes from './routes/deliveryPartnerRoutes';
import webhookRoutes from './routes/webhookRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// Raw body for Stripe Webhook before express.json
app.use('/api/webhooks', webhookRoutes);

// JSON and URL-encoded parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'InstantMart API' });
});

// Inngest Serve Handler
app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions: inngestFunctions,
  })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryPartnerRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 InstantMart API Server listening on port ${PORT}`);
  console.log(`📡 Inngest endpoint active at http://localhost:${PORT}/api/inngest`);
});

export default app;
