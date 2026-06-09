import { post, get, put } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type {
  SmsSendParams,
  SmsVerifyParams,
  SmsVerifyResult,
  LoginParams,
  SmsLoginParams,
  LoginResult,
  RegisterParams,
  ResetPasswordParams,
  RefreshTokenParams,
  UserInfo,
  UpdateUserParams,
} from '@/types/user'

// ====== 1. 短信验证码 ======

/** 发送短信验证码 */
export function sendSms(data: SmsSendParams): Promise<ApiResponse<null>> {
  return post('/users/sms/send', data as unknown as Record<string, unknown>)
}

/** 验证短信验证码，返回 verify_token */
export function verifySms(data: SmsVerifyParams): Promise<ApiResponse<SmsVerifyResult>> {
  return post('/users/sms/verify', data as unknown as Record<string, unknown>)
}

// ====== 2. 注册 ======

/** 用户注册 */
export function register(data: RegisterParams): Promise<ApiResponse<null>> {
  return post('/users/register', data as unknown as Record<string, unknown>)
}

// ====== 3. 登录 ======

/** 密码登录 */
export function loginByPassword(data: LoginParams): Promise<ApiResponse<LoginResult>> {
  return post('/users/login', data as unknown as Record<string, unknown>)
}

/** 验证码登录 */
export function loginBySms(data: SmsLoginParams): Promise<ApiResponse<LoginResult>> {
  return post('/users/login/sms', data as unknown as Record<string, unknown>)
}

// ====== 4. 忘记密码 ======

/** 重置密码 */
export function resetPassword(data: ResetPasswordParams): Promise<ApiResponse<null>> {
  return post('/users/password/reset', data as unknown as Record<string, unknown>)
}

// ====== 5. Token 管理 ======

/** 刷新 Token */
export function refreshToken(data: RefreshTokenParams): Promise<ApiResponse<LoginResult>> {
  return post('/users/token/refresh', data as unknown as Record<string, unknown>)
}

/** 退出登录 */
export function logout(): Promise<ApiResponse<null>> {
  return post('/users/logout')
}

// ====== 6. 用户信息 ======

/** 获取当前用户信息 */
export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return get('/users/me')
}

/** 更新当前用户信息 */
export function updateUserInfo(data: UpdateUserParams): Promise<ApiResponse<null>> {
  return put('/users/me', data as unknown as Record<string, unknown>)
}
