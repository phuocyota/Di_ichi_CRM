import assert from 'node:assert/strict'
import test from 'node:test'
import { dailyWorkAttendance, workDurationLabel } from './workAttendanceReport.js'

const assignment = (id, extra = {}) => ({ id, date: '2026-11-05', personId: 'employee', start: '08:00', ...extra })
const record = (id, start, end) => ({ assignmentId: id, checkIn: `2026-11-05T${start}:00+07:00`, ...(end ? { checkOut: `2026-11-05T${end}:00+07:00` } : {}) })

test('daily total adds separate shifts and merges overlapping recorded time', () => {
  const [day] = dailyWorkAttendance(['a', 'b', 'c'].map(id => assignment(id)), [record('a', '07:30', '11:30'), record('b', '10:00', '12:00'), record('c', '14:00', '16:30')], [])
  assert.equal(day.minutes, 420)
  assert.equal(day.completed, 3)
  assert.equal(day.incomplete, 0)
  assert.equal(workDurationLabel(day.minutes), '7 giờ')
})

test('incomplete and reversed timestamps do not contribute hours', () => {
  const [day] = dailyWorkAttendance(['a', 'b', 'c'].map(id => assignment(id)), [record('a', '08:00'), record('b', '12:00', '10:00')], [])
  assert.equal(day.minutes, 0)
  assert.equal(day.completed, 0)
  assert.equal(day.incomplete, 3)
})

test('keeps employees and dates separate and counts only time inside the Vietnam calendar day', () => {
  const rows = dailyWorkAttendance([assignment('a'), assignment('b', { personId: 'other' }), assignment('c', { date: '2026-11-06' })], [record('a', '08:00', '09:30'), record('b', '10:00', '12:00'), { assignmentId: 'c', checkIn: '2026-11-05T23:00:00+07:00', checkOut: '2026-11-06T02:00:00+07:00' }], [])
  assert.equal(rows.length, 3)
  assert.equal(rows.find(row => row.personId === 'employee' && row.date === '2026-11-05').minutes, 90)
  assert.equal(rows.find(row => row.personId === 'other').minutes, 120)
  assert.equal(rows.find(row => row.date === '2026-11-06').minutes, 120)
  assert.equal(workDurationLabel(90), '1 giờ 30 phút')
  assert.deepEqual(dailyWorkAttendance([], [], []), [])
})
