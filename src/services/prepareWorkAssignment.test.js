import { test } from 'node:test'
import assert from 'node:assert/strict'
import { prepareWorkAssignment } from './prepareWorkAssignment.js'

function setup(overrides = {}) {
  const called = []
  const values = {
    schedule: { branchId: 'branch-a', revision: 4 },
    directory: { employees: [{ id: 'employee', branchId: 'branch-a' }] },
    configuration: { branchId: 'branch-a', revision: 4, shifts: [{ id: 'api-shift', start: '08:15', end: '12:45' }] },
    ...overrides,
  }
  const load = key => async () => { called.push(key); if (values[key] instanceof Error) throw values[key]; return values[key] }
  return { called, options: { branchId: 'branch-a', date: '2026-11-10', loadSchedule: async () => { const schedule = await load('schedule')(); return schedule ? { schedule, configuration: values.configuration } : undefined }, loadEmployees: load('directory') } }
}

test('click preparation uses one shared schedule/configuration response and the employee source and uses the actual configured shift', async () => {
  const { called, options } = setup()
  assert.deepEqual(await prepareWorkAssignment(options), { kind: 'employee', personId: '', branchId: 'branch-a', date: '2026-11-10', shiftId: 'api-shift', start: '08:15', end: '12:45' })
  assert.deepEqual(called, ['schedule', 'directory'])
})

test('API failure stays visible and does not open a form with fabricated roster data', async () => {
  const error = new Error('API roster unavailable')
  const { called, options } = setup({ schedule: error })
  await assert.rejects(prepareWorkAssignment(options), cause => cause === error)
  assert.deepEqual(called, ['schedule', 'directory'])
})

test('does not open a form from a canceled or superseded API request', async () => {
  const { options } = setup({ schedule: undefined })
  await assert.rejects(prepareWorkAssignment(options), /thay đổi/)
})

test('opens an unsaved form with API employees and shifts when the server has no roster support', async () => {
  const { options } = setup()
  options.loadSchedule = async () => ({ schedule: null, configuration: { branchId: 'branch-a', revision: 4, shifts: [{ id: 'api-shift', start: '08:15', end: '12:45' }] } })
  const item = await prepareWorkAssignment(options)
  assert.equal(item.shiftId, 'api-shift')
  assert.equal(item.start, '08:15')
  assert.equal(item.end, '12:45')
  assert.equal(item.personId, '')
})

test('rejects a changed branch and inconsistent API revisions', async () => {
  const wrongBranch = setup({ schedule: { branchId: 'branch-b', revision: 4 } })
  await assert.rejects(prepareWorkAssignment(wrongBranch.options), /Cơ sở đã thay đổi/)
  const stale = setup({ schedule: { branchId: 'branch-a', revision: 3 } })
  await assert.rejects(prepareWorkAssignment(stale.options), /phiên bản/)
})

test('requires real branch employees and shifts before opening the assignment form', async () => {
  for (const directory of [{ employees: [] }, { employees: [{ id: 'other', branchId: 'branch-b' }] }]) await assert.rejects(prepareWorkAssignment(setup({ directory }).options), /nhân viên/)
  await assert.rejects(prepareWorkAssignment(setup({ configuration: { branchId: 'branch-a', revision: 4, shifts: [] } }).options), /chưa có ca làm/)
})

test('does not call an API with a missing branch', async () => {
  const { called, options } = setup()
  await assert.rejects(prepareWorkAssignment({ ...options, branchId: '' }), /chọn cơ sở/)
  assert.deepEqual(called, [])
})
