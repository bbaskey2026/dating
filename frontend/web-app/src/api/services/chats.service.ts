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
    try {
      return await HttpService.getService<ApiResponse<any[]>>(`chats/${partnerId}/messages`, undefined, nodeApiClient);
    } catch (e: any) {
      return e?.response?.data || { success: false, data: [] };
    }
  }

  static async sendMessage(partnerId: string, content: string): Promise<ApiResponse<any>> {
    try {
      return await HttpService.postService<ApiResponse<any>>(`chats/${partnerId}/messages`, { content }, undefined, nodeApiClient);
    } catch (e: any) {
      return e?.response?.data || { success: false, error: 'Failed to send message' };
    }
  }

  static async getRecentConversations(): Promise<ApiResponse<any[]>> {
    try {
      return await HttpService.getService<ApiResponse<any[]>>(`chats/recent`, undefined, nodeApiClient);
    } catch (e: any) {
      return e?.response?.data || { success: false, data: [] };
    }
  }
}

