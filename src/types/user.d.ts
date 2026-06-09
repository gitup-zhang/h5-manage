// ====== Users 模块 API 类型 ======

/** 用户角色 */
export type UserRole = 'user' | 'admin' | 'superadmin'

/** 短信验证码用途 */
export type SmsPurpose = 'REGISTER' | 'LOGIN' | 'CHANGE_PASSWORD' | 'RESET_PASSWORD'

/** 性别 */
export type GenderCode = 'M' | 'F' | 'U'

/** 关注领域 */
export interface FieldItem {
  field_code: string
  field_name: string
}

/** 用户信息（对齐 /api/users/me 响应） */
export interface UserInfo {
  user_id: number
  nickname: string
  avatar_url: string
  name: string
  gender_code: GenderCode
  gender: string
  country_code: string
  phone_number: string
  email: string
  unit: string
  department: string
  position: string
  industry_id: number
  industry_name: string
  role: UserRole
  role_name: string
  status: number
  fields: FieldItem[]
}

// ====== 请求参数类型 ======

/** 发送短信验证码 */
export interface SmsSendParams {
  phone_number: string
  purpose: SmsPurpose
}

/** 验证短信验证码 */
export interface SmsVerifyParams {
  phone_number: string
  code: string
  purpose: SmsPurpose
}

/** 短信验证结果 */
export interface SmsVerifyResult {
  verify_token: string
}

/** 密码登录 */
export interface LoginParams {
  phone_number: string
  password: string
}

/** 验证码登录 */
export interface SmsLoginParams {
  phone_number: string
  verify_token: string
}

/** 登录结果 */
export interface LoginResult {
  access_token: string
  refresh_token: string
}

/** 用户注册 */
export interface RegisterParams {
  phone_number: string
  password: string
  verify_token: string
}

/** 重置密码 */
export interface ResetPasswordParams {
  phone_number: string
  verify_token: string
  new_password: string
}

/** 刷新 Token */
export interface RefreshTokenParams {
  refresh_token: string
}

/** 更新用户信息 */
export interface UpdateUserParams {
  nickname?: string
  avatar_url?: string
  name?: string
  gender?: GenderCode
  email?: string
  unit?: string
  department?: string
  position?: string
  industry_id?: number
  field_ids?: number[]
}

// ====== 管理端类型 ======

/** 角色 */
export interface Role {
  id: number
  name: string
  code: string
  description: string
  menuIds: number[]
  status: 0 | 1
  createdAt: string
}

/** 菜单 */
export interface MenuItem {
  id: number
  parentId: number
  name: string
  path: string
  component: string
  icon: string
  sort: number
  permission: string
  type: 0 | 1 | 2
  hidden: boolean
  keepAlive: boolean
  children?: MenuItem[]
}
