import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { Role, MenuItem } from '@/types/user'

/** 角色列表 */
export function getRoleList(params: Record<string, unknown>): Promise<ApiResponse<PageResult<Role>>> {
  return get('/roles', params)
}

/** 所有角色（不分页） */
export function getAllRoles(): Promise<ApiResponse<Role[]>> {
  return get('/roles/all')
}

/** 角色详情 */
export function getRoleDetail(id: number): Promise<ApiResponse<Role>> {
  return get(`/roles/${id}`)
}

/** 创建角色 */
export function createRole(data: Partial<Role>): Promise<ApiResponse<Role>> {
  return post('/roles', data as Record<string, unknown>)
}

/** 更新角色 */
export function updateRole(id: number, data: Partial<Role>): Promise<ApiResponse<Role>> {
  return put(`/roles/${id}`, data as Record<string, unknown>)
}

/** 删除角色 */
export function deleteRole(id: number): Promise<ApiResponse<null>> {
  return del(`/roles/${id}`)
}

/** 获取菜单树 */
export function getMenuTree(): Promise<ApiResponse<MenuItem[]>> {
  return get('/menus/tree')
}

/** 更新菜单 */
export function updateMenu(data: MenuItem[]): Promise<ApiResponse<null>> {
  return put('/menus', data as unknown as Record<string, unknown>)
}
