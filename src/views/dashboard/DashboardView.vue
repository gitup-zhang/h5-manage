<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { formatDate, formatNumber } from '@/utils/format'
import { useECharts } from '@/composables/useECharts'
import {
  getDashboardUserSummary,
  getDashboardEvents,
  getDashboardEventStatistics,
} from '@/api/modules/dashboard'
import type { DashboardEventItem, DashboardStatistics } from '@/types/user'
import {
  UserFilled,
  Calendar,
  TrendCharts,
  DataLine,
  Clock,
} from '@element-plus/icons-vue'

const userStore = useUserStore()

// ===== 加载状态 =====
const loading = ref(true)
const statsLoading = ref(false)

// ===== 统计数据 =====
const userTotal = ref(0)
const events = ref<DashboardEventItem[]>([])
const selectedEventId = ref<number | null>(null)
const statistics = ref<DashboardStatistics | null>(null)

// ===== 派生数据 =====
const today = computed(() => formatDate(new Date().toISOString(), 'YYYY-MM-DD HH:mm'))

const eventTotal = computed(() => events.value.length)

const inProgressCount = computed(() =>
  events.value.filter(e => e.status === '进行中').length,
)

const totalRegistrants = computed(() =>
  events.value.reduce((sum, e) => sum + e.current_registrants, 0),
)

const selectedEvent = computed(() =>
  events.value.find(e => e.id === selectedEventId.value) || null,
)

// ===== 状态标签映射 =====
function getStatusTagType(status: string): 'success' | 'info' | 'warning' | 'danger' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    '进行中': 'success',
    '未开始': 'info',
    '已结束': 'warning',
  }
  return map[status] || 'info'
}

// ===== 报名进度百分比 =====
function getRegProgress(row: DashboardEventItem): number {
  if (row.max_registrants <= 0) return 0
  return Math.round((row.current_registrants / row.max_registrants) * 100)
}

// ===== API 调用 =====
async function fetchUserSummary() {
  try {
    const res = await getDashboardUserSummary()
    userTotal.value = res.data.total_count
  } catch {
    userTotal.value = 0
  }
}

async function fetchEvents() {
  try {
    const res = await getDashboardEvents()
    events.value = res.data.list || []
    // 自动选中第一个活动
    if (events.value.length > 0 && !selectedEventId.value) {
      selectedEventId.value = events.value[0].id
      fetchStatistics(events.value[0].id)
    }
  } catch {
    events.value = []
  }
}

async function fetchStatistics(eventId: number) {
  statsLoading.value = true
  try {
    const res = await getDashboardEventStatistics(eventId)
    statistics.value = res.data
    await nextTick()
    updateCharts()
  } catch {
    statistics.value = null
  } finally {
    statsLoading.value = false
  }
}

// ===== 活动选中 =====
function selectEvent(row: DashboardEventItem) {
  if (row.id === selectedEventId.value) return
  selectedEventId.value = row.id
  fetchStatistics(row.id)
}

// ===== 图表 =====
const pieChartRef = ref<HTMLElement | null>(null)
const barChartRef = ref<HTMLElement | null>(null)
const { setOption: setPieOption } = useECharts(pieChartRef)
const { setOption: setBarOption } = useECharts(barChartRef)

const chartColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#5470c6', '#91cc75', '#fac858']

function updateCharts() {
  if (!statistics.value) return
  updatePieChart()
  updateBarChart()
}

function updatePieChart() {
  const data = statistics.value!.by_field
    .filter(item => item.count > 0)
    .map((item, i) => ({
      name: item.name,
      value: item.count,
      itemStyle: { color: chartColors[i % chartColors.length] },
    }))

  if (data.length === 0) return

  setPieOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['35%', '70%'],
        center: ['50%', '45%'],
        roseType: 'area',
        itemStyle: { borderRadius: 4 },
        data,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
      },
    ],
  })
}

function updateBarChart() {
  const items = [...(statistics.value?.by_department || [])]
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)

  if (items.length === 0) return

  setBarOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: items.map(i => i.name).reverse(),
      axisLabel: { fontSize: 11 },
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        data: items.map(i => i.count).reverse(),
        itemStyle: {
          color: '#409eff',
          borderRadius: [0, 4, 4, 0],
        },
        barMaxWidth: 28,
      },
    ],
  })
}

// ===== 卡片背景色 =====
function getCardBg(index: number): string {
  const colors = ['#ecf5ff', '#f0f9eb', '#fdf6ec', '#fef0f0']
  return colors[index] || '#f5f7fa'
}

function getCardIconColor(index: number): string {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c']
  return colors[index] || '#909399'
}

