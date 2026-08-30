import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface RequestWithId extends Request {
  requestId?: string;
}

function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  if (sanitized.password) sanitized.password = '***[REDACTED]***';
  if (sanitized.passwordHash) sanitized.passwordHash = '***[REDACTED]***';
  return sanitized;
}

export function requestLogger(req: RequestWithId, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  
  req.requestId = requestId;
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  // Capture response payload for data logging
  const originalJson = res.json;
  let responseBody: any = null;

  res.json = function (body: any): Response {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.on('finish', () => {
    const responseTimeMs = Date.now() - startTime;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`HTTP ${req.method} ${req.originalUrl}`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTimeMs: `${responseTimeMs}ms`,
      requestData: sanitizeData(req.body),
      responseData: responseBody ? sanitizeData(responseBody) : null,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown',
    });
  });

  next();
}
