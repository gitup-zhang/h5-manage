import { get, post, put, del, patch } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Industry, UpdateIndustryStatusParams } from '@/types/user'

/** 查询行业列表 GET /industries */
export function getIndustryList(
  params: Record<string, unknown>,
): Promise<ApiResponse<Industry[]>> {
  return get('/industries', params)
}

/** 创建行业 POST /industries */
export function createIndustry(data: Partial<Industry>): Promise<ApiResponse<null>> {
  return post('/industries', data as Record<string, unknown>)
}

/** 更新行业 PUT /industries/:id */
export function updateIndustry(
  id: number,
  data: Partial<Industry>,
): Promise<ApiResponse<null>> {
  return put(`/industries/${id}`, data as Record<string, unknown>)
}

/** 删除行业 DELETE /industries/:id */
export function deleteIndustry(id: number): Promise<ApiResponse<null>> {
  return del(`/industries/${id}`)
}

/** 更新行业状态 PATCH /industries/:id/status */
export function updateIndustryStatus(
  id: number,
  data: UpdateIndustryStatusParams,
): Promise<ApiResponse<null>> {
  return patch(`/industries/${id}/status`, data as unknown as Record<string, unknown>)
}
