import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyWorkSchedule, normalizeWorkSchedule, workSchedulePayload, normalizeWorkSearch } from './workScheduleContract.js'

test('uses server branch/revision and rejects missing or malformed roster data', () => {
  const data = { ...emptyWorkSchedule(), branchId: 'branch-a', revision: 3 }
  assert.equal(normalizeWorkSchedule(data), data)
  for (const patch of [{ branchId: '' }, { revision: -1 }, { revision: '3' }, { attendance: null }]) assert.throws(() => normalizeWorkSchedule({ ...data, ...patch }))
})

test('sends only writable roster fields and preserves the revision of the edited snapshot', () => {
  const data = { ...emptyWorkSchedule(), branchId: 'branch-a', revision: 7,
    assignments: [{ id: 'id', kind: 'employee', personId: 'person', branchId: 'branch-a', date: '2026-11-09', start: '07:30', end: '13:30', employeeType: 'sale', shiftId: 'morning', classId: '', periods: 2, personName: 'Display only', shiftName: 'Display only', expectedRevision: 7 }],
    attendance: [{ assignmentId: 'id', source: 'admin', checkIn: null, checkOut: null, note: 'Correction', displayOnly: true }],
    preferences: [{ personId: 'person', branchId: 'branch-a', date: '2026-11-10', shiftId: 'OFF', displayOnly: true }],
    audit: [{ actor: 'server' }],
  }
  const payload = workSchedulePayload(data)
  assert.equal(payload.revision, 7)
  assert.equal(payload.audit, undefined)
  assert.equal(payload.branchId, undefined)
  for (const field of ['classId', 'periods', 'personName', 'shiftName', 'expectedRevision']) assert.equal(payload.assignments[0][field], undefined)
  assert.equal(payload.attendance[0].checkIn, null)
  assert.equal(payload.attendance[0].displayOnly, undefined)
  assert.equal(payload.preferences[0].displayOnly, undefined)
})

test('search matches Vietnamese names with or without accents', () => {
  assert.equal(normalizeWorkSearch(' Nguyễn Thị Liên ').includes(normalizeWorkSearch('nguyen thi lien')), true)
  assert.equal(normalizeWorkSearch('Đặng Ánh'), 'dang anh')
})

test('saving a filtered view retains assignments outside the visible date/search scope', () => {
  const full = { ...emptyWorkSchedule(), revision: 4,
    assignments: [{ id: 'visible', kind: 'employee' }, { id: 'outside-week', kind: 'employee' }],
    view: { assignmentIds: ['visible'], fromDate: '2026-11-09', toDate: '2026-11-15', search: 'Lien' },
  }
  const payload = workSchedulePayload(full)
  assert.deepEqual(payload.assignments.map(item => item.id), ['visible', 'outside-week'])
  assert.equal(payload.view, undefined)
})
