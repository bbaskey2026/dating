import { v4 as uuidv4 } from 'uuid';
import { IChatRepository, IProfileRepository, IMatchRepository, ChatMessageRecord } from '../repositories/interfaces';

export class ChatService {
  constructor(
    private chatRepo: IChatRepository,
    private profileRepo: IProfileRepository,
    private matchRepo?: IMatchRepository
  ) {}

  async isMatched(userId: string, partnerId: string): Promise<boolean> {
    if (!this.matchRepo) return true;
    try {
      const matches = await this.matchRepo.findByUserId(userId);
      return matches.some(m => 
        (m.userAId === userId && m.userBId === partnerId) || 
        (m.userAId === partnerId && m.userBId === userId)
      );
    } catch {
      return true;
    }
  }

  async getRecentConversations(userId: string): Promise<any[]> {
    const conversations = await this.chatRepo.getRecentConversations(userId);

    return Promise.all(
      conversations.map(async (c) => {
        const partnerId = c.userAId === userId ? c.userBId : c.userAId;
        const partnerProfile = await this.profileRepo.findByUserId(partnerId);
        return {
          ...c,
          partner: partnerProfile || { userId: partnerId, name: 'Matched Contact' },
        };
      })
    );
  }

  async getMessages(userId: string, partnerId: string, limit = 100): Promise<ChatMessageRecord[]> {
    return this.chatRepo.getMessages(userId, partnerId, limit);
  }

  async sendMessage(userId: string, partnerId: string, content: string, messageType = 'message'): Promise<ChatMessageRecord> {
    if (!content || !content.trim()) {
      throw new Error('Content is required');
    }

    // Direct chat is restricted to mutual matches / friends
    if (this.matchRepo) {
      const matched = await this.isMatched(userId, partnerId);
      if (!matched && messageType !== 'system') {
        throw new Error('Direct chat is only available between mutual matches. Match with this user to unlock chatting.');
      }
    }

    const chatId = 'chat_' + [userId, partnerId].sort().join('_');
    const newMsg: ChatMessageRecord = {
      id: uuidv4(),
      chatId,
      senderId: userId,
      receiverId: partnerId,
      messageType,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    return this.chatRepo.saveMessage(newMsg);
  }
}
