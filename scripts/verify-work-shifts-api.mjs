import assert from 'node:assert/strict'
import { createServer } from 'vite'

globalThis.localStorage = { getItem: () => null }
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const { default: client } = await server.ssrLoadModule('/src/services/apiClient.js')
  const { getWorkShifts, saveWorkShifts } = await server.ssrLoadModule('/src/services/workShiftsApi.js')
  const branchId = 'branch-a'
  const data = { branchId, revision: 1, saved: true, shifts: [
    { id: branchId + '-morning', name: 'Ca sáng', start: '08:00', end: '12:00' },
    { id: branchId + '-evening', name: 'Ca tối', start: '17:00', end: '21:00' },
    { id: 'extra', name: 'Ca chiều', start: '13:00', end: '16:00' },
  ] }
  const calls = []
  client.defaults.adapter = async config => {
    calls.push({ method: config.method, url: config.url, body: config.data && JSON.parse(config.data) })
    return { data: { success: true, data }, status: 200, statusText: 'OK', headers: {}, config }
  }
  const loaded = await getWorkShifts(branchId)
  assert.equal(loaded.shifts.length, 3)
  assert.equal(loaded.shifts[2].branchId, branchId)
  assert.equal(loaded.shifts[2].source, 'api')
  await saveWorkShifts(branchId, loaded.revision, loaded.shifts)
  assert.deepEqual(calls, [
    { method: 'get', url: '/work-shifts/branches/branch-a', body: undefined },
    { method: 'put', url: '/work-shifts/branches/branch-a', body: { revision: 1, shifts: data.shifts } },
  ])
  data.branchId = 'wrong-branch'
  await assert.rejects(getWorkShifts(branchId), /không hợp lệ/)
  data.branchId = branchId
  data.shifts[0].start = '25:00'
  await assert.rejects(getWorkShifts(branchId), /không hợp lệ/)
  client.defaults.adapter = async () => { throw new Error('Offline') }
  await assert.rejects(getWorkShifts(branchId))
  await assert.rejects(saveWorkShifts(branchId, 1, []))
  console.log('PASS: work-shift API mapping, GET/PUT payloads, branch validation, invalid times and errors without local fallback.')
} finally { await server.close() }
