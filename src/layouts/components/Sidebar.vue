<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

interface MenuItem {
  path: string
  title: string
  icon: string
  children?: MenuItem[]
}

interface MenuGroup {
  title: string
  icon: string
  sort: number
  children: MenuItem[]
}

function generateMenus(): MenuItem[] {
  const routes = router.options.routes
  const result: MenuItem[] = []

  // 找到 DefaultLayout 的路由（path: '/'）
  const layoutRoute = routes.find((r) => r.path === '/' && r.component)
  if (!layoutRoute?.children) return result

  // 按 parentTitle 分组
  const groups = new Map<string, MenuGroup>()

  for (const child of layoutRoute.children) {
    if (child.meta?.hidden) continue

    const parentTitle = (child.meta?.parentTitle as string) || ''
    const parentIcon = (child.meta?.parentIcon as string) || ''
    const parentSort = (child.meta?.parentSort as number) || 0
    const childPath = `/${child.path}`.replace(/\/+/g, '/')
    const childTitle = (child.meta?.title as string) || child.name?.toString() || ''

    if (!parentTitle) {
      // 无父级分组 → 顶级菜单项（如仪表盘）
      result.push({
        path: childPath,
        title: childTitle,
        icon: (child.meta?.icon as string) || '',
      })
    } else {
      // 有父级分组 → 放入对应组
      if (!groups.has(parentTitle)) {
        groups.set(parentTitle, {
          title: parentTitle,
          icon: parentIcon,
          sort: parentSort,
          children: [],
        })
      }
      groups.get(parentTitle)!.children.push({
        path: childPath,
        title: childTitle,
        icon: '',
      })
    }
  }

  // 将分组转为子菜单，按 sort 排序
  const sortedGroups = [...groups.values()].sort((a, b) => a.sort - b.sort)
  for (const group of sortedGroups) {
    result.push({
      path: '',
      title: group.title,
      icon: group.icon,
      children: group.children,
    })
  }

  return result
}

const menus = computed(() => generateMenus())
const activeMenu = computed(() => route.path)

function handleSelect(path: string) {
  if (path) router.push(path)
}
</script>

<template>
  <div class="sidebar-container" :style="{ width: appStore.sidebarWidth }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="@/assets/images/logo.svg" alt="logo" class="logo-img" />
      <transition name="fade">
        <span v-show="!appStore.sidebarCollapsed" class="logo-title">管理后台</span>
      </transition>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      :collapse-transition="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      class="sidebar-menu"
      @select="handleSelect"
    >
      <template v-for="menu in menus" :key="menu.title">
        <!-- 单级菜单 -->
        <template v-if="!menu.children || menu.children.length === 0">
          <el-menu-item :index="menu.path">
            <span>{{ menu.title }}</span>
          </el-menu-item>
        </template>
        <!-- 多级菜单 -->
        <el-sub-menu v-else :index="menu.title">
          <template #title>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            :key="child.path"
            :index="child.path"
          >
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .sidebar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    padding: 0 16px;
    overflow: hidden;

    .logo-img {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .logo-title {
      margin-left: 10px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  .sidebar-menu {
    border-right: none;
    height: calc(100% - 50px);
    overflow-y: auto;
  }
}
</style>
