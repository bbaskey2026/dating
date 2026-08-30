import { User, UserProfile, Like, Match } from '@topolgira/shared-types';

export interface UserRecord extends User {
  passwordHash: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(user: UserRecord): Promise<UserRecord>;
}

export interface IProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  findById(id: string): Promise<UserProfile | null>;
  create(profile: UserProfile): Promise<UserProfile>;
  update(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null>;
  findAll(): Promise<UserProfile[]>;
}

export interface ILikeRepository {
  create(like: Like): Promise<Like>;
  findByPair(fromUserId: string, toUserId: string): Promise<Like | null>;
  delete(id: string): Promise<boolean>;
}

export interface IMatchRepository {
  create(match: Match): Promise<Match>;
  findByUserId(userId: string): Promise<Match[]>;
  findById(id: string): Promise<Match | null>;
}

export interface Repositories {
  users: IUserRepository;
  profiles: IProfileRepository;
  likes: ILikeRepository;
  matches: IMatchRepository;
}
