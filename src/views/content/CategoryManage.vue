<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { getCategoryTree, createCategory, updateCategory, deleteCategory, type Category } from '@/api/modules/article'

const loading = ref(false)
const categories = ref<Category[]>([])

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref()
const form = ref<Partial<Category>>({
  parentId: 0,
  sort: 0,
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

async function loadCategories() {
  loading.value = true
  try {
    const res = await getCategoryTree()
    categories.value = res.data
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function handleCreate(parentId = 0) {
  dialogTitle.value = '新增分类'
  isEdit.value = false
  form.value = { parentId, sort: 0 }
  dialogVisible.value = true
}

function handleEdit(row: Category) {
  dialogTitle.value = '编辑分类'
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleDelete(row: Category) {
  try {
    await ElMessageBox.confirm('确认删除该分类？若分类下有子分类则无法删除', '提示', {
      type: 'warning',
    })
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch { /* ignore */ }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    if (isEdit.value) {
      await updateCategory(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createCategory(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch { /* ignore */ }
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="category-manage">
    <PageHeader title="分类管理" description="管理文章分类，支持多级分类">
      <template #default>
        <el-button type="primary" :icon="Plus" @click="handleCreate(0)">
          新增顶级分类
        </el-button>
      </template>
    </PageHeader>

    <el-card v-loading="loading" shadow="never">
      <el-table
        :data="categories"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="articleCount" label="文章数量" width="100" align="center" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleCreate(row.id)">
              添加子级
            </el-button>
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
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
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
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
.category-manage {
  // custom styles
}
</style>
