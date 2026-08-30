import { DashboardApi } from '../endpoints/dashboard.endpoint';
import { HttpService } from './http.service';
import type { ApiResponse } from '../types';

export class DashboardService {
  static async getDashboard(token?: string): Promise<ApiResponse> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    return HttpService.getService<ApiResponse>(DashboardApi.url.me, config);
  }
}
