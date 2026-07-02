<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
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
  ArrowLeft,
  ArrowRight,
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

// ===== 活动卡片横向滚动 =====
const eventCardsRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = eventCardsRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 1
}

function scrollLeft() {
  const el = eventCardsRef.value
  if (!el) return
  el.scrollBy({ left: -300, behavior: 'smooth' })
}

function scrollRight() {
  const el = eventCardsRef.value
  if (!el) return
  el.scrollBy({ left: 300, behavior: 'smooth' })
}

// 监听活动数据变化，等 DOM 渲染完成后更新滚动状态
watch(events, async () => {
  await nextTick()
  updateScrollState()
})

// 鼠标滚轮横向滚动
function onCardWheel(e: WheelEvent) {
  const el = eventCardsRef.value
  if (!el) return
  // 如果有纵向滚动，优先纵向；否则转为横向
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault()
    el.scrollLeft += e.deltaY
  }
}

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

function getRegColor(row: DashboardEventItem): string {
  if (row.status === '进行中') return '#67c23a'
  if (row.status === '已结束') return '#909399'
  return '#409eff'
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
      await fetchStatistics(events.value[0].id)
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
    await nextTick()
    updateCharts()
  } finally {
    statsLoading.value = false
  }
}

// ===== 活动选中 =====
async function selectEvent(row: DashboardEventItem) {
  if (row.id === selectedEventId.value) return
  selectedEventId.value = row.id
  await fetchStatistics(row.id)
}

// ===== 图表 =====
const pieChartRef = ref<HTMLElement | null>(null)
const barChartRef = ref<HTMLElement | null>(null)
const { setOption: setPieOption } = useECharts(pieChartRef)
const { setOption: setBarOption } = useECharts(barChartRef)

const chartColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#5470c6', '#91cc75', '#fac858']

function updateCharts() {
  updatePieChart()
  updateBarChart()
}

function updatePieChart() {
  const data = (statistics.value?.by_field || [])
    .filter(item => item.count > 0)
    .map((item, i) => ({
      name: item.name,
      value: item.count,
      itemStyle: { color: chartColors[i % chartColors.length] },
    }))

  setPieOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['35%', '70%'],
        center: ['50%', '45%'],
        itemStyle: { borderRadius: 4 },
        data: data.length > 0 ? data : [{ name: '暂无数据', value: 1, itemStyle: { color: '#e0e0e0' } }],
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        silent: data.length === 0,
      },
    ],
  })
}

function updateBarChart() {
  const items = [...(statistics.value?.by_industry || [])]
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)

  setBarOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: items.length > 0 ? items.map(i => i.name).reverse() : ['暂无数据'],
      axisLabel: { fontSize: 11 },
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        data: items.length > 0 ? items.map(i => i.count).reverse() : [],
        itemStyle: {
          color: items.length > 0 ? '#409eff' : '#e0e0e0',
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
  await nextTick()
  updateScrollState()
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

    <!-- 活动概览 - 横向滚动卡片 -->
    <el-card shadow="never" class="section-card event-overview-card">
      <template #header>
        <div class="card-header-row">
          <span class="card-title">活动概览</span>
          <span class="card-count">{{ events.length }} 个活动</span>
        </div>
      </template>
      <div v-if="events.length > 0" class="event-scroll-area">
        <button
          class="scroll-arrow scroll-arrow--left"
          :class="{ 'is-disabled': !canScrollLeft }"
          :disabled="!canScrollLeft"
          @click="scrollLeft"
        >
          <el-icon :size="18"><ArrowLeft /></el-icon>
        </button>
        <div
          ref="eventCardsRef"
          class="event-cards"
          @scroll="updateScrollState"
          @wheel="onCardWheel"
        >
          <div
            v-for="event in events"
            :key="event.id"
            class="event-card"
            :class="{ 'is-active': event.id === selectedEventId }"
            @click="selectEvent(event)"
          >
            <div class="event-card__body">
              <h4 class="event-card__title" :title="event.title">{{ event.title }}</h4>
              <div class="event-card__meta">
                <el-tag :type="getStatusTagType(event.status)" size="small" class="event-card__tag">
                  {{ event.status }}
                </el-tag>
                <span class="event-card__date">{{ formatDate(event.event_start_time, 'MM-DD') }}</span>
              </div>
              <div class="event-card__progress">
                <el-progress
                  :percentage="getRegProgress(event)"
                  :stroke-width="6"
                  :color="getRegColor(event)"
                  :show-text="false"
                />
                <span class="event-card__count">
                  {{ event.max_registrants > 0 ? `${event.current_registrants}/${event.max_registrants}` : `${event.current_registrants}/不限` }}
                </span>
              </div>
            </div>
            <div v-if="event.id === selectedEventId" class="event-card__check">
              <span class="check-dot" />
            </div>
          </div>
        </div>
        <button
          class="scroll-arrow scroll-arrow--right"
          :class="{ 'is-disabled': !canScrollRight }"
          :disabled="!canScrollRight"
          @click="scrollRight"
        >
          <el-icon :size="18"><ArrowRight /></el-icon>
        </button>
      </div>
      <div v-if="events.length === 0 && !loading" class="empty-hint">
        <el-empty description="暂无活动数据" :image-size="80" />
      </div>
      <div v-if="selectedEvent" class="card-hint">
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
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card shadow="never" v-loading="statsLoading">
            <template #header>
              <span class="card-title">报名行业分布</span>
            </template>
            <div ref="barChartRef" class="chart-container" />
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

  // ===== 活动概览卡片 =====
  .event-overview-card {
    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-count {
      font-size: 12px;
      color: #909399;
    }
  }

  .event-scroll-area {
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .scroll-arrow {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 1px solid #e4e7ed;
    border-radius: 50%;
    background: #fff;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 1;
    padding: 0;

    &:hover:not(:disabled) {
      background: #ecf5ff;
      border-color: #409eff;
      color: #409eff;
    }

    &.is-disabled,
    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .scroll-arrow--left {
    margin-right: 4px;
  }

  .scroll-arrow--right {
    margin-left: 4px;
  }

  .event-cards {
    flex: 1;
    min-width: 0;
    display: flex;
    gap: 12px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 0;
    scroll-behavior: smooth;

    // 隐藏滚动条但保持可滚动
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .event-card {
    flex-shrink: 0;
    width: 220px;
    border: 1.5px solid #e4e7ed;
    border-radius: 8px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    background: #fff;

    &:hover {
      border-color: #c6e2ff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
    }

    &.is-active {
      border-color: #409eff;
      background: #f0f7ff;
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.18);
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__tag {
      flex-shrink: 0;
    }

    &__date {
      font-size: 12px;
      color: #909399;
      white-space: nowrap;
    }

    &__progress {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-progress {
        flex: 1;
      }
    }

    &__count {
      flex-shrink: 0;
      font-size: 11px;
      color: #909399;
      white-space: nowrap;
    }

    &__check {
      position: absolute;
      top: -1px;
      right: -1px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 22px 22px 0;
      border-color: transparent #409eff transparent transparent;

      .check-dot {
        display: none;
      }
    }
  }

  .empty-hint {
    margin-top: 16px;
  }

  .card-hint {
    margin-top: 12px;
    font-size: 12px;
    color: #909399;
    text-align: center;
  }

  // ===== 图表区域 =====
  .charts-section {
    .chart-container {
      width: 100%;
      height: 300px;
    }
  }
}
</style>
