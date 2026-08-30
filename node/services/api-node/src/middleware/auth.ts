import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '@topolgira/shared-types';

export const JWT_SECRET = process.env.JWT_SECRET || 'topolgira_super_secret_jwt_key_2026';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'topolgira_refresh_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const response: ApiResponse = { success: false, error: 'Authentication token missing' };
    return res.status(401).json(response);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    const response: ApiResponse = { success: false, error: 'Invalid or expired token' };
    return res.status(403).json(response);
  }
}
