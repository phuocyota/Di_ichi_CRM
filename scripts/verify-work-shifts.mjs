import assert from 'node:assert/strict'
import { configureWorkShifts, fixedWorkShifts, configuredWorkShifts } from '../src/services/workShifts.js'
import { loadWorkSchedule, saveWorkSchedule } from '../src/services/workSchedule.js'

const branches = [{ id: 'branch-a' }, { id: 'branch-b' }]
const defaults = fixedWorkShifts([], 'branch-a')
assert.deepEqual(defaults.map(shift => shift.name), ['Ca sáng', 'Ca tối'])
const otherBranch = fixedWorkShifts([], 'branch-b')
const assignment = { id: 'assignment', shiftId: defaults[0].id, start: '07:30', end: '13:30' }
const data = { version: 1, branches, shifts: [...defaults, ...otherBranch], assignments: [assignment], attendance: [], preferences: [], audit: [] }
const values = defaults.map((shift, index) => ({ ...shift, start: index ? '15:00' : '08:00', end: index ? '21:00' : '12:00' }))
const updated = configureWorkShifts(data, 'branch-a', values, branches)
assert.deepEqual(fixedWorkShifts(updated.shifts, 'branch-a').map(shift => [shift.start, shift.end]), [['08:00', '12:00'], ['15:00', '21:00']])
assert.deepEqual(fixedWorkShifts(updated.shifts, 'branch-b'), otherBranch)
assert.deepEqual(updated.assignments, [assignment])
assert.throws(() => configureWorkShifts(data, 'missing', values, branches), /cơ sở hợp lệ/)
assert.throws(() => configureWorkShifts(data, 'branch-a', values.slice(0, 1), branches), /đủ Ca sáng và Ca tối/)
assert.throws(() => configureWorkShifts(data, 'branch-a', [values[0], values[0]], branches), /đủ Ca sáng và Ca tối/)
for (const start of ['25:00', '13:00', '12:00', '']) {
  assert.throws(() => configureWorkShifts(data, 'branch-a', [{ ...values[0], start }, values[1]], branches), /Ca sáng: giờ kết thúc/)
}
// Recover the two fixed slots if the old CRUD UI deleted a default.
const deleted = defaults.map(shift => ({ ...shift, deletedAt: '2026-11-05' }))
assert.deepEqual(fixedWorkShifts(deleted, 'branch-a'), defaults)
const recovered = configureWorkShifts({ ...data, shifts: deleted }, 'branch-a', values, branches)
assert.ok(recovered.shifts.every(shift => !shift.deletedAt))
assert.equal(configureWorkShifts(updated, 'branch-a', values, branches).shifts.length, 4)
let stored
const extra = { id: 'extra-a', branchId: 'branch-a', name: 'Ca chiều', start: '13:00', end: '17:00' }
const withExtra = configureWorkShifts(updated, 'branch-a', [...values, extra], branches)
assert.equal(configuredWorkShifts(withExtra.shifts, 'branch-a').length, 3)
assert.equal(configuredWorkShifts(withExtra.shifts, 'branch-b').length, 2)
assert.deepEqual(withExtra.assignments, updated.assignments)
assert.throws(() => configureWorkShifts(updated, 'branch-a', [...values, { ...extra, name: ' ca sáng ' }], branches), /không được trùng/)
assert.throws(() => configureWorkShifts(updated, 'branch-a', [...values, { ...extra, name: ' ' }], branches), /Nhập tên/)
assert.throws(() => configureWorkShifts(updated, 'branch-a', [...values, { ...extra, start: '18:00' }], branches), /giờ kết thúc/)
assert.throws(() => configureWorkShifts(updated, 'branch-a', [...values, { ...extra, id: otherBranch[0].id }], branches), /cơ sở khác/)
globalThis.localStorage = { setItem: (_, value) => { stored = value }, getItem: () => stored }
globalThis.window = { dispatchEvent() {} }
saveWorkSchedule(updated)
assert.deepEqual(loadWorkSchedule(), updated)
saveWorkSchedule(withExtra)
assert.deepEqual(configuredWorkShifts(loadWorkSchedule().shifts, 'branch-a').at(-1), { ...extra, source: 'custom' })
console.log('PASS: morning/evening configuration, validation, branch isolation, legacy recovery, existing assignment preservation and storage reload.')
