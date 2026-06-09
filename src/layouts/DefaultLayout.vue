<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'
import AppMain from './components/AppMain.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <div class="default-layout" :class="{ collapsed: appStore.sidebarCollapsed }">
    <!-- 侧边栏 -->
    <Sidebar class="layout-sidebar" />

    <!-- 右侧主体 -->
    <div class="layout-right">
      <!-- 顶栏 -->
      <Navbar class="layout-navbar" />

      <!-- 标签页 -->
      <TagsView class="layout-tags" />

      <!-- 主内容区 -->
      <AppMain class="layout-main" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.default-layout {
  display: flex;
  height: 100%;
  overflow: hidden;

  .layout-sidebar {
    flex-shrink: 0;
  }

  .layout-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: margin-left 0.3s;
  }

  .layout-navbar {
    flex-shrink: 0;
  }

  .layout-tags {
    flex-shrink: 0;
  }

  .layout-main {
    flex: 1;
    overflow: hidden;
  }
}
</style>
