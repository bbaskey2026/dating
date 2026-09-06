import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createContainer, ServiceContainer } from './container';
import { DbDriver } from './repositories/factory';
import { requestLogger } from './middleware/requestLogger';
import { globalErrorHandler } from './middleware/errorHandler';
import { ApiResponse } from '@topolgira/shared-types';

export function createApp(driver?: DbDriver): { app: Express; container: ServiceContainer; repos: ServiceContainer['repositories'] } {
  const container = createContainer(driver);
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // Mount modular Controller routes via DI
  app.use('/auth', container.controllers.auth.registerRoutes());
  app.use('/profiles', container.controllers.profile.registerRoutes());
  app.use('/likes', container.controllers.like.registerRoutes());
  app.use('/chats', container.controllers.chat.registerRoutes());
  app.use('/dashboard', container.controllers.dashboard.registerRoutes());

  // Health Check Endpoint
  app.get('/health', (req: Request, res: Response) => {
    const resp: ApiResponse = {
      success: true,
      message: 'Topolgira Node.js API Service healthy (DI Architecture)',
      data: {
        driver: container.config.dbDriver,
        env: container.config.nodeEnv,
        pattern: 'Dependency Injection (DI)',
      },
    };
    res.status(200).json(resp);
  });

  // Global Error Handling Middleware
  app.use(globalErrorHandler);

  return { app, container, repos: container.repositories };
}
