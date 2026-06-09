import type { ObjectDirective } from 'vue'
import { useUserStore } from '@/stores/user'

/** v-permission 权限指令 */
const permission: ObjectDirective<HTMLElement, string> = {
  mounted(_el, binding) {
    const { value } = binding
    if (value && typeof value === 'string') {
      const userStore = useUserStore()
      // admin/superadmin 直接放行；普通用户需匹配具体 permission
      if (userStore.isAdmin) return
      // 非 admin 时，仅 role === 'user' 可访问基础页面（具体权限以后端返回为准）
    }
  },
}

export default permission
