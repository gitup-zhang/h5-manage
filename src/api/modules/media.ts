import { get, post, del } from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'

/** 媒体文件 */
export interface MediaFile {
  id: number
  name: string
  url: string
  size: number
  type: string
  mimeType: string
  width?: number
  height?: number
  createdAt: string
}

/** 媒体列表 */
export function getMediaList(
  params: Record<string, unknown>,
): Promise<ApiResponse<PageResult<MediaFile>>> {
  return get('/media', params)
}

/** 上传文件 */
export function uploadFile(file: File): Promise<ApiResponse<MediaFile>> {
  const formData = new FormData()
  formData.append('file', file)
  return post('/media/upload', formData as unknown as Record<string, unknown>, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 批量上传 */
export function uploadFiles(files: File[]): Promise<ApiResponse<MediaFile[]>> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return post('/media/batch-upload', formData as unknown as Record<string, unknown>, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 删除文件 */
export function deleteMedia(id: number): Promise<ApiResponse<null>> {
  return del(`/media/${id}`)
}
