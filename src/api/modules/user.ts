import { get, patch } from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { UserInfo, UpdateUserStatusParams, UpdateUserRoleParams, PhoneNumberResult } from '@/types/user'

/** 查询用户列表（管理员） GET /users */
export function getUserList(params: Record<string, unknown>): Promise<ApiResponse<PageResult<UserInfo>>> {
  return get('/users', params)
}

/** 更新用户状态（管理员） PATCH /users/:id/status */
export function updateUserStatus(
  id: number,
  data: UpdateUserStatusParams,
): Promise<ApiResponse<null>> {
  return patch(`/users/${id}/status`, data as unknown as Record<string, unknown>)
}

/** 变更用户角色（超级管理员） PATCH /users/:id/role */
export function updateUserRole(
  id: number,
  data: UpdateUserRoleParams,
): Promise<ApiResponse<null>> {
  return patch(`/users/${id}/role`, data as unknown as Record<string, unknown>)
}

/** 查看用户手机号（管理员） GET /users/:id/phone-number */
export function getUserPhoneNumber(id: number): Promise<ApiResponse<PhoneNumberResult>> {
  return get(`/users/${id}/phone-number`)
}
