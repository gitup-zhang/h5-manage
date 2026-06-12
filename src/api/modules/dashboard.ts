import { get } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { DashboardUserSummary, DashboardEventItem, DashboardStatistics } from '@/types/user'

/** 获取用户概览 GET /dashboard/users */
export function getDashboardUserSummary(): Promise<ApiResponse<DashboardUserSummary>> {
  return get('/dashboard/users', { page: 1, page_size: 1 })
}

/** 获取活动列表 GET /dashboard/events */
export function getDashboardEvents(): Promise<ApiResponse<{ total: number; list: DashboardEventItem[] }>> {
  return get('/dashboard/events')
}

/** 获取活动报名统计 GET /dashboard/events/:id/statistics */
export function getDashboardEventStatistics(id: number): Promise<ApiResponse<DashboardStatistics>> {
  return get(`/dashboard/events/${id}/statistics`)
}
