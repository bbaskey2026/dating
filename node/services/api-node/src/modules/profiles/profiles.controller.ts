import { Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, optionalAuthToken, AuthenticatedRequest } from '../../middleware/auth';
import { ApiResponse, UserProfile } from '@topolgira/shared-types';
import { Repositories } from '../../repositories/interfaces';
import { logger } from '../../utils/logger';

const FILE_PATH = 'src/modules/profiles/profiles.controller.ts';

export function createProfilesRouter(repos: Repositories): Router {
  const router = Router();

  router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('createProfileHandler', FILE_PATH, { route: '/profiles', userId: req.user?.userId }, async () => {
      const userId = req.user!.userId;

      const {
        name,
        age,
        gender,
        city,
        location,
        education,
        profession,
        relationshipGoal,
        bio,
        interests = [],
        languages = [],
        hobbies = [],
        foodPreferences = [],
        musicInterests = [],
        photos = [],
        preferences = {
          minAge: 18,
          maxAge: 60,
          maxDistanceKm: 50,
          preferredGenders: ['female', 'male'],
          relationshipGoals: ['marriage', 'serious_relationship'],
        },
      } = req.body;

      const existing = await repos.profiles.findByUserId(userId);
      if (existing) {
        // Upsert mode: Update existing profile if found
        const updated = await repos.profiles.update(userId, {
          name: name || existing.name,
          age: age || existing.age,
          gender: gender || existing.gender,
          city: city || existing.city,
          location: location || existing.location,
          education: education || existing.education,
          profession: profession || existing.profession,
          relationshipGoal: relationshipGoal || existing.relationshipGoal,
          bio: bio || existing.bio,
          interests: interests.length ? interests : existing.interests,
          languages: languages.length ? languages : existing.languages,
          hobbies: hobbies.length ? hobbies : existing.hobbies,
          foodPreferences: foodPreferences.length ? foodPreferences : existing.foodPreferences,
          musicInterests: musicInterests.length ? musicInterests : existing.musicInterests,
          photos: photos.length ? photos : existing.photos,
          preferences: preferences || existing.preferences,
        });

        const resp: ApiResponse<UserProfile> = { success: true, data: updated || existing };
        return res.status(200).json(resp);
      }

      if (!name || !age || !gender || !city || !relationshipGoal) {
        const resp: ApiResponse = { success: false, error: 'Name, age, gender, city, and relationshipGoal are required' };
        return res.status(400).json(resp);
      }

      const profileId = uuidv4();
      const newProfile: UserProfile = {
        id: profileId,
        userId,
        name,
        age,
        gender,
        city,
        location: location || { latitude: 23.3441, longitude: 85.3096, city, country: 'India' },
        education: education || '',
        profession: profession || '',
        relationshipGoal,
        bio: bio || '',
        interests,
        languages,
        hobbies,
        foodPreferences,
        musicInterests,
        photos,
        preferences,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await repos.profiles.create(newProfile);

      const resp: ApiResponse<UserProfile> = { success: true, data: newProfile };
      return res.status(201).json(resp);
    });
  });

  router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('getProfileMeHandler', FILE_PATH, { route: '/profiles/me', userId: req.user?.userId }, async () => {
      const userId = req.user!.userId;
      const profile = await repos.profiles.findByUserId(userId);

      if (!profile) {
        const resp: ApiResponse = { success: false, error: 'Profile not found' };
        return res.status(404).json(resp);
      }

      const resp: ApiResponse<UserProfile> = { success: true, data: profile };
      return res.status(200).json(resp);
    });
  });

  router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('getProfileByIdHandler', FILE_PATH, { route: `/profiles/${req.params.id}`, targetId: req.params.id }, async () => {
      const targetId = req.params.id;
      const profile = await repos.profiles.findById(targetId);

      if (!profile) {
        const resp: ApiResponse = { success: false, error: 'Profile not found' };
        return res.status(404).json(resp);
      }

      const resp: ApiResponse<UserProfile> = { success: true, data: profile };
      return res.status(200).json(resp);
    });
  });

  router.patch('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('updateProfileMeHandler', FILE_PATH, { route: '/profiles/me', userId: req.user?.userId }, async () => {
      const userId = req.user!.userId;
      const updatedProfile = await repos.profiles.update(userId, req.body);

      if (!updatedProfile) {
        const resp: ApiResponse = { success: false, error: 'Profile not found' };
        return res.status(404).json(resp);
      }

      const resp: ApiResponse<UserProfile> = { success: true, data: updatedProfile };
      return res.status(200).json(resp);
    });
  });

  router.get('/', optionalAuthToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('listProfilesHandler', FILE_PATH, { route: '/profiles' }, async () => {
      const allProfiles = await repos.profiles.findAll();
      const currentUserId = req.user?.userId;
      const filteredProfiles = currentUserId
        ? allProfiles.filter(p => p.userId !== currentUserId)
        : allProfiles;
      const resp: ApiResponse<UserProfile[]> = { success: true, data: filteredProfiles };
      return res.status(200).json(resp);
    });
  });

  return router;
}
