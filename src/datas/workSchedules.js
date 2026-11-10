import { teachers, courseClasses } from './courses.js'
import { staffs } from './staffs.js'
import { generatePatternUntil } from '../services/schedulePattern.js'

export const workBranches = [
  { id: 'branch-1', name: 'Cơ sở 1', latitude: 10.7326, longitude: 106.7199, radius: 200 },
  { id: 'branch-2', name: 'Cơ sở 2', latitude: 10.8506, longitude: 106.7719, radius: 200 },
  { id: 'branch-3', name: 'Cơ sở 3', latitude: 10.7769, longitude: 106.7009, radius: 200 },
]
export const workPeople = [
  ...teachers.map(person => ({ ...person, kind: 'teacher', role: 'Giáo viên tiếng Anh', branchId: 'branch-1' })),
  ...staffs.filter(person => ['STF005', 'STF006'].includes(person.id)).map((person, index) => ({ id: person.id, name: person.name, kind: 'employee', employeeType: index ? 'sale' : 'cskh', role: index ? 'Sale' : 'CSKH', branchId: index ? 'branch-2' : 'branch-1' })),
]
export const workEmployeeTypes = [{ value: 'cskh', label: 'CSKH' }, { value: 'sale', label: 'Sale' }]
const workEmployeeSamples = [
  { name: 'Nguyễn Minh Anh', employeeType: 'cskh' },
  { name: 'Trần Thu Hà', employeeType: 'cskh' },
  { name: 'Lê Hoàng Nam', employeeType: 'sale' },
  { name: 'Phạm Ngọc Linh', employeeType: 'sale' },
]
export const createWorkEmployees = branches => branches.flatMap(branch => workEmployeeSamples.map((person, index) => ({
  id: `demo-staff-${branch.id}-${person.employeeType}-${index + 1}`,
  name: `${person.name} (mẫu)`,
  kind: 'employee',
  branchId: branch.id,
  employeeType: person.employeeType,
  employeeTypes: [person.employeeType],
  role: person.employeeType === 'cskh' ? 'CSKH' : 'Sale',
  catalogSource: 'sample',
})))
export const workClasses = courseClasses.map(item => ({ ...item, branchId: item.roomId === 'room-202' ? 'branch-2' : item.roomId === 'room-lab-a' ? 'branch-3' : 'branch-1' }))
export const workTabs = [{ key: 'employee', label: 'Phân lịch nhân viên' }, { key: 'shifts', label: 'Quản lý ca làm' }]

export const createWorkShifts = branches => branches.flatMap(branch => [
  { id: `${branch.id}-morning`, branchId: branch.id, name: 'Ca sáng', start: '07:30', end: '14:30', source: 'sample' },
  { id: `${branch.id}-evening`, branchId: branch.id, name: 'Ca tối', start: '13:30', end: '19:30', source: 'sample' },
])

export function createWorkScheduleData(week) {
  const shifts = createWorkShifts(workBranches)
  const addDay = offset => new Date(Date.parse(`${week}T00:00:00Z`) + offset * 86400000).toISOString().slice(0, 10)
  const assignments = workClasses.flatMap(item => {
    const from = item.startDate > week ? item.startDate : week
    const to = item.endDate < addDay(6) ? item.endDate : addDay(6)
    if (from > to) return []
    return generatePatternUntil(item.schedule, from, to).map(slot => ({
      id: `lesson-${item.id}-${slot.date}-${slot.startTime}`, personId: item.teacherId, branchId: item.branchId,
      classId: item.id, date: slot.date, start: slot.startTime, end: slot.endTime, periods: 2, kind: 'teacher', catalogSource: 'sample',
    }))
  })
  const preferences = []
  workPeople.filter(person => person.kind === 'employee').forEach((person, index) => {
    for (let day = 0; day < 7; day++) {
      const shift = shifts.find(item => item.branchId === person.branchId && item.id.endsWith((day + index) % 2 ? 'evening' : 'morning'))
      const off = day === (index ? 5 : 6)
      preferences.push({ personId: person.id, date: addDay(day), branchId: person.branchId, shiftId: off ? 'OFF' : shift.id })
      if (!off) assignments.push({ id: `shift-${person.id}-${addDay(day)}`, personId: person.id, employeeType: person.employeeType, branchId: person.branchId, date: addDay(day), start: shift.start, end: shift.end, shiftId: shift.id, kind: 'employee' })
    }
  })
  const past = assignments.filter(item => item.date < addDay(2))
  const attendance = past.slice(0, 3).map((item, index) => {
    const branch = workBranches.find(row => row.id === item.branchId)
    const checkIn = new Date(Date.parse(`${item.date}T${item.start}:00+07:00`) + (index === 0 ? 12 * 60000 : 0)).toISOString()
    const checkOut = index === 2 ? null : new Date(Date.parse(`${item.date}T${item.end}:00+07:00`) - (index === 1 ? 30 * 60000 : 0)).toISOString()
    const evidence = timestamp => ({ latitude: branch.latitude + 0.00005, longitude: branch.longitude + 0.00005, accuracy: 8, capturedAt: timestamp, sample: true })
    return { assignmentId: item.id, checkIn, checkOut, checkInEvidence: evidence(checkIn), ...(checkOut ? { checkOutEvidence: evidence(checkOut) } : {}), source: 'sample', note: 'Bản ghi và vị trí mẫu để xem thống kê' }
  })
  return { version: 1, branches: workBranches, shifts, assignments, preferences, attendance, audit: [] }
}
