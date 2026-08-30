import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '@topolgira/shared-types';

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || 'N/A';

  logger.error(`Unhandled Exception: ${err.message}`, {
    requestId,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  };
  return res.status(err.status || 500).json(response);
}
