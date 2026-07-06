<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { sendSms, verifySms, register } from '@/api/modules/auth'
import { ElMessage } from 'element-plus'
import { Iphone, Lock, Message } from '@element-plus/icons-vue'

const appTitle = import.meta.env.VITE_APP_TITLE

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// ===== Tab 切换 =====
type LoginTab = 'password' | 'sms' | 'register'
const activeTab = ref<LoginTab>('password')
const loading = ref(false)

// ===== 手机号（所有模式共用） =====
const phoneNumber = ref('')
// ===== 密码登录 =====
const passwordForm = reactive({ password: '' })
const passwordRules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

// ===== 验证码登录 =====
const smsCode = ref('')
const smsCodeRules = [{ required: true, message: '请输入验证码', trigger: 'blur' }]

// ===== 注册 =====
const registerForm = reactive({ password: '', confirmPassword: '', smsCode: '' })
const registerRules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (err?: Error) => void) => {
        if (value !== registerForm.password) callback(new Error('两次密码不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

// ===== SMS 倒计时 =====
const smsCountdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null
const smsButtonText = computed(() => (smsCountdown.value > 0 ? `${smsCountdown.value}s` : '获取验证码'))
const smsButtonDisabled = computed(
  () => smsCountdown.value > 0 || !/^1[3-9]\d{9}$/.test(phoneNumber.value),
)

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

/** 发送短信验证码 */
async function handleSendSms(purpose: 'LOGIN' | 'REGISTER') {
  const valid = /^1[3-9]\d{9}$/.test(phoneNumber.value)
  if (!valid) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  try {
    await sendSms({ phone_number: phoneNumber.value, purpose })
    ElMessage.success('验证码已发送')
    startCountdown()
  } catch { /* 拦截器已处理 */ }
}

// ===== 表单引用 =====
const passwordFormRef = ref()
const smsFormRef = ref()
const registerFormRef = ref()

// ===== 密码登录 =====
async function handlePasswordLogin() {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.loginByPassword({
      phone_number: phoneNumber.value,
      password: passwordForm.password,
    })
    await userStore.fetchUserInfo()
    ElMessage.success('登录成功')
    goRedirect()
  } catch { /* ignore */ }
  finally { loading.value = false }
}

// ===== 验证码登录 =====
async function handleSmsLogin() {
  const valid1 = /^1[3-9]\d{9}$/.test(phoneNumber.value)
  const valid2 = await smsFormRef.value?.validate().catch(() => false)
  if (!valid1 || !valid2) return

  loading.value = true
  try {
    // 1. 先校验验证码获取 verify_token
    const verifyRes = await verifySms({
      phone_number: phoneNumber.value,
      code: smsCode.value,
      purpose: 'LOGIN',
    })
    // 2. 用 verify_token 登录
    await userStore.loginBySms({
      phone_number: phoneNumber.value,
      verify_token: verifyRes.data.verify_token,
    })
    await userStore.fetchUserInfo()
    ElMessage.success('登录成功')
    goRedirect()
  } catch { /* ignore */ }
  finally { loading.value = false }
}

// ===== 注册 =====
async function handleRegister() {
  const valid1 = /^1[3-9]\d{9}$/.test(phoneNumber.value)
  const valid2 = await registerFormRef.value?.validate().catch(() => false)
  if (!valid1 || !valid2) return

  loading.value = true
  try {
    // 1. 校验验证码
    const verifyRes = await verifySms({
      phone_number: phoneNumber.value,
      code: registerForm.smsCode,
      purpose: 'REGISTER',
    })
    // 2. 注册
    await register({
      phone_number: phoneNumber.value,
      password: registerForm.password,
      verify_token: verifyRes.data.verify_token,
    })
    ElMessage.success('注册成功，请登录')
    activeTab.value = 'password'
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function goRedirect() {
  const redirect = (route.query.redirect as string) || '/'
  router.push(redirect)
}

// Tab 配置
const tabs: { key: LoginTab; label: string }[] = [
  { key: 'password', label: '密码登录' },
  { key: 'sms', label: '验证码登录' },
  { key: 'register', label: '注册' },
]
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 左侧品牌区 -->
      <div class="login-brand">
        <div class="brand-content">
          <img src="@/assets/images/logo.svg" alt="logo" class="brand-logo" />
          <h1 class="brand-title">{{ appTitle }}</h1>
          <p class="brand-desc">高效的内容管理解决方案</p>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="login-form-wrapper">
        <div class="form-content">
          <h2 class="form-title">欢迎使用</h2>

          <!-- Tab 切换 -->
          <div class="tab-bar">
            <span
              v-for="tab in tabs"
              :key="tab.key"
              :class="['tab-item', { active: activeTab === tab.key }]"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </span>
          </div>

          <!-- ========== 密码登录 ========== -->
          <template v-if="activeTab === 'password'">
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              size="large"
              @keyup.enter="handlePasswordLogin"
            >
              <el-form-item prop="phone_number">
                <el-input
                  v-model="phoneNumber"
                  placeholder="请输入手机号"
                  :prefix-icon="Iphone"
                  maxlength="11"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="passwordForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  class="submit-btn"
                  :loading="loading"
                  @click="handlePasswordLogin"
                >
                  登 录
                </el-button>
              </el-form-item>
            </el-form>
          </template>

          <!-- ========== 验证码登录 ========== -->
          <template v-if="activeTab === 'sms'">
            <el-form
              ref="smsFormRef"
              :model="{ smsCode }"
              :rules="{ smsCode: smsCodeRules }"
              size="large"
              @keyup.enter="handleSmsLogin"
            >
              <el-form-item prop="phone_number">
                <el-input
                  v-model="phoneNumber"
                  placeholder="请输入手机号"
                  :prefix-icon="Iphone"
                  maxlength="11"
                />
              </el-form-item>
              <el-form-item prop="smsCode">
                <div class="sms-row">
                  <el-input
                    v-model="smsCode"
                    placeholder="请输入验证码"
                    :prefix-icon="Message"
                    maxlength="4"
                    class="sms-input"
                  />
                  <el-button
                    class="sms-btn"
                    :disabled="smsButtonDisabled"
                    @click="handleSendSms('LOGIN')"
                  >
                    {{ smsButtonText }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  class="submit-btn"
                  :loading="loading"
                  @click="handleSmsLogin"
                >
                  登 录
                </el-button>
              </el-form-item>
            </el-form>
          </template>

          <!-- ========== 注册 ========== -->
          <template v-if="activeTab === 'register'">
            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              size="large"
            >
              <el-form-item prop="phone_number">
                <el-input
                  v-model="phoneNumber"
                  placeholder="请输入手机号"
                  :prefix-icon="Iphone"
                  maxlength="11"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请设置密码（至少6位）"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item prop="smsCode">
                <div class="sms-row">
                  <el-input
                    v-model="registerForm.smsCode"
                    placeholder="请输入验证码"
                    :prefix-icon="Message"
                    maxlength="4"
                    class="sms-input"
                  />
                  <el-button
                    class="sms-btn"
                    :disabled="smsButtonDisabled"
                    @click="handleSendSms('REGISTER')"
                  >
                    {{ smsButtonText }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  class="submit-btn"
                  :loading="loading"
                  @click="handleRegister"
                >
                  注 册
                </el-button>
              </el-form-item>
            </el-form>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    display: flex;
    width: 860px;
    min-height: 540px;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  }

  .login-brand {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
    color: #fff;

    .brand-content {
      text-align: center;

      .brand-logo {
        width: 72px;
        height: 72px;
        margin-bottom: 20px;
      }

      .brand-title {
        font-size: 26px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .brand-desc {
        font-size: 14px;
        opacity: 0.85;
      }
    }
  }

  .login-form-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .form-content {
      width: 340px;

      .form-title {
        font-size: 22px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 20px;
        text-align: center;
      }
    }
  }

  .tab-bar {
    display: flex;
    justify-content: center;
    gap: 0;
    margin-bottom: 24px;
    border-bottom: 1px solid #ebeef5;

    .tab-item {
      padding: 8px 18px;
      font-size: 14px;
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
        font-weight: 500;
      }
    }
  }

  .submit-btn {
    width: 100%;
  }

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
