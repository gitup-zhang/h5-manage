<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchForm, { type SearchField } from '@/components/common/SearchForm.vue'
import TableAction, { type ActionItem } from '@/components/common/TableAction.vue'
import { useCrud } from '@/composables/useCrud'
import { getArticleList, deleteArticle, type Article } from '@/api/modules/article'
import { formatDate } from '@/utils/format'

const router = useRouter()

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'title', label: '标题', minWidth: 200 },
  { prop: 'categoryName', label: '分类', width: 120 },
  { prop: 'author', label: '作者', width: 100 },
  { prop: 'status', label: '状态', width: 90 },
  { prop: 'viewCount', label: '阅读量', width: 90 },
  { prop: 'createdAt', label: '创建时间', width: 180 },
]

const searchFields: SearchField[] = [
  { label: '标题', prop: 'title', placeholder: '请输入标题关键词' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    options: [
      { label: '草稿', value: 0 },
      { label: '已发布', value: 1 },
      { label: '已下架', value: 2 },
    ],
  },
]

const { tableData, pagination, loading, fetchData, handleSearch, handleReset, handleDelete } =
  useCrud<Article>({
    fetchApi: getArticleList,
    deleteApi: deleteArticle,
    deleteMessage: '确认删除该文章？',
  })

function handleCreate() {
  router.push('/content/articles/create')
}

function handleEdit(row: Article) {
  router.push(`/content/articles/${row.id}/edit`)
}

function getActions(row: Article): ActionItem[] {
  return [
    { label: '编辑', type: 'primary', onClick: () => handleEdit(row) },
    { label: '删除', type: 'danger', onClick: () => handleDelete(row.id) },
  ]
}

function getStatusTag(status: number) {
  const map: Record<number, { label: string; type: string }> = {
    0: { label: '草稿', type: 'info' },
    1: { label: '已发布', type: 'success' },
    2: { label: '已下架', type: 'warning' },
  }
  return map[status] || { label: '未知', type: '' }
}

fetchData()
</script>

<template>
  <div class="article-list">
    <PageHeader title="文章管理" description="管理所有文章内容" />

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>文章列表</span>
          <el-button type="primary" size="small" :icon="Plus" @click="handleCreate">
            新建文章
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          v-bind="col"
        >
          <template v-if="col.prop === 'status'" #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
          <template v-else-if="col.prop === 'createdAt'" #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <TableAction :actions="getActions(row)" />
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
.article-list {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
