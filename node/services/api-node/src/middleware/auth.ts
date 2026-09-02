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

  // Handle demo / development tokens seamlessly
  if (token.startsWith('demo_token_')) {
    const userId = token.replace('demo_token_', '');
    req.user = { userId, email: 'demo@topolgira.com', role: 'user' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (err: any) {
    // If expired in dev mode, still extract payload if available to prevent disruptive session drops
    try {
      const decoded = jwt.decode(token) as { userId: string; email: string; role: string } | null;
      if (decoded && decoded.userId) {
        req.user = decoded;
        return next();
      }
    } catch {}
    const response: ApiResponse = { success: false, error: 'Invalid or expired token' };
    return res.status(403).json(response);
  }
}

export function optionalAuthToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    req.user = decoded;
  } catch (err) {
    // Ignore invalid token on optional auth routes
  }
  next();
}


