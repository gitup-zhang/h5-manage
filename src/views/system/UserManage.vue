<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import { useCrud } from '@/composables/useCrud'
import { useUserStore } from '@/stores/user'
import { getUserList, updateUserStatus, updateUserRole, getUserPhoneNumber } from '@/api/modules/user'
import type { UserInfo } from '@/types/user'

const userStore = useUserStore()

// ===== 搜索字段配置 =====
const searchFields = [
  { label: '姓名', prop: 'name', placeholder: '按姓名模糊搜索' },
  {
    label: '性别',
    prop: 'gender_code',
    type: 'select' as const,
    options: [
      { label: '男', value: 'M' },
      { label: '女', value: 'F' },
    ],
  },
  { label: '单位', prop: 'unit', placeholder: '按单位模糊搜索' },
  { label: '部门', prop: 'department', placeholder: '按部门模糊搜索' },
  { label: '职位', prop: 'position', placeholder: '按职位模糊搜索' },
  {
    label: '角色',
    prop: 'role',
    type: 'select' as const,
    options: [
      { label: '普通用户', value: 'user' },
      { label: '管理员', value: 'admin' },
      { label: '超级管理员', value: 'superadmin' },
    ],
  },
]

// ===== CRUD =====
const {
  tableData,
  pagination,
  loading,
  fetchData,
  handleSearch,
  handleReset,
} = useCrud<UserInfo>({
  fetchApi: getUserList,
  pageSize: 10,
})

// ===== 表格列 =====
const columns = [
  { prop: 'user_id', label: 'ID', width: 70 },
  { prop: 'nickname', label: '昵称', width: 110 },
  { prop: 'name', label: '姓名', width: 100 },
  { prop: 'phone_number', label: '手机号', width: 135 },
  { prop: 'email', label: '邮箱', minWidth: 170 },
  { prop: 'unit', label: '单位', minWidth: 150 },
  { prop: 'role_name', label: '角色', width: 110 },
  { prop: 'user_status', label: '状态', width: 80 },
]

// ===== 角色映射 =====
const roleTagMap: Record<string, 'danger' | 'warning' | 'info'> = {
  superadmin: 'danger',
  admin: 'warning',
  user: 'info',
}

function getRoleTagType(role: string): 'danger' | 'warning' | 'info' {
  return roleTagMap[role] || 'info'
}

// ===== 状态切换（管理员） =====
async function handleToggleStatus(row: UserInfo) {
  const isEnable = row.status === 1
  const action = isEnable ? 'DISABLE' : 'ENABLE'
  const actionText = isEnable ? '禁用' : '启用'

  try {
    await ElMessageBox.confirm(
      `确认${actionText}用户「${row.nickname || row.name}」？${isEnable ? '禁用后该用户将无法登录。' : ''}`,
      `${actionText}用户`,
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' },
    )
    await updateUserStatus(row.user_id, { operation: action })
    ElMessage.success(`${actionText}成功`)
    fetchData()
  } catch {
    // 取消或失败
  }
}

// ===== 角色变更（超级管理员） =====
const roleDialogVisible = ref(false)
const roleTargetUser = ref<UserInfo | null>(null)
const selectedRole = ref<string>('')

const roleOptions = [
  { label: '普通用户 (USER)', value: 'USER' },
  { label: '管理员 (ADMIN)', value: 'ADMIN' },
  { label: '超级管理员 (SUPERADMIN)', value: 'SUPERADMIN' },
]

function openRoleDialog(row: UserInfo) {
  roleTargetUser.value = row
  selectedRole.value = row.role === 'user' ? 'USER' : row.role === 'admin' ? 'ADMIN' : 'SUPERADMIN'
  roleDialogVisible.value = true
}

async function handleRoleChange() {
  if (!roleTargetUser.value) return
  try {
    await updateUserRole(roleTargetUser.value.user_id, {
      role: selectedRole.value as 'USER' | 'ADMIN' | 'SUPERADMIN',
    })
    ElMessage.success('角色变更成功')
    roleDialogVisible.value = false
    fetchData()
  } catch {
    // 错误由拦截器处理
  }
}

// ===== 查看手机号（管理员及以上） =====
const phoneDialogVisible = ref(false)
const phoneTargetUser = ref<UserInfo | null>(null)
const phoneNumber = ref('')
const phoneLoading = ref(false)

