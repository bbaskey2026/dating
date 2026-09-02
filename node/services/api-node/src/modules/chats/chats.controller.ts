import { Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth';
import { ApiResponse } from '@topolgira/shared-types';
import { Repositories, ChatMessageRecord } from '../../repositories/interfaces';
import { logger } from '../../utils/logger';

const FILE_PATH = 'src/modules/chats/chats.controller.ts';

export function createChatsRouter(repos: Repositories): Router {
  const router = Router();

  /**
   * GET /chats/recent
   * Fetch list of active chat conversations for the current user
   */
  router.get('/recent', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('getRecentChatsHandler', FILE_PATH, { userId: req.user?.userId }, async () => {
      const userId = req.user!.userId;
      const conversations = await repos.chats.getRecentConversations(userId);

      const detailed = await Promise.all(
        conversations.map(async (c) => {
          const partnerId = c.userAId === userId ? c.userBId : c.userAId;
          const partnerProfile = await repos.profiles.findByUserId(partnerId);
          return {
            ...c,
            partner: partnerProfile || { userId: partnerId, name: 'Matched Contact' },
          };
        })
      );

      const resp: ApiResponse = {
        success: true,
        data: detailed,
      };
      return res.status(200).json(resp);
    });
  });

  /**
   * GET /chats/:partnerId/messages
   * Fetch chat message history from PostgreSQL between user and partnerId
   */
  router.get('/:partnerId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('getChatMessagesHandler', FILE_PATH, { userId: req.user?.userId, partnerId: req.params.partnerId }, async () => {
      const userId = req.user!.userId;
      const partnerId = req.params.partnerId;

      const messages = await repos.chats.getMessages(userId, partnerId, 100);

      const resp: ApiResponse = {
        success: true,
        data: messages,
      };
      return res.status(200).json(resp);
    });
  });

  /**
   * POST /chats/:partnerId/messages
   * Persist a new message into PostgreSQL
   */
  router.post('/:partnerId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('sendChatMessagePersistentHandler', FILE_PATH, { userId: req.user?.userId, partnerId: req.params.partnerId }, async () => {
      const userId = req.user!.userId;
      const partnerId = req.params.partnerId;
      const { content, messageType } = req.body;

      if (!content || !content.trim()) {
        const resp: ApiResponse = { success: false, error: 'Content is required' };
        return res.status(400).json(resp);
      }

      const chatId = 'chat_' + [userId, partnerId].sort().join('_');
      const newMsg: ChatMessageRecord = {
        id: uuidv4(),
        chatId,
        senderId: userId,
        receiverId: partnerId,
        messageType: messageType || 'message',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      const saved = await repos.chats.saveMessage(newMsg);

      const resp: ApiResponse = {
        success: true,
        message: 'Message saved to database',
        data: saved,
      };
      return res.status(201).json(resp);
    });
  });

  return router;
}
