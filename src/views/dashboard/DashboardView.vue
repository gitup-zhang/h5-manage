<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Document, User, View, DataAnalysis } from '@element-plus/icons-vue'

interface StatCard {
  title: string
  value: number
  icon: typeof Document
  color: string
  trend: string
}

const stats = ref<StatCard[]>([
  { title: '文章总数', value: 0, icon: Document, color: '#409eff', trend: '篇' },
  { title: '今日访问', value: 0, icon: View, color: '#67c23a', trend: '次' },
  { title: '用户数量', value: 0, icon: User, color: '#e6a23c', trend: '人' },
  { title: '媒体文件', value: 0, icon: DataAnalysis, color: '#f56c6c', trend: '个' },
])

const quickActions = [
  { label: '新建文章', path: '/content/articles/create', color: '#409eff' },
  { label: '媒体上传', path: '/media/library', color: '#67c23a' },
  { label: '用户管理', path: '/system/users', color: '#e6a23c' },
  { label: '分类管理', path: '/content/categories', color: '#909399' },
]

onMounted(() => {
  // 模拟数据
  stats.value[0].value = 128
  stats.value[1].value = 2560
  stats.value[2].value = 46
  stats.value[3].value = 382
})
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>仪表盘</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col v-for="stat in stats" :key="stat.title" :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stat.value.toLocaleString() }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24" color="#fff">
                <component :is="stat.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions" shadow="hover">
      <template #header>
        <span class="card-title">快捷操作</span>
      </template>
      <div class="actions-grid">
        <router-link
          v-for="action in quickActions"
          :key="action.path"
          :to="action.path"
          class="action-item"
          :style="{ borderColor: action.color }"
        >
          <span class="action-label" :style="{ color: action.color }">
            {{ action.label }}
          </span>
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  .page-header {
    margin-bottom: 16px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .stats-row {
    margin-bottom: 16px;
  }

  .stat-card {
    margin-bottom: 16px;

    .stat-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
    }

    .stat-title {
      margin-top: 4px;
      font-size: 14px;
      color: #909399;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 12px;
    }
  }

  .quick-actions {
    .card-title {
      font-size: 16px;
      font-weight: 600;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }

    .action-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 80px;
      border: 2px dashed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .action-label {
        font-size: 15px;
        font-weight: 500;
      }
    }
  }
}
</style>
