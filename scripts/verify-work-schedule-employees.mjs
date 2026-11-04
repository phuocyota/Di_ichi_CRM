import assert from 'node:assert/strict'
import { createServer } from 'vite'

globalThis.localStorage = { getItem: () => null }
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: client } = await server.ssrLoadModule('/src/services/apiClient.js')
  const { loadWorkScheduleEmployees, matchesWorkEmployeeType, shiftsForWorkBranches, withWorkEmployeeSamples } = await server.ssrLoadModule('/src/services/workScheduleEmployees.js')
  const data = {
    staff: [
      { id: 'care', name: 'CSKH API', type: 'KINH_DOANH', branchId: 'branch-api', status: 'active' },
      { id: 'sale', name: 'Sale API', type: 'KINH_DOANH', branchId: 'branch-api', status: 'probation' },
      { id: 'both', name: 'Hai vai trò', type: 'KINH_DOANH', status: 'active' },
      { id: 'position-care', name: 'CSKH theo chức vụ', type: 'KINH_DOANH', positionId: 'pos-care' },
      { id: 'unknown', name: 'Chưa phân loại', type: 'KINH_DOANH' },
      { id: 'teacher', name: 'Giáo viên', type: 'TEACHER', employeeType: 'SALE' },
      { id: 'admin', name: 'Admin', type: 'ADMIN', employeeType: 'CSKH' },
      { id: 'inactive', name: 'Đã nghỉ', type: 'KINH_DOANH', status: 'inactive', employeeType: 'SALE' },
      { id: 'deleted', name: 'Đã xóa', type: 'KINH_DOANH', deletedAt: '2026-11-01', employeeType: 'CSKH' },
    ],
    accounts: [{ id: 'account-care', staffId: 'care' }, { id: 'account-sale', staffId: 'sale' }, { id: 'account-both', staffId: 'both' }],
    roles: [{ id: 'role-care', code: 'CSKH', name: 'Chăm sóc khách hàng' }, { id: 'role-sale', code: 'sale', name: 'Sale' }],
    userRoles: [{ userId: 'account-care', roleId: 'role-care' }, { userId: 'account-sale', roleId: 'role-sale' }, { userId: 'account-both', roleId: 'role-care' }, { userId: 'account-both', roleId: 'role-sale' }],
    branches: [{ id: 'branch-api', name: 'Cơ sở API' }, { id: 'deleted-branch', deletedAt: '2026-11-01' }],
    positions: [{ id: 'pos-care', code: 'CSKH', name: 'Chăm sóc khách hàng' }], departments: [], specialties: [], permissions: [], rolePermissions: [], auditLogs: [], modules: [],
  }
  const calls = [], controller = new AbortController()
  client.defaults.adapter = async config => {
    calls.push(config)
    assert.equal(config.method, 'get')
    assert.equal(config.url, '/system-settings')
    assert.equal(config.signal, controller.signal)
    return { status: 200, statusText: 'OK', headers: {}, config, data: { success: true, data } }
  }
  const result = await loadWorkScheduleEmployees(controller.signal)
  assert.equal(calls.length, 1)
  assert.deepEqual(result.employees.map(person => person.id), ['care', 'sale', 'both', 'position-care'])
  assert.deepEqual(result.unclassified.map(person => person.id), ['unknown'])
  assert.equal(result.branches.length, 1)
  assert.ok(matchesWorkEmployeeType(result.employees.find(person => person.id === 'both'), 'sale'))
  assert.ok(matchesWorkEmployeeType(result.employees.find(person => person.id === 'both'), 'cskh'))
  assert.ok(!matchesWorkEmployeeType(result.employees.find(person => person.id === 'care'), 'sale'))
  assert.ok(!matchesWorkEmployeeType(undefined, 'sale'))
  assert.equal(withWorkEmployeeSamples(result).employees.length, result.employees.length)
  const onlySale = { employees: result.employees.filter(person => person.id === 'sale'), branches: result.branches }
  const supplemented = withWorkEmployeeSamples(onlySale)
  assert.deepEqual(supplemented.sampleTypes, ['cskh'])
  const sampleCare = supplemented.employees.filter(person => person.catalogSource === 'sample')
  assert.equal(sampleCare.length, 2)
  assert.ok(sampleCare.every(person => person.employeeType === 'cskh' && person.branchId === 'branch-api' && person.name.includes('(mẫu)')))
  assert.deepEqual(withWorkEmployeeSamples(onlySale).employees, supplemented.employees)
  assert.equal(withWorkEmployeeSamples({ employees: [], branches: result.branches }).employees.length, 4)
  assert.equal(withWorkEmployeeSamples({ employees: [], branches: [] }).employees.length, 0)
  const retained = withWorkEmployeeSamples(result, [{ kind: 'employee', personId: sampleCare[0].id }])
  assert.ok(retained.employees.some(person => person.id === sampleCare[0].id))
  assert.ok(!retained.employees.some(person => person.id === sampleCare[1].id))
  const previousShifts = [{ id: 'old', branchId: 'old-branch', name: 'Ca riêng', start: '08:00', end: '14:00' }]
  const shifts = shiftsForWorkBranches(previousShifts, result.branches)
  assert.equal(shifts.length, 3)
  assert.equal(shifts.filter(shift => shift.branchId === 'branch-api').length, 2)
  assert.ok(shifts.filter(shift => shift.branchId === 'branch-api').every(shift => shift.source === 'sample'))
  assert.deepEqual(shiftsForWorkBranches(shifts, result.branches), shifts)
  assert.deepEqual(previousShifts, [{ id: 'old', branchId: 'old-branch', name: 'Ca riêng', start: '08:00', end: '14:00' }])
  client.defaults.adapter = async config => ({ status: 200, statusText: 'OK', headers: {}, config, data: { success: true, data: Object.fromEntries(Object.keys(data).map(key => [key, []])) } })
  assert.deepEqual(await loadWorkScheduleEmployees(), { employees: [], unclassified: [], branches: [] })
  client.defaults.adapter = async config => ({ status: 200, statusText: 'OK', headers: {}, config, data: { success: true, data: {} } })
  await assert.rejects(loadWorkScheduleEmployees(), /không đúng định dạng/)
  client.defaults.adapter = async () => { throw new Error('Network error') }
  await assert.rejects(loadWorkScheduleEmployees(), /Không thể kết nối đến máy chủ/)
  controller.abort()
  await assert.rejects(loadWorkScheduleEmployees(controller.signal))
  console.log('PASS: GET-only staff/branch API, role and position classification, dual roles, unclassified staff, excluded staff, sample shifts with actual branch IDs, empty/error/invalid API and cancellation. No live API writes.')
} finally {
  await server.close()
}
