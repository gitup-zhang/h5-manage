import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface TagView {
  path: string
  name: string
  title: string
  query?: Record<string, unknown>
}

export const useTagsViewStore = defineStore('tagsView', () => {
  // State
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  // Getters
  const hasViews = computed(() => visitedViews.value.length > 0)

  // Actions
  function addView(view: TagView) {
    if (visitedViews.value.some((v) => v.path === view.path)) return
    visitedViews.value.push(view)
    // 加入缓存列表
    if (!cachedViews.value.includes(view.name)) {
      cachedViews.value.push(view.name)
    }
  }

  function removeView(view: TagView) {
    const index = visitedViews.value.findIndex((v) => v.path === view.path)
    if (index === -1) return
    visitedViews.value.splice(index, 1)
    // 移除缓存
    const cacheIndex = cachedViews.value.indexOf(view.name)
    if (cacheIndex > -1) {
      cachedViews.value.splice(cacheIndex, 1)
    }
    return { index, lastPath: visitedViews.value[visitedViews.value.length - 1]?.path }
  }

  function closeOthersViews(view: TagView) {
    visitedViews.value = visitedViews.value.filter(
      (v) => v.path === view.path || v.path === '/dashboard',
    )
    cachedViews.value = visitedViews.value.map((v) => v.name)
  }

  function closeAllViews() {
    visitedViews.value = visitedViews.value.filter((v) => v.path === '/dashboard')
    cachedViews.value = []
  }

  // 从路由添加标签
  function addViewFromRoute(route: RouteLocationNormalized) {
    const title = (route.meta?.title as string) || route.name?.toString() || ''
    if (!title || route.meta?.hidden) return
    addView({
      path: route.path,
      name: route.name?.toString() || '',
      title,
      query: route.query as Record<string, unknown>,
    })
  }

  return {
    visitedViews,
    cachedViews,
    hasViews,
    addView,
    removeView,
    closeOthersViews,
    closeAllViews,
    addViewFromRoute,
  }
})
