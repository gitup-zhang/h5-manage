import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const device = ref<'desktop' | 'mobile'>('desktop')
  const themeColor = ref('#409eff')

  // Getters
  const sidebarWidth = computed(() =>
    sidebarCollapsed.value ? '64px' : '220px',
  )
  const isMobile = computed(() => device.value === 'mobile')

  // Actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setDevice(dev: 'desktop' | 'mobile') {
    device.value = dev
  }

  function setThemeColor(color: string) {
    themeColor.value = color
    // 动态修改 Element Plus CSS 变量
    document.documentElement.style.setProperty('--el-color-primary', color)
  }

  return {
    sidebarCollapsed,
    device,
    themeColor,
    sidebarWidth,
    isMobile,
    toggleSidebar,
    setDevice,
    setThemeColor,
  }
})
