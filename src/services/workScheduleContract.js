export const emptyWorkSchedule = () => ({ branchId: '', revision: 0, assignments: [], preferences: [], attendance: [], audit: [] })
export const normalizeWorkSearch = value => String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLocaleLowerCase('vi')

export function normalizeWorkSchedule(value) {
  if (!value || typeof value.branchId !== 'string' || !value.branchId || !Number.isInteger(value.revision) || value.revision < 0 || !['assignments', 'preferences', 'attendance', 'audit'].every(key => Array.isArray(value[key]))) throw new Error('Dữ liệu phân lịch từ API không hợp lệ.')
  return value
}

const pick = (value, fields) => Object.fromEntries(fields.filter(key => value[key] !== undefined).map(key => [key, value[key]]))
export function workSchedulePayload(value) {
  return {
    revision: value.revision,
    assignments: value.assignments.map(item => pick(item, [
      'id', 'kind', 'personId', 'branchId', 'date', 'start', 'end',
      'originalPersonId', 'replacementReason',
      ...(item.kind === 'teacher' ? ['classId', 'periods'] : ['employeeType', 'shiftId']),
    ])),
    attendance: value.attendance.map(record => pick(record, ['assignmentId', 'checkIn', 'checkOut', 'source', 'note'])),
    preferences: value.preferences.map(record => pick(record, ['personId', 'branchId', 'date', 'shiftId'])),
  }
}
