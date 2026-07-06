<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updateUserInfo, changePassword, sendSmsByUserId, verifySmsByUserId } from '@/api/modules/auth'
import { getIndustryList } from '@/api/modules/industry'
import { getFieldList } from '@/api/modules/field'
import { ElMessage } from 'element-plus'
import type { Industry, Field } from '@/types/user'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

function goBack() {
  router.back()
}

// ===== Tab 切换 =====
type ProfileTab = 'info' | 'password'
const activeTab = ref<ProfileTab>('info')

// ===== 下拉选项数据 =====
const industryOptions = ref<Industry[]>([])
const fieldOptions = ref<Field[]>([])

async function loadOptions() {
  try {
    const [indRes, fldRes] = await Promise.all([
      getIndustryList({}),
      getFieldList({}),
    ])
    industryOptions.value = indRes.data || []
    fieldOptions.value = fldRes.data || []
  } catch { /* ignore */ }
}

onMounted(() => {
  loadOptions()
})

// ===== Tab 1: 个人信息 =====
const editMode = ref(false)
const profileLoading = ref(false)

const profileForm = reactive({
  nickname: '',
  avatar_url: '',
  name: '',
  gender: '' as string,
  email: '',
  unit: '',
  department: '',
  position: '',
  industry_id: undefined as number | undefined,
  field_ids: [] as number[],
})

const genderOptions = [
  { label: '男', value: 'M' },
  { label: '女', value: 'F' },
  { label: '未知', value: 'U' },
]

/** 进入编辑模式：从 store 填充表单 */
function enterEdit() {
  const info = userStore.userInfo
  if (!info) return
  profileForm.nickname = info.nickname || ''
  profileForm.avatar_url = info.avatar_url || ''
  profileForm.name = info.name || ''
  profileForm.gender = info.gender_code || ''
  profileForm.email = info.email || ''
  profileForm.unit = info.unit || ''
  profileForm.department = info.department || ''
  profileForm.position = info.position || ''
  profileForm.industry_id = info.industry_id || undefined
  profileForm.field_ids = info.fields?.map(f => {
    // fields 只有 field_code/field_name，需要反查 field_id
    const found = fieldOptions.value.find(opt => opt.field_code === f.field_code)
    return found ? found.id : 0
  }).filter(Boolean) || []
  editMode.value = true
}

/** 取消编辑 */
function cancelEdit() {
  editMode.value = false
}

/** 保存个人信息 */
async function handleSaveProfile() {
  profileLoading.value = true
  try {
    const data: Record<string, unknown> = {}
    const info = userStore.userInfo
    if (!info) return

    // 只提交变更的字段
    if (profileForm.nickname !== (info.nickname || '')) data.nickname = profileForm.nickname
    if (profileForm.avatar_url !== (info.avatar_url || '')) data.avatar_url = profileForm.avatar_url
    if (profileForm.name !== (info.name || '')) data.name = profileForm.name
    if (profileForm.gender !== (info.gender_code || '')) data.gender = profileForm.gender
    if (profileForm.email !== (info.email || '')) data.email = profileForm.email
    if (profileForm.unit !== (info.unit || '')) data.unit = profileForm.unit
    if (profileForm.department !== (info.department || '')) data.department = profileForm.department
    if (profileForm.position !== (info.position || '')) data.position = profileForm.position
    if (profileForm.industry_id !== (info.industry_id || undefined)) data.industry_id = profileForm.industry_id

    // 对比 field_ids
    const currentFieldIds = info.fields?.map(f => {
      const found = fieldOptions.value.find(opt => opt.field_code === f.field_code)
      return found ? found.id : 0
    }).filter(Boolean).sort() || []
    const newFieldIds = [...profileForm.field_ids].sort()
    if (JSON.stringify(currentFieldIds) !== JSON.stringify(newFieldIds)) {
      data.field_ids = profileForm.field_ids
    }

    if (Object.keys(data).length === 0) {
      ElMessage.info('没有变更')
      editMode.value = false
      return
    }

    await updateUserInfo(data as any)
    await userStore.fetchUserInfo()
    ElMessage.success('个人信息更新成功')
    editMode.value = false
  } catch { /* 拦截器已处理 */ }
  finally {
    profileLoading.value = false
  }
}

