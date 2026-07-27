import { adminUsers } from '../datas/adminUsers.js'

export function signInWithMockAccount({ email, password }) {
  const user = adminUsers.find(
    (item) => item.email === email && item.password === password,
  )

  if (!user) {
    return {
      ok: false,
      message: 'Email hoặc mật khẩu không đúng',
    }
  }

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
    },
    token: user.mockToken,
  }
}
