import axios from 'axios'

export const ACCESS_TOKEN_KEY = 'accessToken'
const LEGACY_ACCESS_TOKEN_KEY = 'ec_admin_token'
export const REFRESH_TOKEN_KEY = 'ec_admin_refresh_token'
export const USER_KEY = 'ec_admin_user'

export function normalizeAccessToken(token) {
  if (typeof token !== 'string') return ''

  return token.trim().replace(/^Bearer\s+/i, '').replace(/^['"]|['"]$/g, '')
}

export function getAccessToken() {
  return normalizeAccessToken(localStorage.getItem(ACCESS_TOKEN_KEY))
}

export function setAccessToken(token) {
  const normalizedToken = normalizeAccessToken(token)

  if (!normalizedToken) {
    throw new Error('API đăng nhập không trả về accessToken hợp lệ')
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, normalizedToken)
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
  return normalizedToken
}

export function removeStoredSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  const isLoginRequest = config.url?.includes('/auth/login')

  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      removeStoredSession()
      window.dispatchEvent(new Event('auth:unauthorized'))
    }

    const body = error.response?.data?.error || error.response?.data
    const fieldMessages = body?.fields
      ? Object.values(body.fields).flat().filter(Boolean)
      : []
    const rawMessage = fieldMessages.length ? fieldMessages : body?.message
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage

    const apiError = new Error(message || (error.code === 'ECONNABORTED'
      ? 'Máy chủ phản hồi quá lâu'
      : 'Không thể kết nối đến máy chủ'))
    apiError.code = body?.code || error.code
    apiError.status = error.response?.status
    apiError.fields = body?.fields
    return Promise.reject(apiError)
  },
)

export default apiClient
