import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface DeliveryAuthRequest extends Request {
  partner?: {
    id: string;
    email: string;
  };
}

export const deliveryAuthMiddleware = (req: DeliveryAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Delivery partner token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret') as { id: string; email: string };
    req.partner = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired delivery partner token' });
  }
};

export default deliveryAuthMiddleware;
