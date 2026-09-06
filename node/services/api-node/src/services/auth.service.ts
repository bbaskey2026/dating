import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, UserProfile, Photo, Gender, RelationshipGoal, UserPreferences } from '@topolgira/shared-types';
import { IUserRepository, IProfileRepository } from '../repositories/interfaces';
import { IGoUserClient } from '../clients/goUserClient';
import { AppConfig } from '../config/config';

export interface RegisterDTO {
  email: string;
  password: string;
  phoneNumber?: string;
  name?: string;
  age?: number;
  gender?: string;
  city?: string;
  bio?: string;
  education?: string;
  profession?: string;
  relationshipGoal?: string;
  interests?: string[];
  languages?: string[];
  hobbies?: string[];
  foodPreferences?: string[];
  musicInterests?: string[];
  photos?: (string | Photo)[];
  preferences?: Partial<UserPreferences>;
}

export interface AuthResult {
  user: User;
  profile?: UserProfile | null;
  accessToken: string;
  refreshToken: string;
  goUserSynced?: boolean;
}

export class AuthService {
  private otpStore = new Map<string, { code: string; expiresAt: number }>();
  private refreshTokenStore = new Map<string, { userId: string; expiresAt: number }>();

  constructor(
    private userRepo: IUserRepository,
    private profileRepo: IProfileRepository,
    private goUserClient: IGoUserClient,
    private config: AppConfig
  ) {}

  async register(dto: RegisterDTO): Promise<AuthResult> {
    if (!dto.email || !dto.password) {
      throw new Error('Email and password are required');
    }

    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    // 1. Forward registration to Go User Service (user-go:8081)
    const goUserPayload = {
      ...dto,
      photos: dto.photos?.map((p) => (typeof p === 'string' ? p : p.url)),
    };
    const goUserRes = await this.goUserClient.registerUser(goUserPayload);

    // 2. Hash password & create user in DB
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const userId = goUserRes?.data?.id || uuidv4();
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      role: 'user' as const,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
      passwordHash,
    };

    await this.userRepo.create(newUser);

    // 3. Create initial profile with normalized photos and preferences
    const profileName = dto.name || dto.email.split('@')[0];
    const normalizedPhotos: Photo[] = (dto.photos || []).map((p, idx) => {
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
    });

    const normalizedPreferences: UserPreferences = {
      minAge: dto.preferences?.minAge ?? 18,
      maxAge: dto.preferences?.maxAge ?? 60,
      maxDistanceKm: dto.preferences?.maxDistanceKm ?? 50,
      preferredGenders: (dto.preferences?.preferredGenders as Gender[]) ?? ['female', 'male'],
      relationshipGoals: (dto.preferences?.relationshipGoals as RelationshipGoal[]) ?? ['marriage'],
    };

    const newProfile: UserProfile = {
      id: uuidv4(),
      userId,
      name: profileName,
      age: dto.age || 25,
      gender: (dto.gender as Gender) || 'other',
      city: dto.city || 'Ranchi',
      location: { latitude: 23.3441, longitude: 85.3096, city: dto.city || 'Ranchi', country: 'India' },
      education: dto.education || '',
      profession: dto.profession || '',
      relationshipGoal: (dto.relationshipGoal as RelationshipGoal) || 'marriage',
      bio: dto.bio || '',
      interests: dto.interests || [],
      languages: dto.languages && dto.languages.length ? dto.languages : ['Hindi', 'English'],
      hobbies: dto.hobbies || [],
      foodPreferences: dto.foodPreferences || [],
      musicInterests: dto.musicInterests || [],
      photos: normalizedPhotos,
      preferences: normalizedPreferences,
      createdAt: now,
      updatedAt: now,
    };

    await this.profileRepo.create(newProfile);

    // 4. Generate JWT tokens
    const accessToken = this.generateAccessToken(userId, newUser.email, newUser.role);
    const refreshToken = this.generateRefreshToken(userId);

    const userPayload: User = {
      id: userId,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return {
      user: userPayload,
      profile: newProfile,
      accessToken,
      refreshToken,
      goUserSynced: !!goUserRes?.success,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.id);
    const profile = await this.profileRepo.findByUserId(user.id);

    const userPayload: User = {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: userPayload,
      profile,
      accessToken,
      refreshToken,
    };
  }

  sendOtp(phoneOrEmail: string): { phoneOrEmail: string; devOtp: string } {
    if (!phoneOrEmail) {
      throw new Error('Phone or email required');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(phoneOrEmail, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return { phoneOrEmail, devOtp: otpCode };
  }

  verifyOtp(phoneOrEmail: string, otpCode: string): boolean {
    const record = this.otpStore.get(phoneOrEmail);
    if (!record || record.expiresAt < Date.now() || record.code !== otpCode) {
      return false;
    }
    this.otpStore.delete(phoneOrEmail);
    return true;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const tokenData = this.refreshTokenStore.get(refreshToken);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      throw new Error('Refresh token expired or invalid');
    }

    const decoded = jwt.verify(refreshToken, this.config.jwtRefreshSecret) as { userId: string };
    const user = await this.userRepo.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.generateAccessToken(user.id, user.email, user.role);
  }

  logout(refreshToken?: string): void {
    if (refreshToken) {
      this.refreshTokenStore.delete(refreshToken);
    }
  }

  private generateAccessToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, this.config.jwtSecret, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string): string {
    const token = jwt.sign({ userId }, this.config.jwtRefreshSecret, { expiresIn: '7d' });
    this.refreshTokenStore.set(token, {
      userId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    return token;
  }
}
