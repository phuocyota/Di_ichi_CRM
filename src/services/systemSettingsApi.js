import apiClient from './apiClient.js'

export const settingTabs = [{ key: 'employees', label: 'Nhân viên' }, { key: 'permissions', label: 'Phân quyền' }]
export const actionLabels = { read: 'Xem', create: 'Thêm', update: 'Sửa', delete: 'Xóa' }
export const staffTypes = [{ value: 'ADMIN', label: 'Quản trị viên' }, { value: 'TEACHER', label: 'Giáo viên' }, { value: 'KINH_DOANH', label: 'Kinh doanh / nhân viên nghiệp vụ' }]
const date = value => value ? new Date(value).toLocaleString('vi-VN') : '—'
const eventLabels = { 'staff.create': 'Thêm nhân viên', 'staff.update': 'Sửa nhân viên', 'account.lock': 'Khóa tài khoản', 'account.unlock': 'Mở khóa tài khoản', 'account.reset-password': 'Đặt lại mật khẩu', 'account.assign-roles': 'Gán vai trò', 'role.create': 'Thêm vai trò', 'role.update': 'Sửa vai trò', 'role.delete': 'Xóa vai trò', 'role.permissions': 'Cập nhật quyền' }
export async function loadSettings(signal) {
  const data = await apiClient.get('/system-settings', { signal })
  for (const key of ['staff', 'accounts', 'roles', 'permissions', 'rolePermissions', 'userRoles', 'branches', 'departments', 'positions', 'specialties', 'auditLogs', 'modules']) if (!Array.isArray(data?.[key])) throw new Error('Dữ liệu cài đặt hệ thống không đúng định dạng')
  return data
}
export function settingsView(data) {
  const name = (rows, id) => rows.find(row => row.id === id)?.name || '—'
  const employeeRows = data.staff.map(s => {
    const account = data.accounts.find(a => a.staffId === s.id)
    const roleIds = data.userRoles.filter(r => r.userId === account?.id).map(r => r.roleId)
    return { ...s, email: account?.email || s.email, typeValue: s.type?.trim().toUpperCase().replace(/[\s-]+/g, '_'), position: name(data.positions, s.positionId), department: name(data.departments, s.departmentId), branch: name(data.branches, s.branchId), status: s.status?.toLowerCase() === 'active' ? 'Đang làm việc' : s.status, statusValue: s.status, accountId: account?.id || null, loginEmail: account?.email || '', accountStatusValue: account?.status || 'ACTIVE', lockedAt: account?.lockedAt || null, accountStatus: !account ? 'Chưa tạo' : account.lockedAt ? 'Tạm khóa' : account.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động', username: account?.email || 'Chưa tạo', roleIds, roleName: roleIds.map(id => name(data.roles, id)).join(', ') || 'Chưa gán vai trò', lastLogin: date(account?.lastLoginAt) }
  })
  const roleRows = data.roles.map(r => {
    const members = data.userRoles.filter(link => link.roleId === r.id).map(link => data.accounts.find(a => a.id === link.userId)).filter(Boolean)
    const permissionIds = data.rolePermissions.filter(link => link.roleId === r.id).map(link => link.permissionId)
    return { ...r, permissionIds, staffCount: members.length, staffNames: members.map(a => a.displayName).join(', '), members }
  })
  const auditLogs = data.auditLogs.map(log => ({ ...log, actor: data.accounts.find(a => a.id === log.actorUserId)?.displayName || log.actorUserId || '—', actionLabel: eventLabels[log.action] || log.action, changedAt: date(log.createdAt) }))
  return { employeeRows, roleRows, auditLogs }
}
export const saveEmployee = (row, payload) => row?.id ? apiClient.patch(`/system-settings/employees/${row.id}`, payload) : apiClient.post('/system-settings/employees', payload)
export const lockAccount = (id, locked) => apiClient.patch(`/system-settings/accounts/${id}/lock`, { locked })
export const resetPassword = (id, password) => apiClient.post(`/system-settings/accounts/${id}/password`, { password })
export const assignRoles = (id, roleIds) => apiClient.put(`/system-settings/accounts/${id}/roles`, { roleIds })
export const saveRole = (id, payload) => id ? apiClient.patch(`/system-settings/roles/${id}`, payload) : apiClient.post('/system-settings/roles', payload)
export const savePermissions = (id, permissionIds) => apiClient.put(`/system-settings/roles/${id}/permissions`, { permissionIds })
export const deleteRole = id => apiClient.delete(`/system-settings/roles/${id}`)
