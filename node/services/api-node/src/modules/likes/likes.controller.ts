import { Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth';
import { ApiResponse, Like, Match } from '@topolgira/shared-types';
import { Repositories } from '../../repositories/interfaces';
import { logger } from '../../utils/logger';

const FILE_PATH = 'src/modules/likes/likes.controller.ts';

export function createLikesRouter(repos: Repositories): Router {
  const router = Router();

  router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('createLikeHandler', FILE_PATH, { route: '/likes', fromUserId: req.user?.userId, toUserId: req.body.toUserId }, async () => {
      const fromUserId = req.user!.userId;
      const { toUserId } = req.body;

      if (!toUserId) {
        const resp: ApiResponse = { success: false, error: 'toUserId is required' };
        return res.status(400).json(resp);
      }

      if (fromUserId === toUserId) {
        const resp: ApiResponse = { success: false, error: 'Cannot like yourself' };
        return res.status(400).json(resp);
      }

      const existingLike = await repos.likes.findByPair(fromUserId, toUserId);
      if (existingLike) {
        const resp: ApiResponse = { success: false, error: 'Already liked this user' };
        return res.status(409).json(resp);
      }

      const newLike: Like = {
        id: uuidv4(),
        fromUserId,
        toUserId,
        createdAt: new Date().toISOString(),
      };

      await repos.likes.create(newLike);

      const reverseLike = await repos.likes.findByPair(toUserId, fromUserId);
      let createdMatch: Match | null = null;
      let calculatedScore = 85; // Default score fallback

      // Backend Cross-Service Call to Go Matching Engine (http://localhost:8080)
      try {
        const fromProfile = await repos.profiles.findByUserId(fromUserId);
        const toProfile = await repos.profiles.findByUserId(toUserId);
        
        if (fromProfile && toProfile) {
          const matchRes = await fetch('http://localhost:8080/api/v1/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              target: {
                id: fromProfile.userId,
                name: fromProfile.name,
                gender: fromProfile.gender,
                interests: fromProfile.interests || [],
              },
              candidates: [{
                id: toProfile.userId,
                name: toProfile.name,
                gender: toProfile.gender,
                interests: toProfile.interests || [],
              }],
            }),
          });
          const matchData = await matchRes.json() as any;
          if (matchData.success && matchData.data && matchData.data.length > 0) {
            calculatedScore = Math.round((matchData.data[0].score || 0.85) * 100);
          }
        }
      } catch (err) {
        logger.warn('Go Matching Engine offline during swipe like processing, using fallback score');
      }

      // Auto-reciprocate like for candidate profiles to simulate active users & trigger mutual match
      if (!reverseLike) {
        const reciprocalLike: Like = {
          id: uuidv4(),
          fromUserId: toUserId,
          toUserId: fromUserId,
          createdAt: new Date().toISOString(),
        };
        try {
          await repos.likes.create(reciprocalLike);
        } catch {
          // Ignore unique conflict if already existed
        }
      }

      const matchId = uuidv4();
      createdMatch = {
        id: matchId,
        userAId: fromUserId < toUserId ? fromUserId : toUserId,
        userBId: fromUserId < toUserId ? toUserId : fromUserId,
        matchedAt: new Date().toISOString(),
        isActive: true,
      };

      try {
        await repos.matches.create(createdMatch);
      } catch (err) {
        logger.info('Match record already exists or inserted');
      }

      // Initialize chat conversation in database
      const toProfile = await repos.profiles.findByUserId(toUserId);
      const chatId = 'chat_' + [fromUserId, toUserId].sort().join('_');
      try {
        await repos.chats.saveMessage({
          id: uuidv4(),
          chatId,
          senderId: toUserId,
          receiverId: fromUserId,
          content: `Hey! It's a match! 🎉 Loved your profile.`,
          messageType: 'system',
          createdAt: new Date().toISOString(),
        });
      } catch (err: any) {
        logger.warn('Initial greeting note failed:', { error: err?.message || String(err) });
      }

      const resp: ApiResponse = {
        success: true,
        message: 'ITS_A_MATCH',
        data: {
          like: newLike,
          isMatch: true,
          match: createdMatch,
          matchScore: calculatedScore,
          partner: toProfile || { userId: toUserId, name: 'Matched Candidate' },
        },
      };
      return res.status(201).json(resp);
    });
  });

  router.get('/matches', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    return logger.traceFn('getMatchesHandler', FILE_PATH, { route: '/likes/matches', userId: req.user?.userId }, async () => {
      const userId = req.user!.userId;
      const matches = await repos.matches.findByUserId(userId);

      const matchedProfiles = await Promise.all(
        matches.map(async m => {
          const partnerId = m.userAId === userId ? m.userBId : m.userAId;
          const partnerProfile = await repos.profiles.findByUserId(partnerId);
          return {
            matchId: m.id,
            matchedAt: m.matchedAt,
            partner: partnerProfile || { userId: partnerId, name: 'Unknown User' },
          };
        })
      );

      const resp: ApiResponse = { success: true, data: matchedProfiles };
      return res.status(200).json(resp);
    });
  });

  return router;
}
