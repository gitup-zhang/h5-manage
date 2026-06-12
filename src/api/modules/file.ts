import { post, del } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

/** 上传结果 */
export interface UploadResult {
  id: number
  file_name: string
  url: string
}

/**
 * 上传文件到 MinIO
 * @param file 文件对象
 * @param bizType 业务类型，如 'EVENT'，头像为空
 * @param bizId 关联业务ID
 */
export function uploadFile(
  file: File,
  bizType?: string,
  bizId?: number,
): Promise<ApiResponse<UploadResult>> {
  const formData = new FormData()
  formData.append('file', file)
  if (bizType) formData.append('biz_type', bizType)
  if (bizId) formData.append('biz_id', String(bizId))

  return post('/files', formData as unknown as Record<string, unknown>, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 删除文件
 * @param id 文件ID
 */
export function deleteFile(id: number): Promise<ApiResponse<null>> {
  return del(`/files/${id}`)
}
