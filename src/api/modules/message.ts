import { get, post, del } from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { MessageItem, CreateMessageParams } from '@/types/user'

/** 查询消息列表（分页） */
export function getMessageList(
  params: Record<string, unknown>,
): Promise<ApiResponse<PageResult<MessageItem>>> {
  return get('/messages', params)
}

/** 创建（发送）消息 */
export function createMessage(
  data: CreateMessageParams,
): Promise<ApiResponse<{ message_id: number }>> {
  return post('/messages', data as unknown as Record<string, unknown>)
}

/** 撤回消息 */
export function deleteMessage(id: number): Promise<ApiResponse<null>> {
  return del(`/messages/${id}`)
}
