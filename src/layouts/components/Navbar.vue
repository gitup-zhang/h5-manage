<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import {
  Fold,
  Expand,
  Refresh,
  FullScreen,
  ArrowDown,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout().then(() => {
    router.push('/login')
  })
}

function refreshPage() {
  router.replace({
    path: '/redirect' + router.currentRoute.value.fullPath,
  })
}
</script>

<template>
  <div class="navbar">
    <div class="navbar-left">
      <!-- 折叠按钮 -->
      <span class="collapse-btn" @click="appStore.toggleSidebar">
        <el-icon :size="20">
          <Fold v-if="!appStore.sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </span>

      <!-- 面包屑 -->
      <div class="breadcrumb-wrapper">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in route.matched" :key="item.path" :to="item.path">
            {{ item.meta?.title || item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="navbar-right">
      <!-- 刷新 -->
      <el-tooltip content="刷新页面" placement="bottom">
        <span class="navbar-icon" @click="refreshPage">
          <el-icon :size="18">
            <Refresh />
          </el-icon>
        </span>
      </el-tooltip>

      <!-- 全屏 -->
      <el-tooltip content="全屏" placement="bottom">
        <span class="navbar-icon">
          <el-icon :size="18">
            <FullScreen />
          </el-icon>
        </span>
      </el-tooltip>

      <!-- 用户下拉 -->
      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar :size="32" :src="userStore.avatar" />
          <span class="user-name">{{ userStore.nickname }}</span>
          <el-icon :size="12">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <span>个人中心</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <span style="color: #f56c6c">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;

  .navbar-left {
    display: flex;
    align-items: center;
  }

  .collapse-btn {
    cursor: pointer;
    margin-right: 16px;
    color: #606266;

    &:hover {
      color: #409eff;
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .navbar-icon {
    cursor: pointer;
    color: #606266;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      background-color: #f5f7fa;
      color: #409eff;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .user-name {
      font-size: 14px;
      color: #303133;
    }
  }
}
</style>
