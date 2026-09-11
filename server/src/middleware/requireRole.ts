import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * RBAC middleware — restricts a route to users with one of the specified roles.
 * The role is embedded in the JWT payload by authController at login time.
 * Roles: 'ADMIN' | 'DELIVERY' | 'CLIENT'
 */
export const requireRole = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const userRole = req.user.role || 'CLIENT';
  if (!roles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: `Access denied: requires one of [${roles.join(', ')}]`,
    });
  }

  next();
};

export default requireRole;
