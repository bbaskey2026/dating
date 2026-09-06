import { Response, Router } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '@topolgira/shared-types';
import { logger } from '../utils/logger';

const FILE_PATH = 'src/controllers/dashboard.controller.ts';

export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  registerRoutes(): Router {
    const router = Router();

    router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('getUserDashboardHandler', FILE_PATH, { route: '/dashboard/me', userId: req.user?.userId }, async () => {
        try {
          const data = await this.dashboardService.getUserDashboard(req.user!.userId);
          const resp: ApiResponse = {
            success: true,
            message: 'User Dashboard metrics fetched successfully',
            data,
          };
          return res.status(200).json(resp);
        } catch (err: any) {
          const status = err.message.includes('not found') ? 404 : 500;
          return res.status(status).json({ success: false, error: err.message });
        }
      });
    });

    return router;
  }
}
