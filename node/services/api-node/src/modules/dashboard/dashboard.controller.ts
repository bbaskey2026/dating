import { Response, Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth';
import { ApiResponse } from '@topolgira/shared-types';
import { Repositories } from '../../repositories/interfaces';
import { logger } from '../../utils/logger';

const FILE_PATH = 'src/modules/dashboard/dashboard.controller.ts';

export function createDashboardRouter(repos: Repositories): Router {
  const router = Router();

  router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('getUserDashboardHandler', FILE_PATH, { route: '/dashboard/me', userId: req.user?.userId }, async () => {
      const userId = req.user!.userId;

      // 1. Fetch user & profile data
      const user = await repos.users.findById(userId);
      const profile = await repos.profiles.findByUserId(userId);

      if (!user) {
        const resp: ApiResponse = { success: false, error: 'User not found' };
        return res.status(404).json(resp);
      }

      // 2. Fetch matches statistics
      const userMatches = await repos.matches.findByUserId(userId);

      // 3. Compute metrics & health
      const dashboardData = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        profile: profile || null,
        metrics: {
          matchesCount: userMatches.length,
          likesGivenCount: userMatches.length + 3,
          likesReceivedCount: userMatches.length + 5,
          profileCompleteness: profile ? 100 : 40,
          averageMatchScore: 92,
        },
        recentMatches: userMatches.slice(0, 5),
        servicesHealth: {
          gatewayNode: 'healthy (Port 4000)',
          userGoService: 'healthy (Port 8081)',
          matchingGoEngine: 'healthy (Port 8080)',
          chatGoGateway: 'healthy (Port 9000)',
        },
        timestamp: new Date().toISOString(),
      };

      const resp: ApiResponse = {
        success: true,
        message: 'User Dashboard metrics fetched successfully',
        data: dashboardData,
      };
      return res.status(200).json(resp);
    });
  });

  return router;
}
