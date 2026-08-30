import {
  AuthService,
  MatchesService,
  DashboardService,
  HealthService,
} from '../api';
import type { RegisterPayload, Candidate } from '../api/types';

export type { RegisterPayload, Candidate };

export class EnterpriseApiClient {
  // 1. NODE API: AUTHENTICATION
  static async login(email: string, password: string) {
    return AuthService.login(email, password);
  }

  static async register(payload: RegisterPayload) {
    return AuthService.register(payload);
  }

  static async logout(refreshToken?: string) {
    return AuthService.logout(refreshToken);
  }

  // 2. NODE API: PROFILES & CATALOG
  static async getProfiles() {
    return MatchesService.getProfiles();
  }

  // 3. NODE API: DASHBOARD METRICS
  static async getDashboard(token: string) {
    return DashboardService.getDashboard(token);
  }

  // 4. NODE API: LIKES & MATCHES
  static async sendLike(toUserId: string, token: string) {
    return MatchesService.sendLike(toUserId, token);
  }

  static async getMatches(token: string) {
    return MatchesService.getMatches(token);
  }

  // 5. GO MATCHING ENGINE: ALGORITHMIC RECOMMENDATIONS
  static async getRecommendations(targetProfile: any, candidates: any[]) {
    return MatchesService.getRecommendations(targetProfile, candidates);
  }

  // 6. MICROSERVICES HEALTH STATUS MONITORING
  static async checkServicesHealth() {
    return HealthService.checkServicesHealth();
  }
}
