import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../../middleware/auth';
import { ApiResponse, User, UserProfile } from '@topolgira/shared-types';
import { Repositories } from '../../repositories/interfaces';
import { logger } from '../../utils/logger';

const FILE_PATH = 'src/modules/auth/auth.controller.ts';
const GO_USER_SERVICE_URL = process.env.GO_USER_SERVICE_URL || 'http://localhost:8081';

export function createAuthRouter(repos: Repositories): Router {
  const router = Router();
  const otpRequests = new Map<string, { code: string; expiresAt: number }>();
  const refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

  router.post('/register', async (req: Request, res: Response) => {
    return logger.traceFn('registerHandler', FILE_PATH, { route: '/auth/register', email: req.body.email }, async () => {
      const {
        email,
        password,
        phoneNumber,
        name,
        age,
        gender,
        city,
        bio,
        education,
        profession,
        relationshipGoal,
        interests = [],
        languages = [],
        hobbies = [],
        foodPreferences = [],
        musicInterests = [],
        photos = [],
      } = req.body;

      if (!email || !password) {
        const resp: ApiResponse = { success: false, error: 'Email and password are required' };
        return res.status(400).json(resp);
      }

      const existing = await repos.users.findByEmail(email);
      if (existing) {
        const resp: ApiResponse = { success: false, error: 'User with this email already exists' };
        return res.status(409).json(resp);
      }

      // 1. Forward internal HTTP request to Go User Management Service (go/user-go:8081)
      let goUserResponse: any = null;
      try {
        const fetchRes = await fetch(`${GO_USER_SERVICE_URL}/api/v1/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            phoneNumber,
            name,
            age,
            gender,
            city,
            bio,
            education,
            profession,
            relationshipGoal,
            interests,
            languages,
            hobbies,
            foodPreferences,
            musicInterests,
            photos,
          }),
        });
        if (fetchRes.ok) {
          goUserResponse = await fetchRes.json();
          logger.info('Forwarded registration internally to Go User Service (user-go)', { goData: goUserResponse });
        }
      } catch (err: any) {
        logger.warn('Go User Service internal call offline or skipped', { error: err.message });
      }

      // 2. Hash password & create user in Node.js DI Repository
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const userId = goUserResponse?.data?.id || uuidv4();
      const newUser = {
        id: userId,
        email,
        phoneNumber,
        role: 'user' as const,
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        passwordHash,
      };

      await repos.users.create(newUser);

      // 3. Create initial profile if onboarding parameters were provided
      const profileName = name || email.split('@')[0];
      const newProfile: UserProfile = {
        id: uuidv4(),
        userId,
        name: profileName,
        age: age || 25,
        gender: (gender as any) || 'other',
        city: city || 'Ranchi',
        location: { latitude: 23.3441, longitude: 85.3096, city: city || 'Ranchi', country: 'India' },
        education: education || '',
        profession: profession || '',
        relationshipGoal: (relationshipGoal as any) || 'marriage',
        bio: bio || '',
        interests,
        languages: languages.length ? languages : ['Hindi', 'English'],
        hobbies,
        foodPreferences,
        musicInterests,
        photos,
        preferences: {
          minAge: 18,
          maxAge: 60,
          maxDistanceKm: 50,
          preferredGenders: ['female', 'male'],
          relationshipGoals: ['marriage'],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repos.profiles.create(newProfile);

      // 4. Generate JWT access and refresh tokens
      const accessToken = jwt.sign({ userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      refreshTokens.set(refreshToken, { userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

      const userPayload: User = {
        id: userId,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };

      const resp: ApiResponse = {
        success: true,
        message: 'Registration complete via Node.js Gateway & Go User Service',
        data: {
          user: userPayload,
          profile: newProfile,
          accessToken,
          refreshToken,
          goUserSynced: !!goUserResponse?.success,
        },
      };
      return res.status(201).json(resp);
    });
  });

  router.post('/login', async (req: Request, res: Response) => {
    return logger.traceFn('loginHandler', FILE_PATH, { route: '/auth/login', email: req.body.email }, async () => {
      const { email, password } = req.body;
      if (!email || !password) {
        const resp: ApiResponse = { success: false, error: 'Email and password are required' };
        return res.status(400).json(resp);
      }

      const user = await repos.users.findByEmail(email);
      if (!user) {
        const resp: ApiResponse = { success: false, error: 'Invalid credentials' };
        return res.status(401).json(resp);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        const resp: ApiResponse = { success: false, error: 'Invalid credentials' };
        return res.status(401).json(resp);
      }

      const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      refreshTokens.set(refreshToken, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

      const userPayload: User = {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const profile = await repos.profiles.findByUserId(user.id);

      const resp: ApiResponse = {
        success: true,
        data: {
          user: userPayload,
          profile,
          accessToken,
          refreshToken,
        },
      };
      return res.status(200).json(resp);
    });
  });

  router.post('/send-otp', (req: Request, res: Response) => {
    return logger.traceFn('sendOtpHandler', FILE_PATH, { route: '/auth/send-otp' }, () => {
      const { phoneOrEmail } = req.body;
      if (!phoneOrEmail) {
        const resp: ApiResponse = { success: false, error: 'Phone or email required' };
        return res.status(400).json(resp);
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      otpRequests.set(phoneOrEmail, {
        code: otpCode,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      const resp: ApiResponse = {
        success: true,
        message: 'OTP sent successfully',
        data: { phoneOrEmail, devOtp: otpCode },
      };
      return res.status(200).json(resp);
    });
  });

  router.post('/verify-otp', (req: Request, res: Response) => {
    return logger.traceFn('verifyOtpHandler', FILE_PATH, { route: '/auth/verify-otp' }, () => {
      const { phoneOrEmail, otpCode } = req.body;
      const otpRecord = otpRequests.get(phoneOrEmail);

      if (!otpRecord || otpRecord.expiresAt < Date.now()) {
        const resp: ApiResponse = { success: false, error: 'OTP expired or invalid' };
        return res.status(400).json(resp);
      }

      if (otpRecord.code !== otpCode) {
        const resp: ApiResponse = { success: false, error: 'Invalid OTP code' };
        return res.status(400).json(resp);
      }

      otpRequests.delete(phoneOrEmail);
      const resp: ApiResponse = { success: true, message: 'OTP verified successfully' };
      return res.status(200).json(resp);
    });
  });

  router.post('/refresh', async (req: Request, res: Response) => {
    return logger.traceFn('refreshHandler', FILE_PATH, { route: '/auth/refresh' }, async () => {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        const resp: ApiResponse = { success: false, error: 'Refresh token is required' };
        return res.status(400).json(resp);
      }

      const tokenData = refreshTokens.get(refreshToken);
      if (!tokenData || tokenData.expiresAt < Date.now()) {
        const resp: ApiResponse = { success: false, error: 'Refresh token expired or invalid' };
        return res.status(403).json(resp);
      }

      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
        const user = await repos.users.findById(decoded.userId);
        if (!user) {
          const resp: ApiResponse = { success: false, error: 'User not found' };
          return res.status(404).json(resp);
        }

        const newAccessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        const resp: ApiResponse = {
          success: true,
          data: { accessToken: newAccessToken },
        };
        return res.status(200).json(resp);
      } catch (err) {
        const resp: ApiResponse = { success: false, error: 'Invalid refresh token' };
        return res.status(403).json(resp);
      }
    });
  });

  router.post('/logout', (req: Request, res: Response) => {
    return logger.traceFn('logoutHandler', FILE_PATH, { route: '/auth/logout' }, () => {
      const { refreshToken } = req.body;
      if (refreshToken) {
        refreshTokens.delete(refreshToken);
      }
      const resp: ApiResponse = { success: true, message: 'Logged out successfully' };
      return res.status(200).json(resp);
    });
  });

  return router;
}
