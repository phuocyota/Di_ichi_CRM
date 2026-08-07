import apiClient from './apiClient.js'

const pathFor = (resource) => resource

export async function listResource(resource, params = {}) {
  const result = await apiClient.get(`/${pathFor(resource)}`, {
    // Backend hiện lỗi transform query number cho page/size; bỏ pagination để dùng mặc định.
    params,
  })
  return Array.isArray(result) ? result : result?.data || []
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

export function getStudentSummary() {
  return apiClient.get('/student/summary')
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
    teachers: result.staff.filter((item) => item.type === 'teacher'),
    rooms: result.room,
    departments: result.department,
    positions: result.position,
    specialties: result.specialty,
  }
}

export async function loadResources(resources) {
  const entries = await Promise.all(resources.map(async (resource) => [resource, await listResource(resource)]))
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
