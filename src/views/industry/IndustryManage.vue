<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import {
  getIndustryList,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  updateIndustryStatus,
} from '@/api/modules/industry'
import type { Industry } from '@/types/user'

// ===== 数据和加载状态 =====
const tableData = ref<Industry[]>([])
const loading = ref(false)
const searchParams = ref<Record<string, unknown>>({})

// ===== 搜索字段 =====
const searchFields = [
  { label: '行业名称', prop: 'industry_name', placeholder: '按名称模糊搜索' },
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
  { prop: 'industry_code', label: '编码', width: 120 },
  { prop: 'industry_name', label: '行业名称', minWidth: 150 },
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
    const res = await getIndustryList(params)
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
const dialogTitle = ref('新增行业')
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref()
const form = reactive({
  industry_code: '',
  industry_name: '',
  desc: '',
})

const formRules = {
  industry_code: [{ required: true, message: '请输入行业编码', trigger: 'blur' }],
  industry_name: [{ required: true, message: '请输入行业名称', trigger: 'blur' }],
}

function handleCreate() {
  dialogTitle.value = '新增行业'
  isEdit.value = false
  editId.value = 0
  form.industry_code = ''
  form.industry_name = ''
  form.desc = ''
  dialogVisible.value = true
}

function handleEdit(row: Industry) {
  dialogTitle.value = '编辑行业'
  isEdit.value = true
  editId.value = row.id
  form.industry_code = row.industry_code
  form.industry_name = row.industry_name
  form.desc = row.desc
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    if (isEdit.value) {
      await updateIndustry(editId.value, {
        industry_code: form.industry_code,
        industry_name: form.industry_name,
        desc: form.desc,
      })
      ElMessage.success('更新成功')
    } else {
      await createIndustry({
        industry_code: form.industry_code,
        industry_name: form.industry_name,
        desc: form.desc,
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch { /* 拦截器处理 */ }
}

// ===== 状态切换 =====
async function handleToggleStatus(row: Industry) {
  const isEnable = row.enable === 1
  const action = isEnable ? 'DISABLE' : 'ENABLE'
  const actionText = isEnable ? '禁用' : '启用'

  try {
    await ElMessageBox.confirm(
      `确认${actionText}行业「${row.industry_name}」？`,
      `${actionText}行业`,
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' },
    )
    await updateIndustryStatus(row.id, { operation: action })
    ElMessage.success(`${actionText}成功`)
    fetchData()
  } catch { /* 取消或失败 */ }
}

// ===== 删除 =====
async function handleDelete(row: Industry) {
  try {
    await ElMessageBox.confirm(
      `确认删除行业「${row.industry_name}」？删除后不可恢复。`,
      '删除行业',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' },
    )
    await deleteIndustry(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* 取消或失败 */ }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="industry-manage">
    <PageHeader title="行业列表" description="管理行业信息">
      <template #default>
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新增行业
        </el-button>
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

        <!-- 操作列（管理员可见） -->
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
        <el-form-item label="行业编码" prop="industry_code">
          <el-input v-model="form.industry_code" placeholder="请输入行业编码（如 IT、FIN）" />
        </el-form-item>
        <el-form-item label="行业名称" prop="industry_name">
          <el-input v-model="form.industry_name" placeholder="请输入行业名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="3"
            placeholder="请输入行业描述（可选）"
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
.industry-manage {
  .action-btns {
    display: flex;
    gap: 4px;
  }
}
</style>
