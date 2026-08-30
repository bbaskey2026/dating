import { ChatsApi } from '../endpoints/chats.endpoint';
import { HttpService } from './http.service';
import { goChatApiClient } from '../client';
import type { ApiResponse } from '../types';

export class ChatsService {
  static async checkChatHealth(): Promise<boolean> {
    try {
      await HttpService.getService(ChatsApi.url.health, undefined, goChatApiClient);
      return true;
    } catch {
      return false;
    }
  }

  static async getChatHistory(recipientId: string): Promise<ApiResponse> {
    return HttpService.getService<ApiResponse>(`${ChatsApi.url.history}/${recipientId}`, undefined, goChatApiClient);
  }

  static async sendMessage(recipientId: string, content: string): Promise<ApiResponse> {
    return HttpService.postService<ApiResponse>(ChatsApi.url.send, { recipientId, content }, undefined, goChatApiClient);
  }
}
