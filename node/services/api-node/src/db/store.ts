import { User, UserProfile, Like, Match } from '@topolgira/shared-types';

export class DataStore {
  public users: Map<string, User & { passwordHash: string }> = new Map();
  public profiles: Map<string, UserProfile> = new Map();
  public likes: Map<string, Like> = new Map();
  public matches: Map<string, Match> = new Map();
  public otpRequests: Map<string, { code: string; expiresAt: number }> = new Map();
  public refreshTokens: Map<string, { userId: string; expiresAt: number }> = new Map();

  public clear() {
    this.users.clear();
    this.profiles.clear();
    this.likes.clear();
    this.matches.clear();
    this.otpRequests.clear();
    this.refreshTokens.clear();
  }
}

export const store = new DataStore();
