import { v4 as uuidv4 } from 'uuid';
import { UserProfile, Photo, Gender, RelationshipGoal, UserPreferences } from '@topolgira/shared-types';
import { IProfileRepository } from '../repositories/interfaces';

export interface CreateProfileDTO {
  name: string;
  age: number;
  gender: string;
  city: string;
  location?: { latitude: number; longitude: number; city: string; country: string };
  education?: string;
  profession?: string;
  relationshipGoal: string;
  bio?: string;
  interests?: string[];
  languages?: string[];
  hobbies?: string[];
  foodPreferences?: string[];
  musicInterests?: string[];
  photos?: (string | Photo)[];
  preferences?: Partial<UserPreferences>;
}

export class ProfileService {
  constructor(private profileRepo: IProfileRepository) {}

  async createOrUpsert(userId: string, dto: Partial<CreateProfileDTO>): Promise<UserProfile> {
    const existing = await this.profileRepo.findByUserId(userId);
    const now = new Date().toISOString();

    const normalizedPhotos: Photo[] | undefined = dto.photos
      ? dto.photos.map((p, idx) => {
          if (typeof p === 'string') {
            return {
              id: uuidv4(),
              userId,
              url: p,
              isPrimary: idx === 0,
              createdAt: now,
            };
          }
          return p;
        })
      : undefined;

    const normalizedPreferences: UserPreferences = {
      minAge: dto.preferences?.minAge ?? existing?.preferences?.minAge ?? 18,
      maxAge: dto.preferences?.maxAge ?? existing?.preferences?.maxAge ?? 60,
      maxDistanceKm: dto.preferences?.maxDistanceKm ?? existing?.preferences?.maxDistanceKm ?? 50,
      preferredGenders: (dto.preferences?.preferredGenders as Gender[]) ?? existing?.preferences?.preferredGenders ?? ['female', 'male'],
      relationshipGoals: (dto.preferences?.relationshipGoals as RelationshipGoal[]) ?? existing?.preferences?.relationshipGoals ?? ['marriage'],
    };

    if (existing) {
      const updated = await this.profileRepo.update(userId, {
        name: dto.name || existing.name,
        age: dto.age || existing.age,
        gender: (dto.gender as Gender) || existing.gender,
        city: dto.city || existing.city,
        location: dto.location || existing.location,
        education: dto.education !== undefined ? dto.education : existing.education,
        profession: dto.profession !== undefined ? dto.profession : existing.profession,
        relationshipGoal: (dto.relationshipGoal as RelationshipGoal) || existing.relationshipGoal,
        bio: dto.bio !== undefined ? dto.bio : existing.bio,
        interests: dto.interests && dto.interests.length ? dto.interests : existing.interests,
        languages: dto.languages && dto.languages.length ? dto.languages : existing.languages,
        hobbies: dto.hobbies && dto.hobbies.length ? dto.hobbies : existing.hobbies,
        foodPreferences: dto.foodPreferences && dto.foodPreferences.length ? dto.foodPreferences : existing.foodPreferences,
        musicInterests: dto.musicInterests && dto.musicInterests.length ? dto.musicInterests : existing.musicInterests,
        photos: normalizedPhotos && normalizedPhotos.length ? normalizedPhotos : existing.photos,
        preferences: normalizedPreferences,
      });

      return updated || existing;
    }

    if (!dto.name || !dto.age || !dto.gender || !dto.city || !dto.relationshipGoal) {
      throw new Error('Name, age, gender, city, and relationshipGoal are required');
    }

    const newProfile: UserProfile = {
      id: uuidv4(),
      userId,
      name: dto.name,
      age: dto.age,
      gender: dto.gender as Gender,
      city: dto.city,
      location: dto.location || { latitude: 23.3441, longitude: 85.3096, city: dto.city, country: 'India' },
      education: dto.education || '',
      profession: dto.profession || '',
      relationshipGoal: dto.relationshipGoal as RelationshipGoal,
      bio: dto.bio || '',
      interests: dto.interests || [],
      languages: dto.languages && dto.languages.length ? dto.languages : ['Hindi', 'English'],
      hobbies: dto.hobbies || [],
      foodPreferences: dto.foodPreferences || [],
      musicInterests: dto.musicInterests || [],
      photos: normalizedPhotos || [],
      preferences: normalizedPreferences,
      createdAt: now,
      updatedAt: now,
    };

    return this.profileRepo.create(newProfile);
  }

  async getByUserId(userId: string): Promise<UserProfile | null> {
    return this.profileRepo.findByUserId(userId);
  }

  async getById(id: string): Promise<UserProfile | null> {
    return this.profileRepo.findById(id);
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    return this.profileRepo.update(userId, updates);
  }

  async listProfiles(excludeUserId?: string): Promise<UserProfile[]> {
    const all = await this.profileRepo.findAll();
    if (excludeUserId) {
      return all.filter((p) => p.userId !== excludeUserId);
    }
    return all;
  }
}
