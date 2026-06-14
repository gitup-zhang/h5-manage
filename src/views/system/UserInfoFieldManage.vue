<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import {
  getUserInfoFieldList,
  createUserInfoField,
  updateUserInfoField,
  updateUserInfoFieldStatus,
} from '@/api/modules/userInfoField'
import type { UserInfoField } from '@/types/user'

// ===== 数据和加载状态 =====
const tableData = ref<UserInfoField[]>([])
const loading = ref(false)
const searchParams = ref<Record<string, unknown>>({})

// ===== 搜索字段 =====
const searchFields = [
  { label: '字段编码', prop: 'code', placeholder: '按编码模糊搜索' },
  { label: '字段名称', prop: 'name', placeholder: '按名称模糊搜索' },
  {
    label: '状态',
    prop: 'is_deleted',
    type: 'select' as const,
    options: [
      { label: '正常', value: 'N' },
      { label: '已删除', value: 'Y' },
    ],
  },
]

// ===== 表格列 =====
const columns = [
  { prop: 'id', label: 'ID', width: 70 },
  { prop: 'code', label: '字段编码', width: 150 },
  { prop: 'name', label: '字段名称', minWidth: 200 },
  { prop: 'is_deleted', label: '状态', width: 80 },
]

// ===== 获取数据 =====
async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {}
    for (const key of Object.keys(searchParams.value)) {
      const val = searchParams.value[key]
      if (val !== '' && val !== null && val !== undefined) {
        params[key] = val
      }
    }
    const res = await getUserInfoFieldList(params)
    tableData.value = res.data
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(params: Record<string, unknown>) {
  searchParams.value = params
  fetchData()
}

function handleReset() {
  searchParams.value = {}
  fetchData()
}

// ===== 弹窗（新增/编辑） =====
const dialogVisible = ref(false)
const dialogTitle = ref('新增字段')
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref()
const form = reactive({
  code: '',
  name: '',
})

const formRules = {
  code: [{ required: true, message: '请输入字段编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
}

function handleCreate() {
  dialogTitle.value = '新增字段'
  isEdit.value = false
  editId.value = 0
  form.code = ''
  form.name = ''
  dialogVisible.value = true
}

function handleEdit(row: UserInfoField) {
  dialogTitle.value = '编辑字段'
  isEdit.value = true
  editId.value = row.id
  form.code = row.code
  form.name = row.name
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    if (isEdit.value) {
      await updateUserInfoField(editId.value, {
        name: form.name,
      })
      ElMessage.success('更新成功')
    } else {
      await createUserInfoField({
        code: form.code,
        name: form.name,
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch { /* 拦截器处理 */ }
}

// ===== 状态切换（软删除） =====
async function handleToggleStatus(row: UserInfoField) {
  const isDeleted = row.is_deleted === 'Y'
  const actionText = isDeleted ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确认${actionText}字段「${row.name}」？`,
      `${actionText}字段`,
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' },
    )
    await updateUserInfoFieldStatus(row.id, {
      is_deleted: isDeleted ? 'N' : 'Y',
    })
    ElMessage.success(`${actionText}成功`)
    fetchData()
  } catch { /* 取消或失败 */ }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="user-info-field-manage">
    <PageHeader title="用户信息字段列表" description="管理活动报名时用户需填写的信息字段">
      <template #default>
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增字段</el-button>
        <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
      </template>
    </PageHeader>

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column v-for="col in columns" :key="col.prop" v-bind="col">
          <template v-if="col.prop === 'is_deleted'" #default="{ row }">
            <el-tag :type="row.is_deleted === 'N' ? 'success' : 'danger'" size="small">
              {{ row.is_deleted === 'N' ? '正常' : '已删除' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
              <el-button
                :type="row.is_deleted === 'N' ? 'warning' : 'success'"
                size="small"
                link
                @click="handleToggleStatus(row)"
              >
                {{ row.is_deleted === 'N' ? '禁用' : '启用' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="字段编码" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入字段编码（如 company、phone）"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="字段名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字段名称" />
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
.user-info-field-manage {
  .action-btns {
    display: flex;
    gap: 4px;
  }
}
</style>
