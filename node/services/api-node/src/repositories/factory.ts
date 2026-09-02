import { Repositories } from './interfaces';
import { createJsonRepositories } from './json/jsonRepositories';
import { createPostgresRepositories } from './postgres/postgresRepositories';
import { logger } from '../utils/logger';

export type DbDriver = 'json' | 'postgres';

/**
 * Manual Wiring Dependency Injection Factory
 * Switches dynamically between file-based db.json and PostgreSQL real database schema
 */
export function createRepositories(driver?: DbDriver): Repositories {
  const selectedDriver = driver || (process.env.DB_DRIVER as DbDriver) || 'postgres';

  logger.info(`Wiring DI repositories container`, { driver: selectedDriver.toUpperCase() });

  switch (selectedDriver) {
    case 'postgres':
      return createPostgresRepositories();
    case 'json':
    default:
      return createJsonRepositories();
  }
}
