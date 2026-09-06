import { Response, Router } from 'express';
import { ProfileService } from '../services/profile.service';
import { authenticateToken, optionalAuthToken, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse, UserProfile } from '@topolgira/shared-types';
import { logger } from '../utils/logger';

const FILE_PATH = 'src/controllers/profile.controller.ts';

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  registerRoutes(): Router {
    const router = Router();

    router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('createProfileHandler', FILE_PATH, { route: '/profiles', userId: req.user?.userId }, async () => {
        try {
          const profile = await this.profileService.createOrUpsert(req.user!.userId, req.body);
          const resp: ApiResponse<UserProfile> = { success: true, data: profile };
          return res.status(200).json(resp);
        } catch (err: any) {
          return res.status(400).json({ success: false, error: err.message });
        }
      });
    });

    router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('getProfileMeHandler', FILE_PATH, { route: '/profiles/me', userId: req.user?.userId }, async () => {
        const profile = await this.profileService.getByUserId(req.user!.userId);
        if (!profile) {
          return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        return res.status(200).json({ success: true, data: profile });
      });
    });

    router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('getProfileByIdHandler', FILE_PATH, { route: `/profiles/${req.params.id}` }, async () => {
        const profile = await this.profileService.getById(req.params.id);
        if (!profile) {
          return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        return res.status(200).json({ success: true, data: profile });
      });
    });

    router.patch('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('updateProfileMeHandler', FILE_PATH, { route: '/profiles/me', userId: req.user?.userId }, async () => {
        const updated = await this.profileService.updateProfile(req.user!.userId, req.body);
        if (!updated) {
          return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        return res.status(200).json({ success: true, data: updated });
      });
    });

    router.get('/', optionalAuthToken, async (req: AuthenticatedRequest, res: Response) => {
      return logger.traceFn('listProfilesHandler', FILE_PATH, { route: '/profiles' }, async () => {
        const profiles = await this.profileService.listProfiles(req.user?.userId);
        return res.status(200).json({ success: true, data: profiles });
      });
    });

    return router;
  }
}
