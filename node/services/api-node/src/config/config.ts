export interface AppConfig {
  port: number;
  nodeEnv: string;
  dbDriver: 'postgres' | 'json';
  databaseUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  goUserServiceUrl: string;
  goMatchingServiceUrl: string;
  goChatServiceUrl: string;
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    dbDriver: (process.env.DB_DRIVER as 'postgres' | 'json') || 'postgres',
    databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/topolgira',
    jwtSecret: process.env.JWT_SECRET || 'topolgira_super_secret_jwt_key_2026',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'topolgira_refresh_secret_key_2026',
    goUserServiceUrl: process.env.GO_USER_SERVICE_URL || 'http://localhost:8081',
    goMatchingServiceUrl: process.env.GO_MATCHING_SERVICE_URL || 'http://localhost:8080',
    goChatServiceUrl: process.env.GO_CHAT_SERVICE_URL || 'http://localhost:9000',
  };
}
