import { Pool } from 'pg';
import { UserProfile, Like, Match } from '@topolgira/shared-types';
import { UserRecord, IUserRepository, IProfileRepository, ILikeRepository, IMatchRepository, Repositories } from '../interfaces';

export class PostgresUserRepository implements IUserRepository {
  constructor(private pool: Pool) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const res = await this.pool.query(
      'SELECT id, email, password_hash as "passwordHash", phone_number as "phoneNumber", role, is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1',
      [email]
    );
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const res = await this.pool.query(
      'SELECT id, email, password_hash as "passwordHash", phone_number as "phoneNumber", role, is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  async create(user: UserRecord): Promise<UserRecord> {
    await this.pool.query(
      'INSERT INTO users (id, email, password_hash, phone_number, role, is_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [user.id, user.email, user.passwordHash, user.phoneNumber, user.role, user.isVerified, user.createdAt, user.updatedAt]
    );
    return user;
  }
}

export class PostgresProfileRepository implements IProfileRepository {
  constructor(private pool: Pool) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const res = await this.pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    return res.rows[0] ? this.mapRow(res.rows[0]) : null;
  }

  async findById(id: string): Promise<UserProfile | null> {
    const res = await this.pool.query('SELECT * FROM profiles WHERE id = $1 OR user_id = $1', [id]);
    return res.rows[0] ? this.mapRow(res.rows[0]) : null;
  }

  async create(profile: UserProfile): Promise<UserProfile> {
    await this.pool.query(
      `INSERT INTO profiles (
        id, user_id, name, age, gender, city, latitude, longitude, education, profession, relationship_goal, bio,
        interests, languages, hobbies, food_preferences, music_interests, min_age_pref, max_age_pref, max_distance_km, preferred_genders, relationship_goals_pref
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        profile.id, profile.userId, profile.name, profile.age, profile.gender, profile.city,
        profile.location.latitude, profile.location.longitude, profile.education, profile.profession,
        profile.relationshipGoal, profile.bio, profile.interests, profile.languages, profile.hobbies,
        profile.foodPreferences, profile.musicInterests, profile.preferences.minAge, profile.preferences.maxAge,
        profile.preferences.maxDistanceKm, profile.preferences.preferredGenders, profile.preferences.relationshipGoals
      ]
    );
    return profile;
  }

  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const existing = await this.findByUserId(userId);
    if (!existing) return null;

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await this.pool.query(
      `UPDATE profiles SET
        name = $1, age = $2, gender = $3, city = $4, latitude = $5, longitude = $6, education = $7, profession = $8,
        relationship_goal = $9, bio = $10, interests = $11, languages = $12, hobbies = $13, food_preferences = $14,
        music_interests = $15, min_age_pref = $16, max_age_pref = $17, max_distance_km = $18, preferred_genders = $19,
        relationship_goals_pref = $20, updated_at = $21
      WHERE user_id = $22`,
      [
        merged.name, merged.age, merged.gender, merged.city, merged.location.latitude, merged.location.longitude,
        merged.education, merged.profession, merged.relationshipGoal, merged.bio, merged.interests, merged.languages,
        merged.hobbies, merged.foodPreferences, merged.musicInterests, merged.preferences.minAge, merged.preferences.maxAge,
        merged.preferences.maxDistanceKm, merged.preferences.preferredGenders, merged.preferences.relationshipGoals,
        merged.updatedAt, userId
      ]
    );
    return merged;
  }

  async findAll(): Promise<UserProfile[]> {
    const res = await this.pool.query('SELECT * FROM profiles');
    return res.rows.map((r: any) => this.mapRow(r));
  }

  private mapRow(row: any): UserProfile {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      city: row.city,
      location: { latitude: row.latitude, longitude: row.longitude, city: row.city, country: 'India' },
      education: row.education,
      profession: row.profession,
      relationshipGoal: row.relationship_goal,
      bio: row.bio,
      interests: row.interests || [],
      languages: row.languages || [],
      hobbies: row.hobbies || [],
      foodPreferences: row.food_preferences || [],
      musicInterests: row.music_interests || [],
      photos: [],
      preferences: {
        minAge: row.min_age_pref || 18,
        maxAge: row.max_age_pref || 60,
        maxDistanceKm: row.max_distance_km || 50,
        preferredGenders: row.preferred_genders || [],
        relationshipGoals: row.relationship_goals_pref || [],
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export class PostgresLikeRepository implements ILikeRepository {
  constructor(private pool: Pool) {}

  async create(like: Like): Promise<Like> {
    await this.pool.query(
      'INSERT INTO likes (id, from_user_id, to_user_id, created_at) VALUES ($1, $2, $3, $4)',
      [like.id, like.fromUserId, like.toUserId, like.createdAt]
    );
    return like;
  }

  async findByPair(fromUserId: string, toUserId: string): Promise<Like | null> {
    const res = await this.pool.query(
      'SELECT id, from_user_id as "fromUserId", to_user_id as "toUserId", created_at as "createdAt" FROM likes WHERE from_user_id = $1 AND to_user_id = $2',
      [fromUserId, toUserId]
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM likes WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}

export class PostgresMatchRepository implements IMatchRepository {
  constructor(private pool: Pool) {}

  async create(match: Match): Promise<Match> {
    await this.pool.query(
      'INSERT INTO matches (id, user_a_id, user_b_id, is_active, matched_at) VALUES ($1, $2, $3, $4, $5)',
      [match.id, match.userAId, match.userBId, match.isActive, match.matchedAt]
    );
    return match;
  }

  async findByUserId(userId: string): Promise<Match[]> {
    const res = await this.pool.query(
      'SELECT id, user_a_id as "userAId", user_b_id as "userBId", is_active as "isActive", matched_at as "matchedAt" FROM matches WHERE (user_a_id = $1 OR user_b_id = $1) AND is_active = TRUE',
      [userId]
    );
    return res.rows;
  }

  async findById(id: string): Promise<Match | null> {
    const res = await this.pool.query(
      'SELECT id, user_a_id as "userAId", user_b_id as "userBId", is_active as "isActive", matched_at as "matchedAt" FROM matches WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }
}

export function createPostgresRepositories(connectionString?: string): Repositories {
  const pool = new Pool({
    connectionString: connectionString || process.env.DATABASE_URL || 'postgres://topolgira_user:topolgira_password@localhost:5432/topolgira',
  });
  return {
    users: new PostgresUserRepository(pool),
    profiles: new PostgresProfileRepository(pool),
    likes: new PostgresLikeRepository(pool),
    matches: new PostgresMatchRepository(pool),
  };
}
