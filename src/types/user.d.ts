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
  user_status: string
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

/** 修改密码（已登录用户） */
export interface ChangePasswordParams {
  verify_token: string
  new_password: string
}

// ====== 消息管理 ======

/** 消息目标类型 */
export type MessageTargetType = 'ALL' | 'FIELD'

/** 消息列表项 */
export interface MessageItem {
  id: number
  title: string
  content: string
  sender_id: number
  target_type: MessageTargetType
  target_id: number
  send_time: string
  create_time: string
}

/** 创建消息参数 */
export interface CreateMessageParams {
  title: string
  content: string
  target_type: MessageTargetType
  target_id?: number
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

// ====== 行业管理 ======

export interface Industry {
  id: number
  industry_code: string
  industry_name: string
  desc: string
  enable: 1 | 2
}

export interface UpdateIndustryStatusParams {
  operation: 'ENABLE' | 'DISABLE'
}

// ====== 领域管理 ======

export interface Field {
  id: number
  field_code: string
  field_name: string
  desc: string
  enable: 1 | 2
}

export interface UpdateFieldStatusParams {
  operation: 'ENABLE' | 'DISABLE'
}

// ====== 用户信息字段管理 ======

/** 用户信息字段项 */
export interface UserInfoField {
  id: number
  code: string
  name: string
  is_deleted: 'Y' | 'N'
  is_deleted_desc: string
}

/** 更新用户信息字段状态参数 */
export interface UpdateUserInfoFieldStatusParams {
  is_deleted: 'Y' | 'N'
}

// ====== 活动管理 ======

export interface EventField {
  field_id: number
  field_code: string
  field_name: string
}

export interface EventImage {
  image_id: number
  url: string
}

export interface EventUserInfoField {
  user_info_id: number
  code: string
  name: string
}

/** 活动列表项 */
export interface EventItem {
  id: number
  title: string
  event_start_time: string
  event_end_time: string
  registration_start_time: string
  registration_end_time: string
  max_registrants: number
  current_registrants: number
  remaining_quota: number
  event_address: string
  status: string
  cover_image_url: string
  member_count: number
  need_invite_code: number
  invite_code?: string
  fields: EventField[]
}

/** 活动详情 */
export interface EventDetail {
  title: string
  detail: string
  event_start_time: string
  event_end_time: string
  registration_start_time: string
  registration_end_time: string
  max_registrants: number
  current_registrants: number
  remaining_quota: number
  event_address: string
  status: string
  cover_image_url: string
  need_invite_code: number
  invite_code?: string
  images: EventImage[]
  user_info: EventUserInfoField[]
  fields: EventField[]
}

/** 创建/更新活动参数 */
export interface EventParams {
  title: string
  detail: string
  event_start_time: string
  event_end_time: string
  registration_start_time: string
  registration_end_time: string
  max_registrants?: number
  event_address: string
  cover_image_url?: string
  need_invite_code: number
  image_id_list?: number[]
  user_info_id_list?: number[]
  field_id_list?: number[]
}

/** 报名用户 */
export interface EventRegistration {
  name: string
  phone_number: string
  email: string
  industry_id: number
  industry_name: string
  position: string
  unit: string
  department: string
}

// ====== 管理端操作类型 ======

/** 更新用户状态 */
export interface UpdateUserStatusParams {
  operation: 'ENABLE' | 'DISABLE'
}

/** 变更用户角色 */
export interface UpdateUserRoleParams {
  role: 'USER' | 'ADMIN' | 'SUPERADMIN'
}

/** 查看手机号结果 */
export interface PhoneNumberResult {
  user_id: number
  phone_number: string
}

// ====== 管理端基础类型 ======

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

// ====== Dashboard ======

/** 用户概览 */
export interface DashboardUserSummary {
  total_count: number
}

/** 活动列表项 */
export interface DashboardEventItem {
  id: number
  title: string
  event_start_time: string
  event_end_time: string
  max_registrants: number
  current_registrants: number
  status: string
}

/** 统计条目 */
export interface StatItem {
  name: string
  count: number
}

/** 活动报名统计 */
export interface DashboardStatistics {
  by_field: StatItem[]
  by_unit: StatItem[]
  by_department: StatItem[]
  by_position: StatItem[]
  by_industry: StatItem[]
}
