import { AuthApi } from '../endpoints/auth.endpoint';
import { HttpService } from './http.service';
import type { RegisterPayload, ApiResponse } from '../types';

export class AuthService {
  static async login(email: string, password: string): Promise<ApiResponse> {
    return HttpService.postService<ApiResponse>(AuthApi.url.login, { email, password });
  }

  static async register(payload: RegisterPayload): Promise<ApiResponse> {
    return HttpService.postService<ApiResponse>(AuthApi.url.register, payload);
  }

  static async logout(refreshToken?: string): Promise<ApiResponse> {
    try {
      return await HttpService.postService<ApiResponse>(AuthApi.url.logout, { refreshToken });
    } catch (e) {
      console.warn('Logout API call completed offline');
      return { success: true, message: 'Offline logout' };
    }
  }

  static async verifyOtp(userName: string, otp: string): Promise<ApiResponse> {
    return HttpService.postService<ApiResponse>(AuthApi.url.verifyotp, { userName, otp });
  }

  static async sendForgotPasswordOtp(userName: string): Promise<ApiResponse> {
    return HttpService.getService<ApiResponse>(`${AuthApi.url.forgotPassOTP}${encodeURIComponent(userName)}`);
  }

  static async changePassword(payload: any): Promise<ApiResponse> {
    return HttpService.postService<ApiResponse>(AuthApi.url.change_password, payload);
  }

  static async updatePasswordUsingOld(payload: any): Promise<ApiResponse> {
    return HttpService.putService<ApiResponse>(AuthApi.url.updatePasswordUsingOld, payload);
  }

  static async checkUserStatus(): Promise<ApiResponse> {
    return HttpService.getService<ApiResponse>(AuthApi.url.user_status_check);
  }
}
