import { HttpService } from './http.service';
import { nodeApiClient, goChatApiClient } from '../client';
import type { ApiResponse } from '../types';

export class ChatsService {
  static async checkChatHealth(): Promise<boolean> {
    try {
      await HttpService.getService('health', undefined, goChatApiClient);
      return true;
    } catch {
      return false;
    }
  }

  static async getChatHistory(partnerId: string): Promise<ApiResponse<any[]>> {
    return HttpService.getService<ApiResponse<any[]>>(`chats/${partnerId}/messages`, undefined, nodeApiClient);
  }

  static async sendMessage(partnerId: string, content: string): Promise<ApiResponse<any>> {
    return HttpService.postService<ApiResponse<any>>(`chats/${partnerId}/messages`, { content }, undefined, nodeApiClient);
  }

  static async getRecentConversations(): Promise<ApiResponse<any[]>> {
    return HttpService.getService<ApiResponse<any[]>>(`chats/recent`, undefined, nodeApiClient);
  }
}

