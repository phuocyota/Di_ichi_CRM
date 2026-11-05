import apiClient from './apiClient.js'

function snapshot(value, branchId) {
  if (value?.branchId !== branchId || !Number.isInteger(value.revision) || value.revision < 0 || typeof value.saved !== 'boolean' || !Array.isArray(value.shifts) || value.shifts.length < 2) throw new Error('API ca làm trả dữ liệu không hợp lệ.')
  const ids = new Set()
  const shifts = value.shifts.map(shift => {
    if (!shift.id || ids.has(shift.id) || typeof shift.name !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.end) || shift.start >= shift.end) throw new Error('Thông tin ca làm từ API không hợp lệ.')
    ids.add(shift.id)
    return { ...shift, branchId, source: 'api' }
  })
  if (!ids.has(`${branchId}-morning`) || !ids.has(`${branchId}-evening`)) throw new Error('API chưa trả đủ Ca sáng và Ca tối.')
  return { ...value, shifts }
}
export async function getWorkShifts(branchId, signal) {
  return snapshot(await apiClient.get(`/work-shifts/branches/${branchId}`, { signal }), branchId)
}
export async function saveWorkShifts(branchId, revision, shifts) {
  return snapshot(await apiClient.put(`/work-shifts/branches/${branchId}`, {
    revision,
    shifts: shifts.map(({ id, name, start, end }) => ({ id, name, start, end })),
  }), branchId)
}
