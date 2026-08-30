import { HealthApi } from '../endpoints/health.endpoint';
import { HttpService } from './http.service';
import { nodeApiClient, goMatchingApiClient, goChatApiClient } from '../client';
import type { ServiceHealthStatus } from '../types';

export class HealthService {
  static async checkServicesHealth(): Promise<ServiceHealthStatus> {
    const results: ServiceHealthStatus = {
      nodeApi: false,
      goMatching: false,
      goChat: false,
    };

    try {
      await HttpService.getService(HealthApi.url.nodeHealth, undefined, nodeApiClient);
      results.nodeApi = true;
    } catch {
      results.nodeApi = false;
    }

    try {
      await HttpService.getService(HealthApi.url.goMatchingHealth, undefined, goMatchingApiClient);
      results.goMatching = true;
    } catch {
      results.goMatching = false;
    }

    try {
      await HttpService.getService(HealthApi.url.goChatHealth, undefined, goChatApiClient);
      results.goChat = true;
    } catch {
      results.goChat = false;
    }

    return results;
  }
}
