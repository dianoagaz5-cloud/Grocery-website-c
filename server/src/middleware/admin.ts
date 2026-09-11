import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com')
    .split(',')
    .map((e) => e.trim().toLowerCase());

  if (!adminEmails.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }

  next();
};

export default adminMiddleware;
