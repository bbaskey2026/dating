import { Response, Router } from 'express';
import { LikeService } from '../services/like.service';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '@topolgira/shared-types';
import { logger } from '../utils/logger';

const FILE_PATH = 'src/controllers/like.controller.ts';

export class LikeController {
  constructor(private likeService: LikeService) {}

  registerRoutes(): Router {
    const router = Router();

    router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('createLikeHandler', FILE_PATH, { route: '/likes', fromUserId: req.user?.userId, toUserId: req.body.toUserId }, async () => {
        try {
          const result = await this.likeService.createLike(req.user!.userId, req.body.toUserId);
          const resp: ApiResponse = {
            success: true,
            message: result.isMatch ? 'ITS_A_MATCH' : 'Like sent successfully',
            data: result,
          };
          return res.status(201).json(resp);
        } catch (err: any) {
          const status = err.message.includes('Already liked') ? 409 : 400;
          return res.status(status).json({ success: false, error: err.message });
        }
      });
    });

    router.get('/matches', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('getMatchesHandler', FILE_PATH, { route: '/likes/matches', userId: req.user?.userId }, async () => {
        try {
          const matches = await this.likeService.getMatches(req.user!.userId);
          return res.status(200).json({ success: true, data: matches });
        } catch (err: any) {
          return res.status(500).json({ success: false, error: err.message });
        }
      });
    });

    return router;
  }
}
