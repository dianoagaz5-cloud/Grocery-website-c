import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * Validates the JWT stored in the HttpOnly cookie `access_token`.
 * Falls back to Authorization: Bearer header for legacy compatibility.
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Primary: read from HttpOnly cookie
  let token: string | undefined = req.cookies?.access_token;

  // Fallback: Authorization: Bearer header (for API clients / delivery app)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_jwt_secret'
    ) as { id: string; email: string; role?: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
