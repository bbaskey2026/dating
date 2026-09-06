import { Request, Response, Router } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '@topolgira/shared-types';
import { logger } from '../utils/logger';

const FILE_PATH = 'src/controllers/auth.controller.ts';

export class AuthController {
  constructor(private authService: AuthService) {}

  registerRoutes(): Router {
    const router = Router();

    router.post('/register', async (req: Request, res: Response) => {
      return logger.traceFn('registerHandler', FILE_PATH, { route: '/auth/register', email: req.body.email }, async () => {
        try {
          const result = await this.authService.register(req.body);
          const resp: ApiResponse = {
            success: true,
            message: 'Registration complete via Node.js Gateway & Go User Service',
            data: result,
          };
          return res.status(201).json(resp);
        } catch (err: any) {
          const status = err.message.includes('already exists') ? 409 : 400;
          return res.status(status).json({ success: false, error: err.message });
        }
      });
    });

    router.post('/login', async (req: Request, res: Response) => {
      return logger.traceFn('loginHandler', FILE_PATH, { route: '/auth/login', email: req.body.email }, async () => {
        try {
          const result = await this.authService.login(req.body.email, req.body.password);
          const resp: ApiResponse = {
            success: true,
            data: result,
          };
          return res.status(200).json(resp);
        } catch (err: any) {
          const status = err.message.includes('Invalid credentials') ? 401 : 400;
          return res.status(status).json({ success: false, error: err.message });
        }
      });
    });

    router.post('/send-otp', (req: Request, res: Response) => {
      return logger.traceFn('sendOtpHandler', FILE_PATH, { route: '/auth/send-otp' }, () => {
        try {
          const result = this.authService.sendOtp(req.body.phoneOrEmail);
          return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: result,
          });
        } catch (err: any) {
          return res.status(400).json({ success: false, error: err.message });
        }
      });
    });

    router.post('/verify-otp', (req: Request, res: Response) => {
      return logger.traceFn('verifyOtpHandler', FILE_PATH, { route: '/auth/verify-otp' }, () => {
        const { phoneOrEmail, otpCode } = req.body;
        const isValid = this.authService.verifyOtp(phoneOrEmail, otpCode);
        if (!isValid) {
          return res.status(400).json({ success: false, error: 'OTP expired or invalid' });
        }
        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
      });
    });

    router.post('/refresh', async (req: Request, res: Response) => {
      return logger.traceFn('refreshHandler', FILE_PATH, { route: '/auth/refresh' }, async () => {
        try {
          const accessToken = await this.authService.refreshAccessToken(req.body.refreshToken);
          return res.status(200).json({ success: true, data: { accessToken } });
        } catch (err: any) {
          return res.status(403).json({ success: false, error: err.message });
        }
      });
    });

    router.post('/logout', (req: Request, res: Response) => {
      return logger.traceFn('logoutHandler', FILE_PATH, { route: '/auth/logout' }, () => {
        this.authService.logout(req.body.refreshToken);
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
      });
    });

    return router;
  }
}
