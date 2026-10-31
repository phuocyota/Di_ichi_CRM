import apiClient from './apiClient.js'

const pathFor = (resource) => resource

export async function listResource(resource, params = {}) {
  const result = await apiClient.get(`/${pathFor(resource)}`, {
    // Backend hiện lỗi transform query number cho page/size; bỏ pagination để dùng mặc định.
    params,
  })
  if (Array.isArray(result)) return result
  if (Array.isArray(result?.data)) return result.data
  if (Array.isArray(result?.items)) return result.items
  if (Array.isArray(result?.data?.items)) return result.data.items
  return []
}

export function getResource(resource, id, params) {
  return apiClient.get(`/${pathFor(resource)}/${id}`, { params })
}

export function createResource(resource, payload) {
  return apiClient.post(`/${pathFor(resource)}`, payload)
}

export function updateResource(resource, id, payload) {
  return apiClient.patch(`/${pathFor(resource)}/${id}`, payload)
}

export function deleteResource(resource, id) {
  return apiClient.delete(`/${pathFor(resource)}/${id}`)
}

export function getAdminDashboard() {
  return apiClient.get('/dashboard/admin')
}

export function getCrmDashboard(params = {}) {
  return apiClient.get('/dashboard/crm', { params })
}

export function getStudentSaleOptions(branchId) {
  return apiClient.get('/student/sale-options', { params: { branchId } })
}

export function assignStudentSale(studentId, saleUserId) {
  return apiClient.patch(`/student/${studentId}/sale`, { saleUserId })
}

export function getStudentSummary() {
  return apiClient.get('/student/summary')
}

export async function getStudentProfile(studentId, params = {}) {
  const result = await apiClient.get(`/student/${studentId}/profile`, { params })
  const sections = {
    overview: ['guardians', 'enrollments'], attendance: ['attendance'], scores: ['scores'],
    homework: ['submissions'], tuition: ['transactions', 'payments', 'debtSchedules'],
    history: ['statusHistory', 'activities'], certificates: ['certificates'],
  }
  const keys = sections[params.section || 'overview']
  if (result?.student?.id !== studentId || !keys || keys.some((key) => !Array.isArray(result[key]?.items) || !Number.isInteger(result[key]?.total))) {
    throw new Error('Dữ liệu hồ sơ học viên không đúng định dạng')
  }
  if ((params.section || 'overview') === 'overview' && !Array.isArray(result.classStaff)) throw new Error('Dữ liệu lớp học không đúng định dạng')
  return result
}

// Used by tables that currently filter and paginate locally. Keep the server's
// metadata so the default first page cannot be mistaken for the complete list.
export async function listAllResource(resource) {
  const items = []
  const seen = new Set()
  for (let page = 1; ; page += 1) {
    const response = await apiClient.get(`/${resource}`, { params: { page, size: 100 }, preserveResponse: true })
    const result = response?.success === true ? response.data : response
    if (!Array.isArray(result?.data) || !Number.isInteger(result.total) || result.total < 0) {
      throw new Error('Danh sách trả về không đúng định dạng')
    }
    for (const item of result.data) {
      if (!item.id || seen.has(item.id)) throw new Error('Danh sách thay đổi trong khi tải. Vui lòng thử lại.')
      seen.add(item.id)
      items.push(item)
    }
    if (items.length >= result.total) return items
    if (!result.data.length) throw new Error('Chưa tải đủ danh sách. Vui lòng thử lại.')
  }
}

export function getParentSummary() {
  return apiClient.get('/student-guardian/summary')
}

export function getClassSummary() {
  return apiClient.get('/class/summary')
}

export function getScheduleSummary(params) {
  return apiClient.get('/schedule/summary', { params })
}

export function getStaffSummary() {
  return apiClient.get('/staff/summary')
}

export async function getMetadata() {
  const result = await loadResources(['branch', 'course', 'class', 'staff', 'room', 'department', 'position', 'specialty'])
  return {
    branches: result.branch,
    courses: result.course,
    classes: result.class,
    teachers: result.staff.filter((item) => item.type?.toLowerCase() === 'teacher'),
    rooms: result.room,
    departments: result.department,
    positions: result.position,
    specialties: result.specialty,
  }
}

export async function loadResources(resources) {
  const entries = await Promise.all(resources.map(async (resource) => [resource, await listAllResource(resource)]))
  return Object.fromEntries(entries)
}

export function indexById(items = []) {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}

export function findIdByName(items = [], name) {
  return items.find((item) => item.name === name || item.code === name)?.id
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase() || 'NA'
}

export function numeric(value) {
  return Number(value || 0)
}
