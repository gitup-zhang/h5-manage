import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { UserInfo } from '@/types/user'

/**
 * 管理端用户 CRUD（待后端提供管理接口文档后对接）
 * 当前接口路径为占位，实际以后端文档为准
 */

/** 用户列表 */
export function getUserList(params: Record<string, unknown>): Promise<ApiResponse<PageResult<UserInfo>>> {
  return get('/users', params)
}

/** 用户详情 */
export function getUserDetail(id: number): Promise<ApiResponse<UserInfo>> {
  return get(`/users/${id}`)
}

/** 创建用户 */
export function createUser(data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> {
  return post('/users', data as Record<string, unknown>)
}

/** 更新用户 */
export function updateUser(id: number, data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> {
  return put(`/users/${id}`, data as Record<string, unknown>)
}

/** 删除用户 */
export function deleteUser(id: number): Promise<ApiResponse<null>> {
  return del(`/users/${id}`)
}
