export class AuthApi {
  static url = {
    login: `auth/login`,
    loginWeb: `user/loginWeb`,
    register: `auth/register`,
    verifyotp: `user/verifyotp`,
    clearSession: `user/delete-existing-session`,
    user_status_check: `user/user_status_check`,
    dashboard: `user/dashboard`,
    logout: `auth/logout`,
    fetch_parent_balance: `mw/card/fetch_parent_balance`,
    forgotPassOTP: `utility/send-forgot-password-otp?userName=`,
    change_password: `utility/verify-otp-send-temporary-password`,
    sendChangePasswordOtp: 'user/send-change-password-otp',
    changePassword1stLogin_OTP: `utility/send-first-login-otp`,
    changePassword1stLogin_Verify: `utility/change-password-on-first-login-with-otp`,
    updatePasswordUsingOld: 'user/update-password-using-old-password',
  };
}
