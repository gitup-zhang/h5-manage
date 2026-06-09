<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { getMenuTree, updateMenu } from '@/api/modules/role'
import type { MenuItem } from '@/types/user'

const menuTree = ref<MenuItem[]>([])
const loading = ref(false)

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const isEdit = ref(false)
const formRef = ref()
const form = ref<Partial<MenuItem>>({
  type: 0,
  hidden: false,
  keepAlive: false,
  sort: 0,
})

const formRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
}

async function loadMenuTree() {
  loading.value = true
  try {
    const res = await getMenuTree()
    menuTree.value = res.data
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function handleCreate(parentId = 0) {
  dialogTitle.value = '新增菜单'
  isEdit.value = false
  form.value = {
    parentId,
    type: 0,
    hidden: false,
    keepAlive: false,
    sort: 0,
  }
  dialogVisible.value = true
}

function handleEdit(row: MenuItem) {
  dialogTitle.value = '编辑菜单'
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

function handleDelete(_row: MenuItem) {
  ElMessage.warning('请通过保存菜单树来提交删除')
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  dialogVisible.value = false
  ElMessage.success('菜单已更新，点击"保存菜单结构"生效')
}

async function handleSaveAll() {
  loading.value = true
  try {
    await updateMenu(menuTree.value)
    ElMessage.success('菜单结构保存成功')
    loadMenuTree()
  } catch { /* ignore */ }
  finally { loading.value = false }
}

onMounted(() => {
  loadMenuTree()
})
</script>

<template>
  <div class="menu-manage">
    <PageHeader title="菜单管理" description="配置系统菜单结构和权限">
      <template #default>
        <el-button type="primary" :icon="Plus" @click="handleCreate(0)">
          新增顶级菜单
        </el-button>
        <el-button type="success" @click="handleSaveAll">
          保存菜单结构
        </el-button>
      </template>
    </PageHeader>

    <el-card v-loading="loading" shadow="never">
      <el-table
        :data="menuTree"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="name" label="菜单名称" min-width="180" />
        <el-table-column prop="icon" label="图标" width="120" />
        <el-table-column prop="path" label="路由路径" width="180" />
        <el-table-column prop="component" label="组件路径" width="200" />
        <el-table-column prop="permission" label="权限标识" width="160" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.type === 0 ? '' : row.type === 1 ? 'success' : 'info'" size="small">
              {{ row.type === 0 ? '目录' : row.type === 1 ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
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
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="组件路径">
          <el-input v-model="form.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="权限标识">
          <el-input v-model="form.permission" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio :value="0">目录</el-radio>
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
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
.menu-manage {
  // custom styles
}
</style>
