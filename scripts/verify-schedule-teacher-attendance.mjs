import assert from 'node:assert/strict'
import { scheduleTeacherAttendance, teacherAttendanceTime } from '../src/services/scheduleTeacherAttendance.js'

const schedule = { id: 'lesson-1', teacherId: 'teacher-1', startAt: '2026-11-02T23:00:00Z' }
const record = (id, content, kind = 'staff-attendance') => ({ id, kind, content: { staffId: 'teacher-1', date: '2026-11-03', ...content } })
const records = [
  record('daily', { checkIn: '08:00', checkOut: '17:00' }),
  record('session', { scheduleId: 'lesson-1', checkIn: '09:00' }),
  record('other-teacher', { staffId: 'teacher-2' }),
  record('other-day', { date: '2026-11-02' }),
  record('other-session', { scheduleId: 'lesson-2' }),
  record('student', {}, 'attendance'),
]
assert.deepEqual(scheduleTeacherAttendance(records, schedule).map(row => row.id), ['daily', 'session'])
assert.deepEqual(scheduleTeacherAttendance(records, { ...schedule, teacherId: '' }), [])
assert.deepEqual(scheduleTeacherAttendance([], schedule), [])
assert.equal(teacherAttendanceTime('08:05'), '08:05')
assert.equal(teacherAttendanceTime('08:05:30'), '08:05:30')
assert.equal(teacherAttendanceTime('2026-11-03T02:05:00Z'), '03/11/2026 09:05:00')
for (const value of [null, undefined, '', '—', '25:00', 'invalid']) {
  assert.equal(teacherAttendanceTime(value), 'Chưa ghi nhận')
}
console.log('Schedule teacher attendance checks passed')
