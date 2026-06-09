import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  const hasPermission = computed(() => userStore.hasPermission)
  const isAdmin = computed(() => userStore.isAdmin)
  const isSuperAdmin = computed(() => userStore.isSuperAdmin)

  return {
    hasPermission,
    isAdmin,
    isSuperAdmin,
  }
}
