import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { EventItem, EventDetail, EventParams, EventRegistration } from '@/types/user'

/** 活动列表 */
export function getEventList(
  params: Record<string, unknown>,
): Promise<ApiResponse<PageResult<EventItem>>> {
  return get('/events', params)
}

/** 活动详情 */
export function getEventDetail(id: number): Promise<ApiResponse<EventDetail>> {
  return get(`/events/${id}`)
}

/** 创建活动 */
export function createEvent(data: EventParams): Promise<ApiResponse<{ event_id: number }>> {
  return post('/events', data as unknown as Record<string, unknown>)
}

/** 更新活动 */
export function updateEvent(id: number, data: Partial<EventParams>): Promise<ApiResponse<null>> {
  return put(`/events/${id}`, data as unknown as Record<string, unknown>)
}

/** 删除活动 */
export function deleteEvent(id: number): Promise<ApiResponse<null>> {
  return del(`/events/${id}`)
}

/** 活动报名用户列表 */
export function getEventRegistrations(
  id: number,
  params?: Record<string, unknown>,
): Promise<ApiResponse<PageResult<EventRegistration>>> {
  return get(`/events/${id}/registrations`, params)
}
