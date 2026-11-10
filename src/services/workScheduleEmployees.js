import { loadSettings } from './systemSettingsApi.js'
import { getAccessToken } from './apiClient.js'
import { createSharedReads } from './sharedReads.js'

const reads = createSharedReads()
let session = ''

const canonical = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')
const careCodes = new Set(['CSKH', 'CS_KH', 'CUSTOMER_CARE', 'CUSTOMER_SERVICE', 'CUSTOMER_SUPPORT', 'CHAM_SOC_KHACH_HANG', 'NHAN_VIEN_CSKH', 'NHAN_VIEN_CHAM_SOC_KHACH_HANG'])
const saleCodes = new Set(['SALE', 'SALES', 'NV_SALE', 'NV_SALES', 'SALES_STAFF', 'NHAN_VIEN_SALE', 'NHAN_VIEN_SALES', 'NHAN_VIEN_KINH_DOANH', 'TU_VAN_TUYEN_SINH', 'NHAN_VIEN_TU_VAN_TUYEN_SINH'])
export const matchesWorkEmployeeType = (person, type) => (person?.employeeTypes || [person?.employeeType]).includes(type)

export function normalizeWorkScheduleEmployees(data) {
  const active = rows => rows.filter(row => !row.deletedAt)
  const roles = active(data.roles), accounts = active(data.accounts), positions = active(data.positions)
  const eligibleStaff = active(data.staff).filter(person => !['TEACHER', 'GIAO_VIEN', 'ADMIN', 'SUPER_ADMIN', 'STUDENT'].includes(canonical(person.type)) && !['INACTIVE', 'PAUSED', 'RESIGNED', 'TERMINATED'].includes(canonical(person.status)))
  const employees = eligibleStaff.map(person => {
    const accountIds = new Set(accounts.filter(account => account.staffId === person.id).map(account => account.id))
    const roleIds = new Set(active(data.userRoles).filter(link => accountIds.has(link.userId)).map(link => link.roleId))
    const position = positions.find(row => row.id === person.positionId)
    const assignedRoles = roles.filter(role => roleIds.has(role.id))
    const identifiers = [person.employeeType, person.type, position?.code, position?.name, ...assignedRoles.flatMap(role => [role.code, role.name])].map(canonical)
    const employeeTypes = [...(identifiers.some(code => careCodes.has(code)) ? ['cskh'] : []), ...(identifiers.some(code => saleCodes.has(code)) ? ['sale'] : [])]
    return { ...person, kind: 'employee', employeeTypes, employeeType: employeeTypes[0] || '', role: employeeTypes.map(type => type === 'cskh' ? 'CSKH' : 'Sale').join(' / '), position: position?.name || '', catalogSource: 'api' }
  })
  return { employees: employees.filter(person => person.employeeTypes.length > 0), unclassified: employees.filter(person => !person.employeeTypes.length), branches: active(data.branches) }
}

export async function loadWorkScheduleEmployees(signal, { force = false } = {}) {
  const token = getAccessToken()
  if (token !== session) { reads.clear(); session = token }
  return reads.read('directory', async sharedSignal => normalizeWorkScheduleEmployees(await loadSettings(sharedSignal)), { signal, force })
}
