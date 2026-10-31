import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  globalThis.localStorage = { getItem: () => null }
  const { default: client } = await server.ssrLoadModule('/src/services/apiClient.js')
  const api = await server.ssrLoadModule('/src/services/systemSettingsApi.js')
  const data = {
    staff: [{ id: 'staff-1', code: 'NV1', name: 'API Employee', type: 'TEACHER', status: 'active', branchId: 'branch-1' }],
    accounts: [{ id: 'account-1', staffId: 'staff-1', email: 'actual@example.test', status: 'ACTIVE', displayName: 'API Employee' }],
    roles: [{ id: 'role-1', name: 'API Role', code: 'custom', protected: false }],
    permissions: [{ id: 'permission-1', code: 'student.read' }],
    rolePermissions: [{ roleId: 'role-1', permissionId: 'permission-1' }],
    userRoles: [{ userId: 'account-1', roleId: 'role-1' }],
    branches: [{ id: 'branch-1', name: 'API Branch' }], departments: [], positions: [], specialties: [],
    auditLogs: [{ id: 'log-1', actorUserId: 'account-1', action: 'role.permissions', createdAt: '2026-10-30T00:00:00Z' }],
    modules: [{ key: 'student', label: 'API Students' }], currentUserId: 'admin-1',
  }
  const calls = []
  client.defaults.adapter = async config => {
    calls.push({ method: config.method, url: config.url, payload: config.data ? JSON.parse(config.data) : undefined })
    return { data: { success: true, data: config.method === 'get' ? data : { id: 'saved-1' } }, status: 200, statusText: 'OK', headers: {}, config }
  }
  const loaded = await api.loadSettings()
  assert.equal(loaded.staff[0].name, 'API Employee')
  const view = api.settingsView(loaded)
  assert.equal(view.employeeRows[0].branch, 'API Branch')
  assert.equal(view.employeeRows[0].username, 'actual@example.test')
  assert.deepEqual(view.employeeRows[0].roleIds, ['role-1'])
  assert.deepEqual(view.roleRows[0].permissionIds, ['permission-1'])
  assert.equal(view.roleRows[0].staffCount, 1)
  assert.equal(view.auditLogs[0].actor, 'API Employee')
  const employee = { code: 'NV2', email: 'employee@example.test', roleIds: ['role-1'] }
  await api.saveEmployee(null, employee)
  await api.saveEmployee({ id: 'staff-1' }, employee)
  await api.lockAccount('account-1', true)
  await api.resetPassword('account-1', 'NewPassword2026!')
  await api.assignRoles('account-1', ['role-1'])
  await api.saveRole(null, { code: 'custom', name: 'Custom', permissionIds: [] })
  await api.saveRole('role-1', { code: 'custom', name: 'Renamed', permissionIds: ['permission-1'] })
  await api.savePermissions('role-1', ['permission-1'])
  await api.deleteRole('role-1')
  assert.deepEqual(calls.map(c => [c.method, c.url]), [
    ['get', '/system-settings'], ['post', '/system-settings/employees'], ['patch', '/system-settings/employees/staff-1'],
    ['patch', '/system-settings/accounts/account-1/lock'], ['post', '/system-settings/accounts/account-1/password'],
    ['put', '/system-settings/accounts/account-1/roles'], ['post', '/system-settings/roles'], ['patch', '/system-settings/roles/role-1'],
    ['put', '/system-settings/roles/role-1/permissions'], ['delete', '/system-settings/roles/role-1'],
  ])
  assert.deepEqual(calls[3].payload, { locked: true })
  assert.deepEqual(calls[5].payload, { roleIds: ['role-1'] })
  assert.deepEqual(calls[8].payload, { permissionIds: ['permission-1'] })
  client.defaults.adapter = async config => ({ data: { success: true, data: {} }, status: 200, statusText: 'OK', headers: {}, config })
  await assert.rejects(api.loadSettings(), /không đúng định dạng/)
  client.defaults.adapter = async () => { throw Object.assign(new Error('Conflict'), { response: { status: 409, data: { message: 'Email đã được sử dụng' } } }) }
  await assert.rejects(api.saveEmployee(null, employee), /Email đã được sử dụng/)
  const { default: Employees } = await server.ssrLoadModule('/src/components/SystemSettings/EmployeesPanel.jsx')
  const { default: Permissions } = await server.ssrLoadModule('/src/components/SystemSettings/PermissionsPanel.jsx')
  const { default: Modal } = await server.ssrLoadModule('/src/components/SystemSettings/EmployeeModal.jsx')
  const { default: Page } = await server.ssrLoadModule('/src/pages/SystemSettings/SystemSettingsPage.jsx')
  const employeeHtml = renderToString(createElement(Employees, { rows: view.employeeRows, roles: data.roles, directories: data, keyword: '', currentUserId: 'admin-1' }))
  assert.match(employeeHtml, /API Employee/)
  assert.match(employeeHtml, /actual@example.test/)
  const permissionHtml = renderToString(createElement(Permissions, { rows: view.roleRows, permissions: data.permissions, modules: data.modules, employees: view.employeeRows, auditLogs: view.auditLogs, keyword: '' }))
  assert.match(permissionHtml, /API Role: student.read/)
  assert.match(permissionHtml, /API Students/)
  assert.match(permissionHtml, /checked=""/)
  const modalHtml = renderToString(createElement(Modal, { modal: { type: 'form' }, roles: data.roles, directories: data, currentUserId: 'admin-1' }))
  assert.match(modalHtml, /type="email" required=""/)
  assert.match(modalHtml, /value="branch-1"/)
  assert.match(modalHtml, /type="password" required=""/)
  assert.match(renderToString(createElement(Page)), /Đang tải cài đặt hệ thống/)
  assert.match(renderToString(createElement(Employees, { rows: [], roles: [], directories: data, keyword: '' })), /Chưa có nhân viên phù hợp/)
  console.log('PASS: System Settings API contracts, persisted-data mapping, error propagation, employee/permission rendering and loading/empty states.')
} finally { await server.close() }
