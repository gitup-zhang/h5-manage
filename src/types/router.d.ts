import type { _RouteRecordBase } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 菜单图标 */
    icon?: string
    /** 是否隐藏菜单 */
    hidden?: boolean
    /** 是否缓存页面 */
    keepAlive?: boolean
    /** 权限标识 */
    permission?: string
    /** 排序权重 */
    sort?: number
  }
}
