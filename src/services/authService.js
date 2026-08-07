import apiClient, {
  USER_KEY,
  removeStoredSession,
  setAccessToken,
} from './apiClient.js'

export async function signIn({ email, password }) {
  removeStoredSession()
  const result = await apiClient.post('/auth/login', { email, password })
  setAccessToken(result?.accessToken)

  const user = {
    id: result.userId,
    email,
    name: email.split('@')[0],
    role: result.userType,
    position: result.userType === 'ADMIN' ? 'Quản trị viên' : result.userType,
    deviceId: result.deviceId,
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function clearSession() {
  removeStoredSession()
}
