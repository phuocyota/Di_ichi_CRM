import apiClient, { getAccessToken } from './apiClient.js'
import { createSharedReads } from './sharedReads.js'

const reads = createSharedReads()
const listeners = new Set()
let session = ''
const prefix = branchId => `${branchId}:`
function checkSession() {
  const token = getAccessToken()
  if (token !== session) { reads.clear(); session = token }
  return token
}
function publish(value, token) {
  if (token === getAccessToken()) for (const listener of listeners) listener(value)
  return value
}
export function subscribeWorkShifts(listener) { listeners.add(listener); return () => listeners.delete(listener) }

function snapshot(value, branchId) {
  if (value?.branchId !== branchId || !Number.isInteger(value.revision) || value.revision < 0 || typeof value.saved !== 'boolean' || !Array.isArray(value.shifts) || value.shifts.length < 2) throw new Error('API ca làm trả dữ liệu không hợp lệ.')
  const ids = new Set()
  const shifts = value.shifts.map(shift => {
    if (!shift.id || ids.has(shift.id) || typeof shift.name !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.end) || shift.start >= shift.end) throw new Error('Thông tin ca làm từ API không hợp lệ.')
    ids.add(shift.id)
    // Unsaved branches use the current default; saved branch settings stay authoritative.
    return { ...shift, branchId, source: 'api' }
  })
  if (!ids.has(`${branchId}-morning`) || !ids.has(`${branchId}-evening`)) throw new Error('API chưa trả đủ Ca sáng và Ca tối.')
  return { ...value, shifts }
}
export async function getWorkShifts(branchId, signal, filters, { force = false } = {}) {
  const token = checkSession()
  const key = prefix(branchId) + JSON.stringify(filters || {})
  const value = await reads.read(key, async sharedSignal => snapshot(await apiClient.get(`/work-shifts/branches/${branchId}`, { signal: sharedSignal, params: filters }), branchId), { signal, force })
  return publish(value, token)
}
export async function saveWorkShifts(branchId, revision, shifts, roster) {
  const token = checkSession()
  const value = snapshot(await apiClient.put(`/work-shifts/branches/${branchId}`, {
    revision,
    shifts: shifts.map(({ id, name, start, end }) => ({ id, name, start, end })),
    ...(roster ? { roster } : {}),
  }), branchId)
  reads.clear(prefix(branchId))
  return publish(value, token)
}

async function mutateRoster(branchId, request) {
  const token = checkSession()
  const value = snapshot(await request(), branchId)
  reads.clear(prefix(branchId))
  return publish(value, token)
}
const rosterPath = branchId => `/work-shifts/branches/${branchId}`
export const assignEmployeeShifts = (branchId, revision, assignments) =>
  mutateRoster(branchId, () => apiClient.post(`${rosterPath(branchId)}/employee-assignments`, { revision, assignments }))
export const swapWorkShift = (branchId, assignmentId, revision, shiftId) =>
  mutateRoster(branchId, () => apiClient.post(`${rosterPath(branchId)}/assignments/${assignmentId}/swap-shift`, { revision, shiftId }))
export const replaceWorkPerson = (branchId, assignmentId, revision, personId, reason) =>
  mutateRoster(branchId, () => apiClient.post(`${rosterPath(branchId)}/assignments/${assignmentId}/replace`, { revision, personId, reason }))
export const removeWorkAssignmentApi = (branchId, assignmentId, revision) =>
  mutateRoster(branchId, () => apiClient.delete(`${rosterPath(branchId)}/assignments/${assignmentId}`, { params: { revision } }))
export const createWorkDayOff = (branchId, revision, personId, date) =>
  mutateRoster(branchId, () => apiClient.post(`${rosterPath(branchId)}/day-offs`, { revision, personId, date }))
export const deleteWorkDayOff = (branchId, revision, personId, date) =>
  mutateRoster(branchId, () => apiClient.delete(`${rosterPath(branchId)}/day-offs`, { params: { revision, personId, date } }))