function openPhoneDialog(row: UserInfo) {
  phoneTargetUser.value = row
  phoneNumber.value = ''
  phoneDialogVisible.value = true
  fetchPhoneNumber()
}

async function fetchPhoneNumber() {
  if (!phoneTargetUser.value) return
  phoneLoading.value = true
  try {
    const res = await getUserPhoneNumber(phoneTargetUser.value.user_id)
    phoneNumber.value = res.data.phone_number
  } catch {
    phoneNumber.value = ''
  } finally {
    phoneLoading.value = false
  }
}

function handlePhoneDialogClosed() {
  phoneNumber.value = ''
  phoneTargetUser.value = null
}

async function copyPhoneNumber() {
  if (!phoneNumber.value) return
  try {
    await navigator.clipboard.writeText(phoneNumber.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// ===== 初始加载 =====
fetchData()
</script>

<template>
  <div class="user-manage">
    <PageHeader title="用户列表" description="管理所有注册用户">
      <template #default>
        <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
      </template>
    </PageHeader>

    <!-- 搜索表单 -->
    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <!-- 表格 -->
    <el-card shadow="never">
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
          <!-- 状态列 -->
          <template v-if="col.prop === 'user_status'" #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.user_status }}
            </el-tag>
          </template>
          <!-- 角色列 -->
          <template v-else-if="col.prop === 'role_name'" #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small">
              {{ row.role_name }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <!-- 状态切换：管理员及以上可见 -->
              <el-button
                v-if="userStore.isAdmin"
                :type="row.status === 1 ? 'warning' : 'success'"
                size="small"
                link
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <!-- 查看手机号：管理员及以上可见 -->
              <el-button
                v-if="userStore.isAdmin"
                type="primary"
                size="small"
                link
                @click="openPhoneDialog(row)"
              >
                查看手机号
              </el-button>
              <!-- 角色变更：仅超级管理员可见 -->
              <el-button
                v-if="userStore.isSuperAdmin"
                type="primary"
                size="small"
                link
                @click="openRoleDialog(row)"
              >
                变更角色
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchData"
          @size-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 角色变更弹窗 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="变更用户角色"
      width="440px"
      :close-on-click-modal="false"
    >
      <div v-if="roleTargetUser" class="role-dialog-content">
        <p class="role-target">
          用户：<strong>{{ roleTargetUser.nickname || roleTargetUser.name }}</strong>
          （当前角色：<el-tag :type="getRoleTagType(roleTargetUser.role)" size="small">{{ roleTargetUser.role_name }}</el-tag>）
        </p>
        <el-select v-model="selectedRole" placeholder="请选择新角色" style="width: 100%">
          <el-option
            v-for="opt in roleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleChange">确认变更</el-button>
      </template>
    </el-dialog>

    <!-- 查看手机号弹窗 -->
    <el-dialog
      v-model="phoneDialogVisible"
      title="查看手机号"
      width="440px"
      :close-on-click-modal="false"
      @closed="handlePhoneDialogClosed"
    >
      <div v-if="phoneTargetUser" class="phone-dialog-content">
        <p class="phone-target">
          用户：<strong>{{ phoneTargetUser.nickname || phoneTargetUser.name }}</strong>
        </p>
        <div v-loading="phoneLoading" class="phone-display">
          <template v-if="phoneNumber">
            <span class="phone-number">{{ phoneNumber }}</span>
            <el-button type="primary" size="small" link class="copy-btn" @click="copyPhoneNumber">
              复制
            </el-button>
          </template>
          <span v-else-if="!phoneLoading" class="phone-error">获取失败，请重试</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="phoneDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-manage {
  .action-btns {
    display: flex;
    gap: 4px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .role-dialog-content {
    .role-target {
      margin-bottom: 16px;
      font-size: 14px;
      color: #303133;
    }
  }

  .phone-dialog-content {
    .phone-target {
      margin-bottom: 16px;
      font-size: 14px;
      color: #303133;
    }

    .phone-display {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 4px;
      min-height: 52px;

      .phone-number {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        letter-spacing: 1px;
      }

      .copy-btn {
        flex-shrink: 0;
      }

      .phone-error {
        font-size: 14px;
        color: #f56c6c;
      }
    }
  }
}
</style>
