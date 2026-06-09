<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import TableAction, { type ActionItem } from '@/components/common/TableAction.vue'
import { useCrud } from '@/composables/useCrud'
import { getRoleList, createRole, updateRole, deleteRole, getMenuTree } from '@/api/modules/role'
import type { Role } from '@/types/user'
import type { MenuItem } from '@/types/user'

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '角色名称', width: 150 },
  { prop: 'code', label: '角色编码', width: 150 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'createdAt', label: '创建时间', width: 180 },
]

const { tableData, pagination, loading, fetchData, handleDelete } = useCrud<Role>({
  fetchApi: getRoleList,
  deleteApi: deleteRole,
  deleteMessage: '确认删除该角色？',
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref()
const form = ref<Partial<Role>>({})
const menuTree = ref<MenuItem[]>([])

const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

async function handleCreate() {
  dialogTitle.value = '新增角色'
  isEdit.value = false
  form.value = {}
  try {
    const res = await getMenuTree()
    menuTree.value = res.data
  } catch { /* ignore */ }
  dialogVisible.value = true
}

async function handleEdit(row: Role) {
  dialogTitle.value = '编辑角色'
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row }
  try {
    const res = await getMenuTree()
    menuTree.value = res.data
  } catch { /* ignore */ }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    if (isEdit.value) {
      await updateRole(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createRole(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch { /* ignore */ }
}

function getActions(row: Role): ActionItem[] {
  return [
    { label: '编辑', type: 'primary', onClick: () => handleEdit(row) },
    { label: '删除', type: 'danger', onClick: () => handleDelete(row.id) },
  ]
}

fetchData()
</script>

<template>
  <div class="role-manage">
    <PageHeader title="角色管理" description="管理角色及菜单权限分配" />

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" size="small" :icon="Plus" @click="handleCreate">
            新增角色
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
        />
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

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            show-checkbox
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            :default-checked-keys="form.menuIds || []"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.role-manage {
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
