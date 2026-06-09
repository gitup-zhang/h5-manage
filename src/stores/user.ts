import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  loginByPassword as loginByPasswordApi,
  loginBySms as loginBySmsApi,
  getUserInfo as getUserInfoApi,
  logout as logoutApi,
} from '@/api/modules/auth'
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  removeTokens,
} from '@/utils/auth'
import type { UserInfo, LoginParams, SmsLoginParams, UserRole } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // ===== State =====
  const accessToken = ref<string | null>(getAccessToken())
  const refreshToken = ref<string | null>(getRefreshToken())
  const userInfo = ref<UserInfo | null>(null)

  // ===== Getters =====
  const isLoggedIn = computed(() => !!accessToken.value)
  const nickname = computed(() => userInfo.value?.nickname || '')
  const avatar = computed(() => userInfo.value?.avatar_url || '')
  const role = computed<UserRole>(() => userInfo.value?.role || 'user')
  const isAdmin = computed(() => role.value === 'admin' || role.value === 'superadmin')
  const isSuperAdmin = computed(() => role.value === 'superadmin')

  // ===== Actions =====

  /** 密码登录 */
  async function loginByPassword(params: LoginParams) {
    const res = await loginByPasswordApi(params)
    saveTokens(res.data.access_token, res.data.refresh_token)
    return res
  }

  /** 验证码登录 */
  async function loginBySms(params: SmsLoginParams) {
    const res = await loginBySmsApi(params)
    saveTokens(res.data.access_token, res.data.refresh_token)
    return res
  }

  /** 保存双 Token */
  function saveTokens(access: string, refresh: string) {
    setAccessToken(access)
    setRefreshToken(refresh)
    accessToken.value = access
    refreshToken.value = refresh
  }

  /** 获取用户信息 */
  async function fetchUserInfo() {
    const res = await getUserInfoApi()
    userInfo.value = res.data
    return res.data
  }

  /** 退出登录 */
  async function logout() {
    try {
      await logoutApi()
    } finally {
      resetState()
    }
  }

  /** 清除状态 */
  function resetState() {
    removeTokens()
    accessToken.value = null
    refreshToken.value = null
    userInfo.value = null
  }

  /** 权限检查 */
  function hasPermission(requiredRole?: UserRole): boolean {
    if (!requiredRole) return true
    if (role.value === 'superadmin') return true
    if (role.value === 'admin' && requiredRole === 'user') return true
    return role.value === requiredRole
  }

  return {
    // state
    accessToken,
    refreshToken,
    userInfo,
    // getters
    isLoggedIn,
    nickname,
    avatar,
    role,
    isAdmin,
    isSuperAdmin,
    // actions
    loginByPassword,
    loginBySms,
    fetchUserInfo,
    logout,
    resetState,
    hasPermission,
  }
})