// ===== 生命周期 =====
onMounted(async () => {
  await Promise.all([fetchUserSummary(), fetchEvents()])
  loading.value = false
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- 欢迎区域 -->
    <div class="welcome-row">
      <div class="welcome-title">
        <h2>欢迎回来，{{ userStore.nickname || '用户' }}</h2>
        <p class="welcome-sub">
          <el-icon><Clock /></el-icon>
          数据更新时间：{{ today }}
        </p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card" :style="{ backgroundColor: getCardBg(0) }">
          <div class="stat-icon" :style="{ color: getCardIconColor(0) }">
            <el-icon :size="28"><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(userTotal) }}<span class="stat-unit">人</span></div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card" :style="{ backgroundColor: getCardBg(1) }">
          <div class="stat-icon" :style="{ color: getCardIconColor(1) }">
            <el-icon :size="28"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ eventTotal }}<span class="stat-unit">个</span></div>
            <div class="stat-label">活动总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card" :style="{ backgroundColor: getCardBg(2) }">
          <div class="stat-icon" :style="{ color: getCardIconColor(2) }">
            <el-icon :size="28"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ inProgressCount }}<span class="stat-unit">个</span></div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card" :style="{ backgroundColor: getCardBg(3) }">
          <div class="stat-icon" :style="{ color: getCardIconColor(3) }">
            <el-icon :size="28"><DataLine /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(totalRegistrants) }}<span class="stat-unit">人次</span></div>
            <div class="stat-label">总报名人次</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 活动列表 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <span class="card-title">活动概览</span>
      </template>
      <el-table
        :data="events"
        highlight-current-row
        style="width: 100%"
        @row-click="selectEvent"
        :row-class-name="({ row }: { row: DashboardEventItem }) =>
          row.id === selectedEventId ? 'selected-row' : ''
        "
      >
        <el-table-column prop="title" label="活动标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报名进度" width="200">
          <template #default="{ row }">
            <div class="progress-cell">
              <el-progress
                :percentage="getRegProgress(row)"
                :stroke-width="8"
                :color="row.status === '进行中' ? '#67c23a' : row.status === '已结束' ? '#909399' : '#409eff'"
              />
              <span class="progress-text">
                {{ row.max_registrants > 0 ? `${row.current_registrants}/${row.max_registrants}` : `${row.current_registrants}/不限` }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="130">
          <template #default="{ row }">
            {{ formatDate(row.event_start_time, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
      </el-table>
      <div v-if="events.length === 0 && !loading" class="empty-hint">
        <el-empty description="暂无活动数据" :image-size="80" />
      </div>
      <div v-if="selectedEvent" class="table-hint">
        当前选中「{{ selectedEvent.title }}」— 下方展示该活动的报名统计图表
      </div>
    </el-card>

    <!-- 统计图表 -->
    <div v-if="selectedEventId && (statistics || statsLoading)" class="charts-section">
      <el-row :gutter="16">
        <el-col :xs="24" :lg="12">
          <el-card shadow="never" v-loading="statsLoading">
            <template #header>
              <span class="card-title">报名领域分布</span>
            </template>
            <div ref="pieChartRef" class="chart-container" />
            <div v-if="statistics && statistics.by_field.filter(i => i.count > 0).length === 0" class="chart-empty">
              暂无数据
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card shadow="never" v-loading="statsLoading">
            <template #header>
              <span class="card-title">报名部门分布</span>
            </template>
            <div ref="barChartRef" class="chart-container" />
            <div v-if="statistics && statistics.by_department.filter(i => i.count > 0).length === 0" class="chart-empty">
              暂无数据
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  .welcome-row {
    margin-bottom: 20px;

    .welcome-title {
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .welcome-sub {
        margin: 6px 0 0;
        font-size: 13px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .stat-cards {
    margin-bottom: 20px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-radius: 8px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.8);
    }

    .stat-info {
      flex: 1;
      min-width: 0;

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #303133;
        line-height: 1.2;

        .stat-unit {
          font-size: 14px;
          font-weight: 400;
          color: #909399;
          margin-left: 4px;
        }
      }

      .stat-label {
        margin-top: 4px;
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .section-card {
    margin-bottom: 20px;

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
  }

  .progress-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-progress {
      flex: 1;
    }

    .progress-text {
      flex-shrink: 0;
      font-size: 12px;
      color: #909399;
      white-space: nowrap;
    }
  }

  .empty-hint {
    margin-top: 16px;
  }

  .table-hint {
    margin-top: 12px;
    font-size: 12px;
    color: #909399;
    text-align: center;
  }

  .charts-section {
    .chart-container {
      width: 100%;
      height: 300px;
    }

    .chart-empty {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      font-size: 14px;
    }
  }
}

// 选中行高亮
:deep(.selected-row) {
  background-color: #ecf5ff !important;

  &:hover > td {
    background-color: #d9ecff !important;
  }
}
</style>
