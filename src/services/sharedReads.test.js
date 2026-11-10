import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createSharedReads } from './sharedReads.js'
import { prepareWorkAssignment } from './prepareWorkAssignment.js'

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

test('real HTTP: concurrent consumers and initial resync cause one GET; real invalidation fetches again', async () => {
  let calls = 0, time = 0
  const server = createServer((req, res) => { calls++; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ revision: calls })) })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const url = `http://127.0.0.1:${server.address().port}/work-shifts`
    const cache = createSharedReads({ now: () => time })
    const load = signal => fetch(url, { signal }).then(response => response.json())
    const values = await Promise.all([cache.read('branch', load), cache.read('branch', load), cache.read('branch', load)])
    assert.equal(calls, 1)
    assert.ok(values.every(value => value.revision === 1))
    time = 200
    assert.equal((await cache.read('branch', load)).revision, 1)
    assert.equal(calls, 1)
    assert.equal((await cache.read('branch', load, { force: true })).revision, 2)
    time = 1000
    assert.equal((await cache.read('branch', load)).revision, 3)
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
})

test('aborting one consumer does not cancel the shared request for another', async () => {
  const cache = createSharedReads(), pending = deferred(), first = new AbortController()
  let upstream
  const load = signal => { upstream = signal; return pending.promise }
  const a = cache.read('key', load, { signal: first.signal })
  const b = cache.read('key', load)
  await Promise.resolve()
  first.abort()
  await assert.rejects(a, { name: 'AbortError' })
  assert.equal(upstream.aborted, false)
  pending.resolve('result')
  assert.equal(await b, 'result')
})

test('StrictMode-style immediate cleanup and re-subscription reuse the same GET', async () => {
  const cache = createSharedReads(), pending = deferred(), first = new AbortController()
  let calls = 0, upstream
  const load = signal => { calls++; upstream = signal; return pending.promise }
  const a = cache.read('key', load, { signal: first.signal })
  await Promise.resolve()
  first.abort()
  const b = cache.read('key', load)
  await assert.rejects(a, { name: 'AbortError' })
  await pause(5)
  assert.equal(upstream.aborted, false)
  pending.resolve('result')
  assert.equal(await b, 'result')
  assert.equal(calls, 1)
})

test('aborts unused upstream work when all consumers have left', async () => {
  const cache = createSharedReads(), controller = new AbortController()
  let upstream
  const result = cache.read('key', signal => {
    upstream = signal
    return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
  }, { signal: controller.signal })
  await Promise.resolve()
  controller.abort()
  await assert.rejects(result, { name: 'AbortError' })
  await pause(5)
  assert.equal(upstream.aborted, true)
})

test('failed requests are not cached and can be retried immediately', async () => {
  const cache = createSharedReads()
  let calls = 0
  const load = () => { calls++; if (calls === 1) throw new Error('Unavailable'); return 'ready' }
  await assert.rejects(cache.read('key', load), /Unavailable/)
  assert.equal(await cache.read('key', load), 'ready')
  assert.equal(calls, 2)
})

test('clearing a session or a branch does not reuse its previous response', async () => {
  const cache = createSharedReads()
  let calls = 0
  const load = () => ++calls
  await cache.read('a:week-one', load); await cache.read('a:week-two', load); await cache.read('b:week-one', load)
  cache.clear('a:')
  assert.equal(await cache.read('b:week-one', load), 3)
  assert.equal(await cache.read('a:week-one', load), 4)
  cache.clear()
  assert.equal(await cache.read('b:week-one', load), 5)
})

test('opening the form with ready data does not issue another schedule or directory GET', async () => {
  const cache = createSharedReads()
  let scheduleCalls = 0, directoryCalls = 0
  const bundle = { schedule: { branchId: 'a', revision: 4 }, configuration: { branchId: 'a', revision: 4, shifts: [{ id: 'morning', start: '08:00', end: '12:00' }] } }
  const directory = { employees: [{ branchId: 'a', id: 'employee' }] }
  const loadSchedule = () => cache.read('schedule', () => { scheduleCalls++; return bundle })
  const loadEmployees = () => cache.read('directory', () => { directoryCalls++; return directory })
  await Promise.all([loadSchedule(), loadEmployees()])
  const item = await prepareWorkAssignment({ branchId: 'a', date: '2026-11-10', loadSchedule, loadEmployees })
  assert.equal(item.shiftId, 'morning')
  assert.equal(scheduleCalls, 1)
  assert.equal(directoryCalls, 1)
})
