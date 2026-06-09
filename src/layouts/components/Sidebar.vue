<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ElMenu, ElMenuItem, ElSubMenu } from 'element-plus'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 从路由配置生成菜单
interface MenuItem {
  path: string
  title: string
  icon: string
  children?: MenuItem[]
}

function generateMenus(): MenuItem[] {
  const routes = router.options.routes
  const menus: MenuItem[] = []

  for (const route of routes) {
    // 跳过隐藏的、没有 children 的顶层路由
    if (route.meta?.hidden || !route.children) continue

    const children = route.children
      .filter((child) => !child.meta?.hidden)
      .map((child) => ({
        path: `${route.path}/${child.path}`.replace(/\/+/g, '/'),
        title: (child.meta?.title as string) || child.name?.toString() || '',
        icon: (child.meta?.icon as string) || '',
      }))

    if (children.length > 0) {
      menus.push({
        path: route.path,
        title: (route.meta?.title as string) || route.name?.toString() || '',
        icon: (route.meta?.icon as string) || '',
        children,
      })
    }
  }

  return menus
}

const menus = computed(() => generateMenus())
const activeMenu = computed(() => route.path)

function handleSelect(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="sidebar-container" :style="{ width: appStore.sidebarWidth }">
    <!-- Logo 区域 -->
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
      <template v-for="menu in menus" :key="menu.path">
        <!-- 单级菜单 -->
        <template v-if="!menu.children || menu.children.length === 0">
          <el-menu-item :index="menu.path">
            <span>{{ menu.title }}</span>
          </el-menu-item>
        </template>
        <!-- 多级菜单 -->
        <el-sub-menu v-else :index="menu.path">
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
