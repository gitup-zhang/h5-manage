<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchForm, { type SearchField } from '@/components/common/SearchForm.vue'
import TableAction, { type ActionItem } from '@/components/common/TableAction.vue'
import { useCrud } from '@/composables/useCrud'
import { getUserList, deleteUser } from '@/api/modules/user'
import type { UserInfo } from '@/types/user'

// 表格列（适配新 API 字段）
const columns = [
  { prop: 'user_id', label: 'ID', width: 80 },
  { prop: 'nickname', label: '昵称', width: 130 },
  { prop: 'name', label: '姓名', width: 110 },
  { prop: 'phone_number', label: '手机号', width: 140 },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'role_name', label: '角色', width: 100 },
  { prop: 'status', label: '状态', width: 80 },
]

// 搜索字段
const searchFields: SearchField[] = [
  { label: '手机号', prop: 'phone_number', placeholder: '请输入手机号' },
  { label: '角色', prop: 'role', type: 'select', options: [
    { label: '普通用户', value: 'user' },
    { label: '管理员', value: 'admin' },
    { label: '超级管理员', value: 'superadmin' },
  ]},
]

// CRUD（管理端接口待后端提供后对接）
const { tableData, pagination, loading, fetchData, handleSearch, handleReset, handleDelete } =
  useCrud<UserInfo>({
    fetchApi: getUserList,
    deleteApi: deleteUser,
    deleteMessage: '确认删除该用户？',
  })

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('用户详情')
const currentUser = ref<UserInfo | null>(null)

function handleView(row: UserInfo) {
  dialogTitle.value = '用户详情'
  currentUser.value = row
  dialogVisible.value = true
}

// 表格操作
function getActions(row: UserInfo): ActionItem[] {
  return [
    { label: '查看', type: 'primary', onClick: () => handleView(row) },
    { label: '删除', type: 'danger', onClick: () => handleDelete(row.user_id) },
  ]
}

// 角色 tag 类型
function getRoleType(role: string) {
  const map: Record<string, string> = {
    superadmin: 'danger',
    admin: 'warning',
    user: 'info',
  }
  return map[role] || 'info'
}

fetchData()
</script>

<template>
  <div class="user-manage">
    <PageHeader title="用户管理" description="管理系统用户（管理端接口待后端提供）" />

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
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
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
          <template v-else-if="col.prop === 'role_name'" #default="{ row }">
            <el-tag :type="getRoleType(row.role)" size="small">
              {{ row.role_name }}
            </el-tag>
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

    <!-- 用户详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-if="currentUser" :column="2" border>
        <el-descriptions-item label="用户ID">{{ currentUser.user_id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentUser.gender }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone_number }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ currentUser.unit }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ currentUser.department }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ currentUser.position }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ currentUser.industry_name }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="getRoleType(currentUser.role)" size="small">
            {{ currentUser.role_name }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'" size="small">
            {{ currentUser.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-manage {
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
