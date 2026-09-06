import { v4 as uuidv4 } from 'uuid';
import { Like, Match, UserProfile } from '@topolgira/shared-types';
import { ILikeRepository, IMatchRepository, IProfileRepository, IChatRepository } from '../repositories/interfaces';
import { IGoMatchingClient } from '../clients/goMatchingClient';
import { logger } from '../utils/logger';

export interface CreateLikeResult {
  like: Like;
  isMatch: boolean;
  match?: Match;
  matchScore?: number;
  partner?: UserProfile | { userId: string; name: string };
}

export class LikeService {
  constructor(
    private likeRepo: ILikeRepository,
    private matchRepo: IMatchRepository,
    private profileRepo: IProfileRepository,
    private chatRepo: IChatRepository,
    private goMatchingClient: IGoMatchingClient
  ) {}

  async createLike(fromUserId: string, toUserId: string): Promise<CreateLikeResult> {
    if (!toUserId) {
      throw new Error('toUserId is required');
    }

    if (fromUserId === toUserId) {
      throw new Error('Cannot like yourself');
    }

    const existingLike = await this.likeRepo.findByPair(fromUserId, toUserId);
    if (existingLike) {
      throw new Error('Already liked this user');
    }

    const newLike: Like = {
      id: uuidv4(),
      fromUserId,
      toUserId,
      createdAt: new Date().toISOString(),
    };

    await this.likeRepo.create(newLike);

    // Check if the other user has already liked this user (mutual like)
    const reverseLike = await this.likeRepo.findByPair(toUserId, fromUserId);
    const isMatch = !!reverseLike;

    let createdMatch: Match | undefined = undefined;
    let calculatedScore: number | undefined = undefined;
    let partner: any = undefined;

    if (isMatch) {
      // Cross-service recommendation call to Go Matching Engine
      const fromProfile = await this.profileRepo.findByUserId(fromUserId);
      const toProfile = await this.profileRepo.findByUserId(toUserId);

      if (fromProfile && toProfile) {
        calculatedScore = await this.goMatchingClient.calculateScore(
          { id: fromProfile.userId, name: fromProfile.name, gender: fromProfile.gender, interests: fromProfile.interests },
          { id: toProfile.userId, name: toProfile.name, gender: toProfile.gender, interests: toProfile.interests }
        );
      } else {
        calculatedScore = 85;
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
        await this.matchRepo.create(createdMatch);
      } catch {
        logger.info('Match record already exists or inserted');
      }

      // Initialize chat greeting
      const chatId = 'chat_' + [fromUserId, toUserId].sort().join('_');
      try {
        await this.chatRepo.saveMessage({
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

      partner = toProfile || { userId: toUserId, name: 'Matched Candidate' };
    }

    return {
      like: newLike,
      isMatch,
      match: createdMatch,
      matchScore: calculatedScore,
      partner,
    };
  }

  async getMatches(userId: string): Promise<any[]> {
    const matches = await this.matchRepo.findByUserId(userId);
    return Promise.all(
      matches.map(async (m) => {
        const partnerId = m.userAId === userId ? m.userBId : m.userAId;
        const partnerProfile = await this.profileRepo.findByUserId(partnerId);
        return {
          matchId: m.id,
          matchedAt: m.matchedAt,
          partner: partnerProfile || { userId: partnerId, name: 'Unknown User' },
        };
      })
    );
  }
}
