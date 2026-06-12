<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { getEventRegistrations } from '@/api/modules/event'
import { usePagination } from '@/composables/usePagination'
import type { EventRegistration } from '@/types/user'

const route = useRoute()
const router = useRouter()

const eventId = Number(route.params.id)
const tableData = ref<EventRegistration[]>([])
const { pagination, loading } = usePagination()

const columns = [
  { prop: 'name', label: '姓名', width: 100 },
  { prop: 'phone_number', label: '手机号', width: 130 },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'industry_name', label: '行业', width: 120 },
  { prop: 'position', label: '职位', width: 120 },
  { prop: 'unit', label: '单位', minWidth: 160 },
  { prop: 'department', label: '部门', width: 120 },
]

async function fetchData() {
  loading.value = true
  try {
    const res = await getEventRegistrations(eventId, {
      page: pagination.page,
      page_size: pagination.pageSize,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

async function exportExcel() {
  try {
    // 先获取总数
    const countRes = await getEventRegistrations(eventId, { page: 1, page_size: 1 })
    const total = countRes.data.total
    if (total === 0) {
      ElMessage.warning('暂无报名数据可导出')
      return
    }

    // 一次性拉取全部数据
    ElMessage.info('正在导出...')
    const res = await getEventRegistrations(eventId, { page: 1, page_size: total })
    const list = res.data.list

    // 组装 Excel 行数据
    const rows = list.map((item) => ({
      '姓名': item.name,
      '手机号': item.phone_number,
      '邮箱': item.email,
      '行业': item.industry_name,
      '职位': item.position,
      '单位': item.unit,
      '部门': item.department,
    }))

    // 生成并下载
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '报名列表')
    XLSX.writeFile(wb, `活动报名列表_${eventId}.xlsx`)

    ElMessage.success(`成功导出 ${list.length} 条记录`)
  } catch {
    // 错误由拦截器处理
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="event-registrations">
    <div class="edit-header">
      <el-button :icon="ArrowLeft" text @click="goBack">返回活动列表</el-button>
      <el-button type="success" @click="exportExcel">导出 Excel</el-button>
      <span class="page-subtitle">活动 #{{ eventId }} 报名用户</span>
    </div>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column v-for="col in columns" :key="col.prop" v-bind="col" />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchData"
          @size-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.event-registrations {
  .edit-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .page-subtitle {
      font-size: 15px;
      color: #606266;
    }
  }
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
