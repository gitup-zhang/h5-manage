import { ref, watch, onUnmounted, type Ref } from 'vue'
import * as echarts from 'echarts'
import { useResizeObserver } from '@vueuse/core'

export function useECharts(containerRef: Ref<HTMLElement | null>) {
  const chartInstance = ref<echarts.ECharts | null>(null)

  // 初始化图表
  function init() {
    const el = containerRef.value
    if (!el) return
    chartInstance.value = echarts.init(el)
  }

  // 设置/更新图表配置
  function setOption(option: echarts.EChartsOption, notMerge = true) {
    chartInstance.value?.setOption(option, notMerge)
  }

  // 手动 resize
  function resize() {
    chartInstance.value?.resize()
  }

  // 监听容器就绪后初始化
  const stopWatch = watch(
    containerRef,
    (el) => {
      if (el && !chartInstance.value) {
        init()
      }
    },
    { immediate: true },
  )

  // 窗口尺寸变化时自动 resize
  useResizeObserver(containerRef, () => {
    chartInstance.value?.resize()
  })

  // 清理
  onUnmounted(() => {
    stopWatch()
    chartInstance.value?.dispose()
    chartInstance.value = null
  })

  return {
    chartInstance,
    setOption,
    resize,
  }
}
