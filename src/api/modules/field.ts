import { get, post, put, del, patch } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Field, UpdateFieldStatusParams } from '@/types/user'

/** 查询领域列表 GET /fields */
export function getFieldList(
  params: Record<string, unknown>,
): Promise<ApiResponse<Field[]>> {
  return get('/fields', params)
}

/** 创建领域 POST /fields */
export function createField(data: Partial<Field>): Promise<ApiResponse<null>> {
  return post('/fields', data as Record<string, unknown>)
}

/** 更新领域 PUT /fields/:id */
export function updateField(
  id: number,
  data: Partial<Field>,
): Promise<ApiResponse<null>> {
  return put(`/fields/${id}`, data as Record<string, unknown>)
}

/** 删除领域 DELETE /fields/:id */
export function deleteField(id: number): Promise<ApiResponse<null>> {
  return del(`/fields/${id}`)
}

/** 更新领域状态 PATCH /fields/:id/status */
export function updateFieldStatus(
  id: number,
  data: UpdateFieldStatusParams,
): Promise<ApiResponse<null>> {
  return patch(`/fields/${id}/status`, data as unknown as Record<string, unknown>)
}
