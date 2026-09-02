import { MatchesApi } from '../endpoints/matches.endpoint';
import { HttpService } from './http.service';
import { nodeApiClient, goMatchingApiClient, getActiveToken } from '../client';
import type { ApiResponse } from '../types';

export class MatchesService {
  static async getProfiles(token?: string): Promise<ApiResponse> {
    const activeToken = token || getActiveToken();
    const config = activeToken ? { headers: { Authorization: `Bearer ${activeToken}` } } : undefined;
    return HttpService.getService<ApiResponse>(MatchesApi.url.profiles, config, nodeApiClient);
  }

  static async sendLike(toUserId: string, token?: string): Promise<ApiResponse> {
    try {
      const activeToken = token || getActiveToken();
      const config = activeToken ? { headers: { Authorization: `Bearer ${activeToken}` } } : undefined;
      return await HttpService.postService<ApiResponse>(MatchesApi.url.sendLike, { toUserId }, config, nodeApiClient);
    } catch (e: any) {
      console.warn('Like request error:', e?.response?.data || e.message);
      return e?.response?.data || { success: false, error: 'Could not record like' };
    }
  }

  static async getMatches(token?: string): Promise<ApiResponse> {
    try {
      const activeToken = token || getActiveToken();
      if (!activeToken) return { success: true, data: [] };
      const config = { headers: { Authorization: `Bearer ${activeToken}` } };
      return await HttpService.getService<ApiResponse>(MatchesApi.url.matches, config, nodeApiClient);
    } catch {
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
