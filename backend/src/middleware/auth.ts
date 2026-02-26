import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export type AuthRequest = Request & {
  user?: { id: number; role: 'CUSTOMER' | 'MERCHANT_ADMIN' };
};

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(role: 'MERCHANT_ADMIN' | 'CUSTOMER') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
