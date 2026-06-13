<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import { useCrud } from '@/composables/useCrud'
import { getEventList, deleteEvent } from '@/api/modules/event'
import type { EventItem } from '@/types/user'
import { formatDate } from '@/utils/format'

const router = useRouter()

const searchFields = [
  { label: '活动标题', prop: 'event_title', placeholder: '按标题搜索' },
  {
    label: '状态',
    prop: 'event_status',
    type: 'select' as const,
    options: [
      { label: '未开始', value: 'NotBegun' },
      { label: '进行中', value: 'InProgress' },
      { label: '已结束', value: 'Completed' },
    ],
  },
]

const columns = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'title', label: '活动标题', minWidth: 200 },
  { prop: 'event_address', label: '地点', width: 160 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'member_count', label: '报名/上限', width: 120 },
  { prop: 'invite_code', label: '邀请码', width: 100 },
  { prop: 'event_start_time', label: '开始时间', width: 170 },
]

const { tableData, pagination, loading, fetchData, handleSearch, handleReset, handleDelete } =
  useCrud<EventItem>({
    fetchApi: getEventList,
    deleteApi: deleteEvent,
    deleteMessage: '确认删除该活动？删除后用户将无法查看和报名。',
  })

function handleCreate() {
  router.push('/event/create')
}

function handleEdit(row: EventItem) {
  router.push(`/event/${row.id}/edit`)
}

function handleDetail(row: EventItem) {
  router.push(`/event/${row.id}/detail`)
}

function handleRegistrations(row: EventItem) {
  router.push(`/event/${row.id}/registrations`)
}

function getStatusTag(status: string) {
  const map: Record<string, { label: string; type: 'success' | 'warning' | 'info' | 'danger' }> = {
    '未开始': { label: '未开始', type: 'info' },
    '正在进行': { label: '进行中', type: 'success' },
    '已结束': { label: '已结束', type: 'info' },
  }
  return map[status] || { label: status || '未知', type: 'info' as const }
}

fetchData()
</script>

<template>
  <div class="event-list">
    <PageHeader title="活动列表" description="管理所有活动">
      <template #default>
        <el-button type="primary" :icon="Plus" @click="handleCreate">创建活动</el-button>
        <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
      </template>
    </PageHeader>

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column v-for="col in columns" :key="col.prop" v-bind="col">
          <template v-if="col.prop === 'status'" #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
          <template v-else-if="col.prop === 'member_count'" #default="{ row }">
            {{ row.current_registrants }}{{ row.max_registrants > 0 ? ` / ${row.max_registrants}` : ' / 不限' }}
          </template>
          <template v-else-if="col.prop === 'invite_code'" #default="{ row }">
            <span v-if="row.invite_code">{{ row.invite_code }}</span>
            <span v-else>-</span>
          </template>
          <template v-else-if="col.prop === 'event_start_time'" #default="{ row }">
            {{ formatDate(row.event_start_time) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button type="primary" size="small" link @click="handleDetail(row)">详情</el-button>
              <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" size="small" link @click="handleRegistrations(row)">报名</el-button>
              <el-button type="danger" size="small" link @click="handleDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
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
.event-list {
  .action-btns {
    display: flex;
    gap: 4px;
  }
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
