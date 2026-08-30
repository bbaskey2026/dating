import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createAuthRouter } from './modules/auth/auth.controller';
import { createProfilesRouter } from './modules/profiles/profiles.controller';
import { createLikesRouter } from './modules/likes/likes.controller';
import { createDashboardRouter } from './modules/dashboard/dashboard.controller';
import { createRepositories, DbDriver } from './repositories/factory';
import { requestLogger } from './middleware/requestLogger';
import { globalErrorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { ApiResponse } from '@topolgira/shared-types';

export function createApp(driver?: DbDriver) {
  const app = express();

  // Manual Wiring Dependency Injection
  const repos = createRepositories(driver);

  app.use(cors());
  app.use(express.json());

  // Production Structured HTTP Request Logger
  app.use(requestLogger);

  // Rate Limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests from this IP' },
  });
  app.use(limiter);

  // Mount Routers with Injected Repositories
  app.use('/auth', createAuthRouter(repos));
  app.use('/profiles', createProfilesRouter(repos));
  app.use('/likes', createLikesRouter(repos));
  app.use('/dashboard', createDashboardRouter(repos));

  // Health Check Endpoint
  app.get('/health', (req: Request, res: Response) => {
    const resp: ApiResponse = {
      success: true,
      message: 'Topolgira Node.js API Service healthy',
      data: {
        driver: process.env.DB_DRIVER || 'json',
        env: process.env.NODE_ENV || 'development',
      },
    };
    res.status(200).json(resp);
  });

  // Global Error Handling Middleware
  app.use(globalErrorHandler);

  return { app, repos };
}

const { app } = createApp();

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`Topolgira Node.js API Service started`, {
      port: PORT,
      driver: process.env.DB_DRIVER || 'json',
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  });

  // Graceful Shutdown Handlers
  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down Topolgira Node API...`);
    server.close(() => {
      logger.info('HTTP server closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error(`Unhandled Promise Rejection: ${reason}`);
  });
}
