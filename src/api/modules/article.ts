import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'

/** 文章 */
export interface Article {
  id: number
  title: string
  content: string
  summary: string
  cover: string
  categoryId: number
  categoryName: string
  tags: string[]
  status: 0 | 1 | 2 // 0-草稿 1-已发布 2-已下架
  author: string
  viewCount: number
  createdAt: string
  updatedAt: string
}

/** 文章分类 */
export interface Category {
  id: number
  name: string
  parentId: number
  sort: number
  articleCount: number
  children?: Category[]
}

/** 文章列表 */
export function getArticleList(
  params: Record<string, unknown>,
): Promise<ApiResponse<PageResult<Article>>> {
  return get('/articles', params)
}

/** 文章详情 */
export function getArticleDetail(id: number): Promise<ApiResponse<Article>> {
  return get(`/articles/${id}`)
}

/** 创建文章 */
export function createArticle(data: Partial<Article>): Promise<ApiResponse<Article>> {
  return post('/articles', data as Record<string, unknown>)
}

/** 更新文章 */
export function updateArticle(id: number, data: Partial<Article>): Promise<ApiResponse<Article>> {
  return put(`/articles/${id}`, data as Record<string, unknown>)
}

/** 删除文章 */
export function deleteArticle(id: number): Promise<ApiResponse<null>> {
  return del(`/articles/${id}`)
}

/** 分类树 */
export function getCategoryTree(): Promise<ApiResponse<Category[]>> {
  return get('/categories/tree')
}

/** 创建分类 */
export function createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
  return post('/categories', data as Record<string, unknown>)
}

/** 更新分类 */
export function updateCategory(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
  return put(`/categories/${id}`, data as Record<string, unknown>)
}

/** 删除分类 */
export function deleteCategory(id: number): Promise<ApiResponse<null>> {
  return del(`/categories/${id}`)
}
