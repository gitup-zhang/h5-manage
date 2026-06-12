<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Refresh, View } from '@element-plus/icons-vue'
import { getMessageList, deleteMessage } from '@/api/modules/message'
import { getFieldList } from '@/api/modules/field'
import { useCrud } from '@/composables/useCrud'
import PageHeader from '@/components/common/PageHeader.vue'
import type { MessageItem, Field } from '@/types/user'

const router = useRouter()

// ===== 领域选项 =====
const fieldOptions = ref<Field[]>([])

onMounted(async () => {
  try {
    const res = await getFieldList({})
    fieldOptions.value = res.data || []
  } catch { /* ignore */ }
})

// 领域名称映射
const fieldNameMap = computed(() => {
  const map: Record<number, string> = {}
  for (const f of fieldOptions.value) {
    map[f.id] = f.field_name
  }
  return map
})

// ===== 表格列 =====
const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'title', label: '消息标题', minWidth: 200 },
  { prop: 'target_type', label: '目标类型', width: 120 },
  { prop: 'target_id', label: '目标领域', width: 140 },
  { prop: 'send_time', label: '发送时间', width: 180 },
  { prop: 'create_time', label: '创建时间', width: 180 },
]

// ===== CRUD =====
const { tableData, pagination, loading, searchParams, fetchData, handleDelete } =
  useCrud<MessageItem>({
    fetchApi: getMessageList,
    deleteApi: deleteMessage,
    deleteMessage: '确认撤回该消息？撤回后用户将无法再查看。',
  })

fetchData()

// ===== 搜索表单（内联，支持条件渲染） =====
const searchForm = reactive({
  title: '',
  target_type: '' as string,
  target_id: undefined as number | undefined,
})

function onTargetTypeChange() {
  // 切换为"全体用户"时清除已选的领域
  if (searchForm.target_type !== 'FIELD') {
    searchForm.target_id = undefined
  }
}

function handleSearch() {
  const params: Record<string, unknown> = {}
  if (searchForm.title) params.title = searchForm.title
  if (searchForm.target_type) {
    params.target_type = searchForm.target_type
    // 仅当按领域推送时携带 target_id
    if (searchForm.target_type === 'FIELD' && searchForm.target_id) {
      params.target_id = searchForm.target_id
    }
  }
  searchParams.value = params
  pagination.page = 1
  fetchData()
}

function handleReset() {
  searchForm.title = ''
  searchForm.target_type = ''
  searchForm.target_id = undefined
  searchParams.value = {}
  pagination.page = 1
  fetchData()
}

// ===== 查看详情弹窗 =====
const detailVisible = ref(false)
const detailMessage = ref<MessageItem | null>(null)

function handleViewDetail(row: MessageItem) {
  detailMessage.value = row
  detailVisible.value = true
}

// ===== 格式化 =====
function formatTargetType(type: string) {
  return type === 'ALL' ? '全体用户' : '按领域推送'
}

function formatTime(time: string) {
  if (!time) return '-'
  return time.replace('T', ' ').replace('Z', '')
}
</script>

<template>
  <div class="message-list">
    <PageHeader title="消息列表" description="管理系统消息，向用户发送通知">
      <template #default>
        <el-button type="primary" :icon="Plus" @click="router.push('/message/create')">
          发送消息
        </el-button>
        <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
      </template>
    </PageHeader>

    <!-- 搜索栏 -->
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="消息标题">
          <el-input
            v-model="searchForm.title"
            placeholder="按标题搜索"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="目标类型">
          <el-select
            v-model="searchForm.target_type"
            placeholder="请选择"
            clearable
            style="width: 180px"
            @change="onTargetTypeChange"
          >
            <el-option label="全体用户" value="ALL" />
            <el-option label="按领域推送" value="FIELD" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="searchForm.target_type === 'FIELD'" label="目标领域">
          <el-select
            v-model="searchForm.target_id"
            placeholder="请选择领域"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="f in fieldOptions"
              :key="f.id"
              :label="f.field_name"
              :value="f.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          v-bind="col"
        >
          <template v-if="col.prop === 'target_type'" #default="{ row }">
            <el-tag :type="row.target_type === 'ALL' ? 'info' : 'warning'" size="small">
              {{ formatTargetType(row.target_type) }}
            </el-tag>
          </template>
          <template v-else-if="col.prop === 'target_id'" #default="{ row }">
            {{ row.target_type === 'FIELD' ? (fieldNameMap[row.target_id] || row.target_id) : '-' }}
          </template>
          <template v-else-if="col.prop === 'send_time'" #default="{ row }">
            {{ formatTime(row.send_time) }}
          </template>
          <template v-else-if="col.prop === 'create_time'" #default="{ row }">
            {{ formatTime(row.create_time) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button type="primary" size="small" link :icon="View" @click="handleViewDetail(row)">
                查看详情
              </el-button>
              <el-button type="danger" size="small" link @click="handleDelete(row.id)">
                撤回
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-wrapper">
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

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailVisible" title="消息详情" width="600px">
      <template v-if="detailMessage">
        <div class="detail-item">
          <span class="detail-label">标题：</span>
          <span>{{ detailMessage.title }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">目标类型：</span>
          <el-tag :type="detailMessage.target_type === 'ALL' ? 'info' : 'warning'" size="small">
            {{ formatTargetType(detailMessage.target_type) }}
          </el-tag>
        </div>
        <div v-if="detailMessage.target_type === 'FIELD'" class="detail-item">
          <span class="detail-label">目标领域：</span>
          <span>{{ fieldNameMap[detailMessage.target_id] || detailMessage.target_id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">发送时间：</span>
          <span>{{ formatTime(detailMessage.send_time) }}</span>
        </div>
        <div class="detail-content">
          <div class="detail-label">消息内容：</div>
          <div class="content-box">{{ detailMessage.content }}</div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.message-list {
  .search-form {
    background-color: #fff;
    padding: 16px 16px 0;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .action-btns {
    display: flex;
    gap: 8px;
  }
}

.detail-item {
  margin-bottom: 12px;
  font-size: 14px;
  color: #303133;

  .detail-label {
    color: #909399;
    margin-right: 8px;
  }
}

.detail-content {
  margin-top: 16px;

  .detail-label {
    color: #909399;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .content-box {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 14px;
    color: #303133;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
