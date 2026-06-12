import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { ElMessage } from 'element-plus'
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, removeTokens } from './auth'
import type { ApiResponse } from '@/types/api'

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 是否正在刷新 Token（避免并发刷新）
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

/** 执行被挂起的请求 */
function executePendingRequests(newToken: string) {
  pendingRequests.forEach((callback) => callback(newToken))
  pendingRequests = []
}

// ===== 请求拦截器 =====
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ===== 响应拦截器 =====
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    // 文件下载直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    // 业务成功
    if (data.code === 200) {
      return response
    }

    // 其他业务错误
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401 且未重试过 → 尝试刷新 Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        // 无 refresh_token，直接踢到登录
        removeTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // 如果已经在刷新，挂起当前请求
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(instance(originalRequest))
          })
        })
      }

      // 开始刷新
      isRefreshing = true
      originalRequest._retry = true

      try {
        const res = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
          `${import.meta.env.VITE_API_BASE_URL}/users/token/refresh`,
          { refresh_token: refreshToken },
        )

        if (res.data.code === 200) {
          const newAccessToken = res.data.data.access_token
          const newRefreshToken = res.data.data.refresh_token

          setAccessToken(newAccessToken)
          setRefreshToken(newRefreshToken)

          // 执行挂起的请求
          executePendingRequests(newAccessToken)

          // 重试原请求
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return instance(originalRequest)
        }

        // 刷新失败
        removeTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      } catch {
        removeTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    // 提取 HTTP 错误响应中的业务错误信息（401 已在上方处理，此处处理 400/403/404/500 等）
    if (error.response?.data) {
      const { message, code } = error.response.data
      if (message) {
        ElMessage.error(code ? `[${code}] ${message}` : message)
      } else {
        ElMessage.error(`请求失败 (HTTP ${error.response.status})`)
      }
    } else if (error.message && !error.response) {
      // 网络错误（无响应）
      ElMessage.error('网络异常，请检查网络连接')
    }

    return Promise.reject(error)
  },
)

// ===== 通用请求方法 =====

/** GET */
export function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return instance.get(url, { params, ...config }).then((res) => res.data)
}

/** POST */
export function post<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return instance.post(url, data, config).then((res) => res.data)
}

/** PUT */
export function put<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return instance.put(url, data, config).then((res) => res.data)
}

/** PATCH */
export function patch<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return instance.patch(url, data, config).then((res) => res.data)
}

/** DELETE */
export function del<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return instance.delete(url, { params, ...config }).then((res) => res.data)
}

export default instance
