import { createWorkScheduleData, workClasses, workPeople } from '../datas/workSchedules.js'

export const WORK_SCHEDULE_KEY = 'diichi-work-schedule-v1'
export const todayVN = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
export const addDays = (date, amount) => new Date(Date.parse(`${date}T00:00:00Z`) + amount * 86400000).toISOString().slice(0, 10)
export function weekStart(date = todayVN()) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay()
  return addDays(date, -(day === 0 ? 6 : day - 1))
}
export const atTime = (item, field) => Date.parse(`${item.date}T${item[field]}:00+07:00`)
export function loadWorkSchedule() {
  try {
    const value = JSON.parse(localStorage.getItem(WORK_SCHEDULE_KEY))
    if (value?.version === 1 && ['branches', 'shifts', 'assignments', 'preferences', 'attendance', 'audit'].every(key => Array.isArray(value[key]))) return value
  } catch { /* An unreadable demo store starts with linked fixtures. */ }
  return createWorkScheduleData(weekStart())
}
export function saveWorkSchedule(value) {
  localStorage.setItem(WORK_SCHEDULE_KEY, JSON.stringify(value))
  window.dispatchEvent(new Event('work-schedule:updated'))
}
const timeSeconds = value => {
  const match = /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/.exec(String(value || ''))
  return match && Number(match[1]) < 24 ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] || 0) : NaN
}
// User-created fixture bookings have UUIDs, unlike the generated lesson-* rows.
// Identify legacy demo data by its class, not by its assignment ID.
const sampleTeacherAssignment = item => item.kind === 'teacher' && (item.catalogSource === 'sample' || (item.catalogSource !== 'api' && workClasses.some(row => row.id === item.classId)))

export function findAssignmentConflict(candidate, assignments) {
  const start = timeSeconds(candidate.start), end = timeSeconds(candidate.end)
  for (const item of assignments) {
    if (candidate.id && item.id === candidate.id) continue
    if (item.date !== candidate.date) continue
    // Old fixture classes are hidden after switching the catalog to the API.
    // They must not reserve teachers against bookings that use the API catalog.
    if (candidate.catalogSource === 'api' && sampleTeacherAssignment(item)) continue
    if (!(start < timeSeconds(item.end) && end > timeSeconds(item.start))) continue
    if (candidate.personId && item.personId === candidate.personId) return { assignment: item, reason: 'person' }
    if (candidate.kind === 'teacher' && item.kind === 'teacher' && candidate.classId && item.classId === candidate.classId) return { assignment: item, reason: 'class' }
  }
  return null
}

export function validateAssignment(candidate, assignments) {
  const start = timeSeconds(candidate.start), end = timeSeconds(candidate.end)
  if (!candidate.personId || !candidate.branchId || !candidate.date || !Number.isFinite(start) || !Number.isFinite(end) || start >= end) throw new Error('Chọn đủ thông tin, giờ hợp lệ và giờ kết thúc phải sau giờ bắt đầu.')
  const conflict = findAssignmentConflict(candidate, assignments)
  if (conflict) {
    const item = conflict.assignment
    const person = item.personName || workPeople.find(row => row.id === item.personId)?.name || item.personId
    const classLabel = item.classCode || item.className || item.classId || 'ca làm'
    const reason = conflict.reason === 'person' ? `${candidate.kind === 'teacher' ? 'Giáo viên' : 'Nhân viên'} ${person} đã có lịch` : `Lớp ${classLabel} đã có lịch với ${person}`
    throw new Error(`Trùng giờ: ${reason} ${item.start}–${item.end} ngày ${item.date.split('-').reverse().join('/')} (${classLabel}).`)
  }
  if (candidate.kind === 'employee') {
    const from = weekStart(candidate.date), to = addDays(from, 6)
    const days = new Set(assignments.filter(item => item.id !== candidate.id && item.personId === candidate.personId && item.date >= from && item.date <= to).map(item => item.date))
    days.add(candidate.date)
    if (days.size > 6) throw new Error('Mỗi nhân viên bắt buộc có ít nhất 1 ngày OFF mỗi tuần.')
  }
}
export function attendanceIssues(item, record, now = Date.now()) {
  const result = []
  if (record?.checkIn && Date.parse(record.checkIn) > atTime(item, 'start')) result.push('Đi trễ')
  if (record?.checkOut && Date.parse(record.checkOut) < atTime(item, 'end')) result.push('Về sớm')
  if (now > atTime(item, 'end') && (!record?.checkIn || !record?.checkOut)) result.push('Quên chấm công')
  return result
}
export function upsertWorkAssignment(data, candidate) {
  validateAssignment(candidate, data.assignments)
  const previous = data.assignments.find(item => item.id === candidate.id)
  const changedIdentity = previous && ['personId', 'classId', 'branchId', 'date'].some(key => previous[key] !== candidate[key])
  return {
    ...data,
    assignments: [...data.assignments.filter(item => item.id !== candidate.id), candidate],
    attendance: changedIdentity ? data.attendance.filter(record => record.assignmentId !== candidate.id) : data.attendance,
  }
}
export function removeWorkAssignment(data, id) {
  return { ...data, assignments: data.assignments.filter(item => item.id !== id), attendance: data.attendance.filter(record => record.assignmentId !== id) }
}
export function attendanceStatus(item, record, now = Date.now()) {
  const issues = attendanceIssues(item, record, now)
  if (record?.checkIn && record?.checkOut) return { label: 'Đã chấm công đầy đủ', tone: issues.length ? 'warning' : 'success' }
  if (record?.checkIn) return { label: 'Đã check-in · Chưa check-out', tone: issues.length ? 'warning' : 'info' }
  if (record?.checkOut) return { label: 'Thiếu check-in', tone: 'warning' }
  return { label: 'Chưa chấm công', tone: issues.length ? 'warning' : 'neutral' }
}
// Maps must point to recorded evidence, never the configured branch location.
export function attendanceMap(evidence) {
  if (!evidence || !Number.isFinite(evidence.latitude) || !Number.isFinite(evidence.longitude) || Math.abs(evidence.latitude) > 90 || Math.abs(evidence.longitude) > 180) return null
  const coordinates = `${evidence.latitude},${evidence.longitude}`
  return {
    coordinates,
    url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`,
    embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(coordinates)}&output=embed`,
  }
}
export function workAlerts(data, now = Date.now(), people = workPeople) {
  return data.assignments.flatMap(item => attendanceIssues(item, data.attendance.find(record => record.assignmentId === item.id), now).map(type => ({ id: `${item.id}-${type}`, assignmentId: item.id, personId: item.personId, branchId: item.branchId, date: item.date, type, name: people.find(person => person.id === item.personId)?.name || item.personName || item.personId })))
}
export function distanceMeters(a, b) {
  const rad = value => value * Math.PI / 180
  const dLat = rad(a.latitude - b.latitude), dLon = rad(a.longitude - b.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}
