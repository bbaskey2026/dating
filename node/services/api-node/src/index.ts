import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { createApp } from './app';
import { logger } from './utils/logger';

export { createApp } from './app';

const { app, container } = createApp();
const PORT = container.config.port || 4000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Topolgira Node.js API Service started (DI Pattern)`, {
      port: PORT,
      driver: container.config.dbDriver,
      nodeEnv: container.config.nodeEnv,
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
