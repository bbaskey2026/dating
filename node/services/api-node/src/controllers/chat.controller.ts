import { Response, Router } from 'express';
import { ChatService } from '../services/chat.service';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '@topolgira/shared-types';
import { logger } from '../utils/logger';

const FILE_PATH = 'src/controllers/chat.controller.ts';

export class ChatController {
  constructor(private chatService: ChatService) {}

  registerRoutes(): Router {
    const router = Router();

    router.get('/recent', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('getRecentChatsHandler', FILE_PATH, { userId: req.user?.userId }, async () => {
        try {
          const conversations = await this.chatService.getRecentConversations(req.user!.userId);
          const resp: ApiResponse = { success: true, data: conversations };
          return res.status(200).json(resp);
        } catch (err: any) {
          return res.status(500).json({ success: false, error: err.message });
        }
      });
    });

    router.get('/:partnerId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('getChatMessagesHandler', FILE_PATH, { userId: req.user?.userId, partnerId: req.params.partnerId }, async () => {
        try {
          const messages = await this.chatService.getMessages(req.user!.userId, req.params.partnerId, 100);
          const resp: ApiResponse = { success: true, data: messages };
          return res.status(200).json(resp);
        } catch (err: any) {
          return res.status(500).json({ success: false, error: err.message });
        }
      });
    });

    router.post('/:partnerId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('sendChatMessagePersistentHandler', FILE_PATH, { userId: req.user?.userId, partnerId: req.params.partnerId }, async () => {
        try {
          const saved = await this.chatService.sendMessage(
            req.user!.userId,
            req.params.partnerId,
            req.body.content,
            req.body.messageType
          );
          const resp: ApiResponse = {
            success: true,
            message: 'Message saved to database',
            data: saved,
          };
          return res.status(201).json(resp);
        } catch (err: any) {
          return res.status(400).json({ success: false, error: err.message });
        }
      });
    });

    return router;
  }
}
