<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import {
  getFieldList,
  createField,
  updateField,
  deleteField,
  updateFieldStatus,
} from '@/api/modules/field'
import type { Field } from '@/types/user'

// ===== 数据和加载状态 =====
const tableData = ref<Field[]>([])
const loading = ref(false)
const searchParams = ref<Record<string, unknown>>({})

// ===== 搜索字段 =====
const searchFields = [
  { label: '领域名称', prop: 'field_name', placeholder: '按名称模糊搜索' },
  {
    label: '状态',
    prop: 'enable',
    type: 'select' as const,
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 2 },
    ],
  },
]

// ===== 表格列 =====
const columns = [
  { prop: 'id', label: 'ID', width: 70 },
  { prop: 'field_code', label: '编码', width: 130 },
  { prop: 'field_name', label: '领域名称', minWidth: 150 },
  { prop: 'desc', label: '描述', minWidth: 200 },
  { prop: 'enable', label: '状态', width: 80 },
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
    const res = await getFieldList(params)
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
const dialogTitle = ref('新增领域')
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref()
const form = reactive({
  field_code: '',
  field_name: '',
  desc: '',
})

const formRules = {
  field_code: [{ required: true, message: '请输入领域编码', trigger: 'blur' }],
  field_name: [{ required: true, message: '请输入领域名称', trigger: 'blur' }],
}

function handleCreate() {
  dialogTitle.value = '新增领域'
  isEdit.value = false
  editId.value = 0
  form.field_code = ''
  form.field_name = ''
  form.desc = ''
  dialogVisible.value = true
}

function handleEdit(row: Field) {
  dialogTitle.value = '编辑领域'
  isEdit.value = true
  editId.value = row.id
  form.field_code = row.field_code
  form.field_name = row.field_name
  form.desc = row.desc
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    if (isEdit.value) {
      await updateField(editId.value, {
        field_code: form.field_code,
        field_name: form.field_name,
        desc: form.desc,
      })
      ElMessage.success('更新成功')
    } else {
      await createField({
        field_code: form.field_code,
        field_name: form.field_name,
        desc: form.desc,
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch { /* 拦截器处理 */ }
}

// ===== 状态切换 =====
async function handleToggleStatus(row: Field) {
  const isEnable = row.enable === 1
  const action = isEnable ? 'DISABLE' : 'ENABLE'
  const actionText = isEnable ? '禁用' : '启用'

  try {
    await ElMessageBox.confirm(
      `确认${actionText}领域「${row.field_name}」？`,
      `${actionText}领域`,
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' },
    )
    await updateFieldStatus(row.id, { operation: action })
    ElMessage.success(`${actionText}成功`)
    fetchData()
  } catch { /* 取消或失败 */ }
}

// ===== 删除 =====
async function handleDelete(row: Field) {
  try {
    await ElMessageBox.confirm(
      `确认删除领域「${row.field_name}」？删除后不可恢复。`,
      '删除领域',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' },
    )
    await deleteField(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* 取消或失败 */ }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="field-manage">
    <PageHeader title="领域列表" description="管理领域分类">
      <template #default>
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增领域</el-button>
        <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
      </template>
    </PageHeader>

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column v-for="col in columns" :key="col.prop" v-bind="col">
          <template v-if="col.prop === 'enable'" #default="{ row }">
            <el-tag :type="row.enable === 1 ? 'success' : 'info'" size="small">
              {{ row.enable === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
              <el-button
                :type="row.enable === 1 ? 'warning' : 'success'"
                size="small"
                link
                @click="handleToggleStatus(row)"
              >
                {{ row.enable === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
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
        <el-form-item label="领域编码" prop="field_code">
          <el-input v-model="form.field_code" placeholder="请输入领域编码（如 AI、CLOUD）" />
        </el-form-item>
        <el-form-item label="领域名称" prop="field_name">
          <el-input v-model="form.field_name" placeholder="请输入领域名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="3"
            placeholder="请输入领域描述（可选）"
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
.field-manage {
  .action-btns {
    display: flex;
    gap: 4px;
  }
}
</style>
