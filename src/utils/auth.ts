const ACCESS_TOKEN_KEY = 'h5_admin_access_token'
const REFRESH_TOKEN_KEY = 'h5_admin_refresh_token'

// === Access Token ===

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

// === Refresh Token ===

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

// === Clear All ===

export function removeTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// === 兼容旧名（便于渐进迁移） ===
export const getToken = getAccessToken
export const setToken = setAccessToken
export const removeToken = removeTokens
