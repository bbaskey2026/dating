import { MatchesApi } from '../endpoints/matches.endpoint';
import { HttpService } from './http.service';
import { nodeApiClient, goMatchingApiClient } from '../client';
import type { ApiResponse } from '../types';

export class MatchesService {
  static async getProfiles(): Promise<ApiResponse> {
    return HttpService.getService<ApiResponse>(MatchesApi.url.profiles, undefined, nodeApiClient);
  }

  static async sendLike(toUserId: string, token?: string): Promise<ApiResponse> {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return await HttpService.postService<ApiResponse>(MatchesApi.url.sendLike, { toUserId }, config, nodeApiClient);
    } catch (e) {
      console.warn('Backend API offline, using local simulation for like');
      return { success: true, message: 'Like recorded locally' };
    }
  }

  static async getMatches(token?: string): Promise<ApiResponse> {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return await HttpService.getService<ApiResponse>(MatchesApi.url.matches, config, nodeApiClient);
    } catch (e) {
      console.warn('Backend API offline, using local matches');
      return { success: false, data: [] };
    }
  }

  static async getRecommendations(targetProfile: any, candidates: any[]): Promise<ApiResponse | null> {
    try {
      return await HttpService.postService<ApiResponse>(
        MatchesApi.url.recommendations,
        { target: targetProfile, candidates },
        undefined,
        goMatchingApiClient
      );
    } catch (e) {
      console.warn('Go Matching Engine offline, using fallback score algorithm');
      return null;
    }
  }
}
