import assert from 'node:assert/strict'
import { createWorkScheduleData, workClasses, workPeople } from '../src/datas/workSchedules.js'
import { addDays, attendanceIssues, attendanceMap, attendanceStatus, distanceMeters, todayVN, upsertWorkAssignment, removeWorkAssignment, validateAssignment, weekStart, workAlerts, isWorkDayOff, setWorkDayOff, loadWorkSchedule, saveWorkSchedule } from '../src/services/workSchedule.js'
import { createWeekTimetableLayout } from '../src/services/workScheduleLayout.js'

assert.equal(todayVN(new Date('2026-11-01T18:00:00Z')), '2026-11-02')
assert.equal(weekStart('2026-11-08'), '2026-11-02')
assert.equal(addDays('2026-12-28', 6), '2027-01-03')
const data = createWorkScheduleData('2026-11-02')
// Explicit OFF is separate from an empty schedule and applies across branches.
const blank = { ...data, assignments: [], preferences: [] }
const dayOff = { personId: 'staff-off', branchId: 'branch-1', date: '2026-11-03' }
assert.equal(isWorkDayOff(blank.preferences, dayOff.personId, dayOff.date), false)
const marked = setWorkDayOff(blank, dayOff, true)
assert.equal(isWorkDayOff(marked.preferences, dayOff.personId, dayOff.date), true)
assert.equal(isWorkDayOff(marked.preferences, dayOff.personId, '2026-11-04'), false)
assert.equal(isWorkDayOff(marked.preferences, 'other-staff', dayOff.date), false)
assert.equal(setWorkDayOff(marked, { ...dayOff, branchId: 'branch-2' }, true).preferences.length, 1)
const offCandidate = { ...dayOff, id: 'off-shift', kind: 'employee', branchId: 'branch-2', start: '08:00', end: '12:00' }
assert.throws(() => upsertWorkAssignment(marked, offCandidate), /bỏ OFF/)
const unmarked = setWorkDayOff(marked, { ...dayOff, branchId: 'branch-2' }, false)
assert.equal(isWorkDayOff(unmarked.preferences, dayOff.personId, dayOff.date), false)
const scheduled = upsertWorkAssignment(unmarked, offCandidate)
assert.throws(() => setWorkDayOff(scheduled, dayOff, true), /đã có lịch/)
assert.equal(scheduled.assignments.length, 1)
assert.equal(blank.preferences.length, 0)
assert.throws(() => setWorkDayOff(blank, { ...dayOff, date: '2026-02-30' }, true), /hợp lệ/)
const legacyPreference = { ...dayOff, shiftId: 'morning' }
assert.deepEqual(setWorkDayOff({ ...marked, preferences: [...marked.preferences, legacyPreference] }, dayOff, false).preferences, [legacyPreference])
const stored = new Map()
globalThis.localStorage = { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) }
globalThis.window = { dispatchEvent() {} }
saveWorkSchedule(marked)
assert.equal(isWorkDayOff(loadWorkSchedule().preferences, dayOff.personId, dayOff.date), true)
saveWorkSchedule(unmarked)
assert.equal(isWorkDayOff(loadWorkSchedule().preferences, dayOff.personId, dayOff.date), false)
delete globalThis.localStorage
delete globalThis.window
for (const item of data.assignments) {
  assert.ok(workPeople.some(person => person.id === item.personId))
  assert.ok(data.branches.some(branch => branch.id === item.branchId))
  if (item.classId) assert.ok(workClasses.some(row => row.id === item.classId && row.branchId === item.branchId))
  if (item.shiftId) assert.ok(data.shifts.some(row => row.id === item.shiftId && row.branchId === item.branchId))
  validateAssignment(item, data.assignments)
}
for (const person of workPeople.filter(item => item.kind === 'employee')) {
  assert.equal(new Set(data.assignments.filter(item => item.personId === person.id).map(item => item.date)).size, 6)
  const existing = data.assignments.find(item => item.personId === person.id)
  const off = data.preferences.find(item => item.personId === person.id && item.shiftId === 'OFF')
  assert.throws(() => validateAssignment({ ...existing, id: 'seventh-day', date: off.date }, data.assignments), /OFF/)
  validateAssignment({ ...existing, start: '08:00', end: '12:00' }, data.assignments)
}
const lesson = data.assignments.find(item => item.kind === 'teacher')
assert.throws(() => validateAssignment({ ...lesson, id: 'duplicate', branchId: 'branch-2', classId: 'another-class' }, data.assignments), /Trùng giờ/)
assert.throws(() => validateAssignment({ ...lesson, id: 'duplicate', personId: 'teacher-004' }, data.assignments), /Trùng giờ/)
assert.throws(() => validateAssignment({ ...lesson, end: lesson.start }, []), /kết thúc/)
validateAssignment({ ...lesson, personId: 'teacher-004' }, data.assignments)
const simultaneousA = { id: 'live-1', personId: 'teacher-001', classId: 'live-class-4', classCode: 'L0004', kind: 'teacher', catalogSource: 'api', branchId: 'live-branch', date: '2026-11-03', start: '07:30', end: '08:30' }
const simultaneousB = { ...simultaneousA, id: 'live-2', personId: 'teacher-002', classId: 'live-class-2', classCode: 'L0002' }
validateAssignment(simultaneousB, [simultaneousA])
assert.equal(upsertWorkAssignment({ ...data, assignments: [simultaneousA], attendance: [] }, simultaneousB).assignments.length, 2)
assert.throws(() => validateAssignment({ ...simultaneousB, personId: simultaneousA.personId }, [simultaneousA]), /Giáo viên Nguyễn Văn A đã có lịch.*07:30–08:30/)
assert.throws(() => validateAssignment({ ...simultaneousB, classId: simultaneousA.classId }, [simultaneousA]), /Lớp L0004 đã có lịch/)
assert.throws(() => validateAssignment({ ...simultaneousB, personId: simultaneousA.personId, branchId: 'other-branch' }, [simultaneousA]), /Trùng giờ/)
validateAssignment({ ...simultaneousA, id: 'next-slot', start: '08:30', end: '09:30' }, [simultaneousA])
validateAssignment({ ...simultaneousA, id: 'later-slot', start: '09:00', end: '10:00' }, [{ ...simultaneousA, start: '7:30', end: '8:30' }])
assert.throws(() => validateAssignment({ ...simultaneousA, id: 'partial', start: '08:00', end: '09:00' }, [simultaneousA]), /Trùng giờ/)
assert.throws(() => validateAssignment({ ...simultaneousA, id: 'bad-time', start: '25:00', end: '26:00' }, []), /giờ hợp lệ/)
validateAssignment(simultaneousB, [{ ...data.assignments.find(row => row.personId === 'teacher-002'), start: '07:30', end: '08:30', date: simultaneousB.date }])
const legacyFixture = { ...data.assignments.find(row => row.personId === 'teacher-002'), start: '07:30', end: '08:30', date: simultaneousB.date }
delete legacyFixture.catalogSource
validateAssignment(simultaneousB, [legacyFixture])
// Regression: the hidden class-ielts-fd-01 booking in the user's screenshot
// was created/edited manually, so its ID need not start with lesson-.
const hiddenManualFixture = { id: 'c760fb7a-50e5-44e5-a027-2874d1af9344', personId: 'teacher-002', classId: 'class-ielts-fd-01', kind: 'teacher', branchId: 'branch-1', date: '2026-11-03', start: '07:30', end: '08:30', periods: 2 }
validateAssignment(simultaneousB, [simultaneousA, hiddenManualFixture])
const manualFixtureData = { ...data, assignments: [simultaneousA, hiddenManualFixture] }
const savedAlongsideFixtures = upsertWorkAssignment(manualFixtureData, simultaneousB)
assert.ok(savedAlongsideFixtures.assignments.some(row => row.id === simultaneousB.id))
assert.ok(savedAlongsideFixtures.assignments.some(row => row.id === hiddenManualFixture.id))
assert.throws(() => validateAssignment({ ...simultaneousB, id: 'real-duplicate' }, savedAlongsideFixtures.assignments), /Trùng giờ/)
// Explicit API provenance remains authoritative, even for a legacy-looking ID.
assert.throws(() => validateAssignment(simultaneousB, [{ ...hiddenManualFixture, catalogSource: 'api' }]), /Trùng giờ/)
assert.throws(() => validateAssignment(simultaneousB, [{ ...simultaneousA, id: 'real-other-class', personId: simultaneousB.personId }]), /Trùng giờ/)
validateAssignment({ ...simultaneousB, id: 'employee-2', kind: 'employee', personId: 'STF006', classId: undefined }, [{ ...simultaneousA, kind: 'employee', personId: 'STF005', classId: undefined }])
const item = { date: '2026-11-02', start: '07:30', end: '13:30' }
const end = Date.parse('2026-11-02T13:30:00+07:00')
assert.deepEqual(attendanceIssues(item, null, end - 1), [])
assert.deepEqual(attendanceIssues(item, null, end + 1), ['Quên chấm công'])
assert.deepEqual(attendanceIssues(item, { checkIn: '2026-11-02T07:45:00+07:00', checkOut: '2026-11-02T13:00:00+07:00' }, end + 1), ['Đi trễ', 'Về sớm'])
assert.deepEqual(attendanceIssues(item, { checkIn: '2026-11-02T07:30:00+07:00', checkOut: '2026-11-02T13:30:00+07:00' }, end + 1), [])
assert.ok(workAlerts(data, Date.parse('2026-11-09T00:00:00+07:00')).length > 0)
assert.equal(new Set(workAlerts(data).map(item => item.id)).size, workAlerts(data).length)
assert.equal(distanceMeters(data.branches[0], data.branches[0]), 0)
assert.ok(distanceMeters(data.branches[0], data.branches[1]) > 200)
assert.equal(data.shifts.filter(item => item.branchId === 'branch-1').length, 2)
assert.equal(attendanceMap(null), null)
assert.equal(attendanceMap({ latitude: null, longitude: null }), null)
assert.equal(attendanceMap({ latitude: 100, longitude: 106 }), null)
assert.equal(attendanceMap({ latitude: 10, longitude: Infinity }), null)
const recordedPosition = { latitude: 10.12345, longitude: 106.54321 }
assert.equal(new URL(attendanceMap(recordedPosition).url).searchParams.get('query'), '10.12345,106.54321')
assert.equal(attendanceMap({ latitude: 0, longitude: 0 }).coordinates, '0,0')
assert.equal(attendanceStatus(item, null, end - 1).label, 'Chưa chấm công')
assert.equal(attendanceStatus(item, { checkIn: '2026-11-02T07:30:00+07:00' }, end - 1).label, 'Đã check-in · Chưa check-out')
assert.equal(attendanceStatus(item, { checkIn: '2026-11-02T07:30:00+07:00', checkOut: '2026-11-02T13:30:00+07:00' }, end + 1).tone, 'success')
assert.ok(data.attendance.every(record => attendanceMap(record.checkInEvidence)))
const attended = data.assignments.find(row => row.id === data.attendance[0].assignmentId)
const updated = upsertWorkAssignment(data, { ...attended, periods: 3 })
assert.equal(updated.assignments.find(row => row.id === attended.id).periods, 3)
assert.deepEqual(updated.attendance, data.attendance)
const reassigned = upsertWorkAssignment(data, { ...attended, personId: 'teacher-004' })
assert.ok(!reassigned.attendance.some(record => record.assignmentId === attended.id))
const deleted = removeWorkAssignment(data, attended.id)
assert.ok(!deleted.assignments.some(row => row.id === attended.id))
assert.ok(!deleted.attendance.some(row => row.assignmentId === attended.id))
assert.equal(deleted.assignments.length, data.assignments.length - 1)
assert.ok(data.assignments.some(row => row.id === attended.id))
const layout = createWeekTimetableLayout([
  simultaneousB, simultaneousA,
  { ...simultaneousA, id: 'different-end', end: '09:00' },
  { ...simultaneousA, id: 'seconds-format', personId: 'teacher-003', start: '7:30:00', end: '8:30:00' },
  { ...simultaneousA, id: 'different-day', date: '2026-11-04' },
], '2026-11-02')
assert.equal(layout.days.length, 7)
assert.equal(layout.days[1].groups.length, 2)
assert.deepEqual(layout.days[1].groups[0].items.map(row => row.id), ['live-1', 'live-2', 'seconds-format'])
assert.equal(layout.days[1].groups[1].items[0].id, 'different-end')
assert.ok(layout.days.every(day => day.width === 180))
assert.equal(layout.days[2].groups[0].items.length, 1)
assert.equal(createWeekTimetableLayout([], '2026-11-02').minWidth, 1260)
assert.equal(layout.minWidth, 1260)
console.log('PASS: linked fixtures, Vietnam week boundaries, OFF enforcement, cross-branch/person/class conflicts, replacement, attendance thresholds, alert IDs and geofence distance. No live API writes.')