// ===== Tab 2: 修改密码 =====
const passwordLoading = ref(false)
const passwordForm = reactive({
  smsCode: '',
  newPassword: '',
  confirmPassword: '',
})
const smsCountdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const smsButtonText = computed(() =>
  smsCountdown.value > 0 ? `${smsCountdown.value}s` : '获取验证码',
)
const smsButtonDisabled = computed(() => smsCountdown.value > 0)

const phoneNumber = computed(() => userStore.userInfo?.phone_number || '')

function startCountdown() {
  smsCountdown.value = 60
  countdownTimer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

/** 发送短信验证码（修改密码场景，需登录认证） */
async function handleSendChangePwdSms() {
  try {
    await sendSmsByUserId({ phone_number: phoneNumber.value, purpose: 'CHANGE_PASSWORD' })
    ElMessage.success('验证码已发送')
    startCountdown()
  } catch { /* 拦截器已处理 */ }
}

/** 提交修改密码 */
async function handleChangePassword() {
  if (!passwordForm.smsCode) {
    ElMessage.warning('请输入验证码')
    return
  }
  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    ElMessage.warning('新密码至少6位')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }

  passwordLoading.value = true
  try {
    // 1. 校验验证码（修改密码场景，需登录认证）
    const verifyRes = await verifySmsByUserId({
      phone_number: phoneNumber.value,
      code: passwordForm.smsCode,
      purpose: 'CHANGE_PASSWORD',
    })
    // 2. 修改密码
    await changePassword({
      verify_token: verifyRes.data.verify_token,
      new_password: passwordForm.newPassword,
    })
    ElMessage.success('密码修改成功，请重新登录')
    // 清空表单
    passwordForm.smsCode = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    // 退出登录
    userStore.resetState()
    // 跳转登录页（用 window.location 确保状态彻底刷新）
    window.location.href = '/login'
  } catch { /* 拦截器已处理 */ }
  finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-card">
      <!-- 返回按钮 -->
      <div class="back-row">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <!-- Tab 切换 -->
      <div class="tab-bar">
        <span
          :class="['tab-item', { active: activeTab === 'info' }]"
          @click="activeTab = 'info'"
        >
          个人信息
        </span>
        <span
          :class="['tab-item', { active: activeTab === 'password' }]"
          @click="activeTab = 'password'"
        >
          修改密码
        </span>
      </div>

      <!-- ========== Tab 1: 个人信息 ========== -->
      <template v-if="activeTab === 'info'">
        <!-- 查看模式 -->
        <template v-if="!editMode && userStore.userInfo">
          <div class="profile-header">
            <div class="avatar-section">
              <el-avatar :size="80" :src="userStore.avatar" />
            </div>
            <div class="user-brief">
              <h3>{{ userStore.nickname || '未设置昵称' }}</h3>
              <span class="role-tag">{{ userStore.userInfo.role_name }}</span>
            </div>
            <el-button type="primary" @click="enterEdit">编辑资料</el-button>
          </div>

          <el-descriptions :column="2" border class="info-descriptions">
            <el-descriptions-item label="用户ID">{{ userStore.userInfo.user_id }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ userStore.userInfo.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ userStore.userInfo.gender || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ userStore.userInfo.country_code }} {{ userStore.userInfo.phone_number }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userStore.userInfo.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="单位">{{ userStore.userInfo.unit || '-' }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ userStore.userInfo.department || '-' }}</el-descriptions-item>
            <el-descriptions-item label="职位">{{ userStore.userInfo.position || '-' }}</el-descriptions-item>
            <el-descriptions-item label="行业">{{ userStore.userInfo.industry_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ userStore.userInfo.role_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="关注领域" :span="2">
              <template v-if="userStore.userInfo.fields?.length">
                <el-tag
                  v-for="f in userStore.userInfo.fields"
                  :key="f.field_code"
                  size="small"
                  style="margin-right: 6px"
                >
                  {{ f.field_name }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 编辑模式 -->
        <template v-if="editMode">
          <el-form :model="profileForm" label-width="100px" class="profile-form">
            <el-form-item label="头像">
              <ImageUpload v-model="profileForm.avatar_url" />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="30" />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="profileForm.name" placeholder="请输入姓名" maxlength="30" />
            </el-form-item>
            <el-form-item label="性别">
              <el-select v-model="profileForm.gender" placeholder="请选择性别" style="width: 100%">
                <el-option
                  v-for="opt in genderOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input
                :model-value="phoneNumber"
                disabled
                placeholder="手机号不可修改"
              />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
            <el-form-item label="单位">
              <el-input v-model="profileForm.unit" placeholder="请输入单位" maxlength="50" />
            </el-form-item>
            <el-form-item label="部门">
              <el-input v-model="profileForm.department" placeholder="请输入部门" maxlength="50" />
            </el-form-item>
            <el-form-item label="职位">
              <el-input v-model="profileForm.position" placeholder="请输入职位" maxlength="50" />
            </el-form-item>
            <el-form-item label="行业">
              <el-select v-model="profileForm.industry_id" placeholder="请选择行业" style="width: 100%" clearable>
                <el-option
                  v-for="ind in industryOptions"
                  :key="ind.id"
                  :label="ind.industry_name"
                  :value="ind.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="关注领域">
              <el-select
                v-model="profileForm.field_ids"
                placeholder="请选择关注领域"
                style="width: 100%"
                multiple
                clearable
              >
                <el-option
                  v-for="fld in fieldOptions"
                  :key="fld.id"
                  :label="fld.field_name"
                  :value="fld.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="profileLoading" @click="handleSaveProfile">
                保存
              </el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>
        </template>
      </template>

      <!-- ========== Tab 2: 修改密码 ========== -->
      <template v-if="activeTab === 'password'">
        <el-form :model="passwordForm" label-width="100px" class="password-form">
          <el-form-item label="手机号">
            <el-input :model-value="phoneNumber" disabled />
          </el-form-item>
          <el-form-item label="验证码">
            <div class="sms-row">
              <el-input
                v-model="passwordForm.smsCode"
                placeholder="请输入验证码"
                maxlength="4"
                class="sms-input"
              />
              <el-button
                class="sms-btn"
                :disabled="smsButtonDisabled"
                @click="handleSendChangePwdSms"
              >
                {{ smsButtonText }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="新密码">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请设置新密码（至少6位）"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  padding: 20px;
  display: flex;
  justify-content: center;

  .profile-card {
    width: 100%;
    max-width: 780px;
    background: #fff;
    border-radius: 8px;
    padding: 24px 32px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
}

.back-row {
  margin-bottom: 8px;
}

.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 28px;
  border-bottom: 1px solid #ebeef5;

  .tab-item {
    padding: 10px 22px;
    font-size: 15px;
    color: #909399;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &:hover {
      color: #409eff;
    }

    &.active {
      color: #409eff;
      border-bottom-color: #409eff;
      font-weight: 600;
    }
  }
}

// 个人信息查看模式
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;

  .user-brief {
    flex: 1;

    h3 {
      margin: 0 0 6px 0;
      font-size: 20px;
      color: #303133;
    }

    .role-tag {
      display: inline-block;
      padding: 2px 10px;
      font-size: 12px;
      color: #409eff;
      background: #ecf5ff;
      border-radius: 4px;
    }
  }
}

.info-descriptions {
  margin-top: 8px;
}

// 个人信息编辑模式
.profile-form {
  max-width: 520px;
}

// 修改密码
.password-form {
  max-width: 460px;
  margin-top: 8px;

  .sms-row {
    display: flex;
    gap: 10px;

    .sms-input {
      flex: 1;
    }

    .sms-btn {
      flex-shrink: 0;
      width: 110px;
    }
  }
}
</style>
