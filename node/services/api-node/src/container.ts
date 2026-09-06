import { AppConfig, loadConfig } from './config/config';
import { createRepositories, DbDriver } from './repositories/factory';
import { Repositories } from './repositories/interfaces';

// External Clients
import { GoUserClient, IGoUserClient } from './clients/goUserClient';
import { GoMatchingClient, IGoMatchingClient } from './clients/goMatchingClient';

// Domain Services
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { LikeService } from './services/like.service';
import { ChatService } from './services/chat.service';
import { DashboardService } from './services/dashboard.service';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { ProfileController } from './controllers/profile.controller';
import { LikeController } from './controllers/like.controller';
import { ChatController } from './controllers/chat.controller';
import { DashboardController } from './controllers/dashboard.controller';

export interface ServiceContainer {
  config: AppConfig;
  repositories: Repositories;
  clients: {
    goUser: IGoUserClient;
    goMatching: IGoMatchingClient;
  };
  services: {
    auth: AuthService;
    profile: ProfileService;
    like: LikeService;
    chat: ChatService;
    dashboard: DashboardService;
  };
  controllers: {
    auth: AuthController;
    profile: ProfileController;
    like: LikeController;
    chat: ChatController;
    dashboard: DashboardController;
  };
}

export function createContainer(driver?: DbDriver): ServiceContainer {
  const config = loadConfig();
  const selectedDriver = driver || config.dbDriver;
  const repositories = createRepositories(selectedDriver);

  // 1. External Clients
  const goUserClient = new GoUserClient(config.goUserServiceUrl);
  const goMatchingClient = new GoMatchingClient(config.goMatchingServiceUrl);

  // 2. Domain Services
  const authService = new AuthService(repositories.users, repositories.profiles, goUserClient, config);
  const profileService = new ProfileService(repositories.profiles);
  const likeService = new LikeService(
    repositories.likes,
    repositories.matches,
    repositories.profiles,
    repositories.chats,
    goMatchingClient
  );
  const chatService = new ChatService(repositories.chats, repositories.profiles, repositories.matches);
  const dashboardService = new DashboardService(
    repositories.users,
    repositories.profiles,
    repositories.matches,
    goUserClient,
    goMatchingClient
  );

  // 3. Controllers
  const authController = new AuthController(authService);
  const profileController = new ProfileController(profileService);
  const likeController = new LikeController(likeService);
  const chatController = new ChatController(chatService);
  const dashboardController = new DashboardController(dashboardService);

  return {
    config,
    repositories,
    clients: {
      goUser: goUserClient,
      goMatching: goMatchingClient,
    },
    services: {
      auth: authService,
      profile: profileService,
      like: likeService,
      chat: chatService,
      dashboard: dashboardService,
    },
    controllers: {
      auth: authController,
      profile: profileController,
      like: likeController,
      chat: chatController,
      dashboard: dashboardController,
    },
  };
}
