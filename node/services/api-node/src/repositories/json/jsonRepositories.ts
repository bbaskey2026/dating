import fs from 'fs';
import path from 'path';
import { UserProfile, Like, Match } from '@topolgira/shared-types';
import { UserRecord, IUserRepository, IProfileRepository, ILikeRepository, IMatchRepository, Repositories } from '../interfaces';

interface DbSchema {
  users: UserRecord[];
  profiles: UserProfile[];
  likes: Like[];
  matches: Match[];
}

export class JsonFileStore {
  private filePath: string;
  private db: DbSchema;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(__dirname, '../../db.json');
    this.db = this.load();
  }

  private load(): DbSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn(`Failed to read ${this.filePath}, initializing fresh store.`);
    }
    return { users: [], profiles: [], likes: [], matches: [] };
  }

  public save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error saving db.json to ${this.filePath}:`, err);
    }
  }

  public get data(): DbSchema {
    return this.db;
  }
}

export class JsonUserRepository implements IUserRepository {
  constructor(private store: JsonFileStore) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = this.store.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = this.store.data.users.find(u => u.id === id);
    return user || null;
  }

  async create(user: UserRecord): Promise<UserRecord> {
    this.store.data.users.push(user);
    this.store.save();
    return user;
  }
}

export class JsonProfileRepository implements IProfileRepository {
  constructor(private store: JsonFileStore) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const profile = this.store.data.profiles.find(p => p.userId === userId);
    return profile || null;
  }

  async findById(id: string): Promise<UserProfile | null> {
    const profile = this.store.data.profiles.find(p => p.id === id || p.userId === id);
    return profile || null;
  }

  async create(profile: UserProfile): Promise<UserProfile> {
    this.store.data.profiles.push(profile);
    this.store.save();
    return profile;
  }

  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const index = this.store.data.profiles.findIndex(p => p.userId === userId);
    if (index === -1) return null;

    const existing = this.store.data.profiles[index];
    const updated: UserProfile = {
      ...existing,
      ...updates,
      userId,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.store.data.profiles[index] = updated;
    this.store.save();
    return updated;
  }

  async findAll(): Promise<UserProfile[]> {
    return this.store.data.profiles;
  }
}

export class JsonLikeRepository implements ILikeRepository {
  constructor(private store: JsonFileStore) {}

  async create(like: Like): Promise<Like> {
    this.store.data.likes.push(like);
    this.store.save();
    return like;
  }

  async findByPair(fromUserId: string, toUserId: string): Promise<Like | null> {
    const like = this.store.data.likes.find(l => l.fromUserId === fromUserId && l.toUserId === toUserId);
    return like || null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.store.data.likes.findIndex(l => l.id === id);
    if (index === -1) return false;
    this.store.data.likes.splice(index, 1);
    this.store.save();
    return true;
  }
}

export class JsonMatchRepository implements IMatchRepository {
  constructor(private store: JsonFileStore) {}

  async create(match: Match): Promise<Match> {
    this.store.data.matches.push(match);
    this.store.save();
    return match;
  }

  async findByUserId(userId: string): Promise<Match[]> {
    return this.store.data.matches.filter(
      m => (m.userAId === userId || m.userBId === userId) && m.isActive
    );
  }

  async findById(id: string): Promise<Match | null> {
    const match = this.store.data.matches.find(m => m.id === id);
    return match || null;
  }
}

export function createJsonRepositories(filePath?: string): Repositories {
  const store = new JsonFileStore(filePath);
  return {
    users: new JsonUserRepository(store),
    profiles: new JsonProfileRepository(store),
    likes: new JsonLikeRepository(store),
    matches: new JsonMatchRepository(store),
  };
}
