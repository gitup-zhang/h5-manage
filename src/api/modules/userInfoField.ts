import { get, post, put, patch } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { UserInfoField, UpdateUserInfoFieldStatusParams } from '@/types/user'

/** 查询用户信息字段列表 GET /user-info-fields */
export function getUserInfoFieldList(
  params?: Record<string, unknown>,
): Promise<ApiResponse<UserInfoField[]>> {
  return get('/user-info-fields', params)
}

/** 创建用户信息字段 POST /user-info-fields */
export function createUserInfoField(
  data: { code: string; name: string },
): Promise<ApiResponse<null>> {
  return post('/user-info-fields', data as Record<string, unknown>)
}

/** 更新用户信息字段 PUT /user-info-fields/:id */
export function updateUserInfoField(
  id: number,
  data: { name: string },
): Promise<ApiResponse<null>> {
  return put(`/user-info-fields/${id}`, data as Record<string, unknown>)
}

/** 更新用户信息字段状态 PATCH /user-info-fields/:id/status */
export function updateUserInfoFieldStatus(
  id: number,
  data: UpdateUserInfoFieldStatusParams,
): Promise<ApiResponse<null>> {
  return patch(`/user-info-fields/${id}/status`, data as unknown as Record<string, unknown>)
}
