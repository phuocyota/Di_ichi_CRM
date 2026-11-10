import { test } from 'node:test'
import assert from 'node:assert/strict'
import { affectsResources, startUpdates } from './resourceUpdates.js'

function setup() {
  const handlers = {}, callbacks = [], tasks = new Map(), intervals = new Map()
  let id = 0
  const timers = {
    setTimeout(fn, ms) { tasks.set(++id, { fn, ms }); return id },
    clearTimeout(id) { tasks.delete(id) },
    setInterval(fn, ms) { intervals.set(++id, { fn, ms }); return id },
    clearInterval(id) { intervals.delete(id) },
  }
  const client = {
    connected: false,
    on(name, fn) { handlers[name] = fn },
    timeout() { return this },
    emit(name, data, callback) { assert.equal(name, 'updates:watch'); callbacks.push(callback) },
    connect() { this.connected = true; handlers.connect() },
    disconnect() { this.connected = false; handlers.disconnect() },
  }
  const target = new EventTarget(), document = new EventTarget(), received = []
  document.hidden = false
  target.addEventListener('updates', event => received.push(event.detail))
  const stop = startUpdates({ client, target, document, timers, eventName: 'updates' })
  const advance = ms => {
    const due = [...tasks].filter(([, task]) => task.ms <= ms)
    for (const [id, task] of due) { tasks.delete(id); task.fn() }
  }
  return { client, handlers, callbacks, tasks, intervals, target, received, stop, advance }
}

test('coalesces a burst, rejects malformed events, and resyncs after reconnect', () => {
  const s = setup()
  s.client.connect()
  s.callbacks.shift()(null, { ok: true, ready: true })
  s.advance(200)
  assert.equal(s.received[0].resync, true)
  s.handlers['resources:changed']({ resource: 'student' })
  s.handlers['resources:changed']({ resource: 'student' })
  s.handlers['resources:changed']({ resource: 'notification' })
  s.handlers['resources:changed']({ resource: '../private' })
  s.advance(200)
  assert.deepEqual(s.received[1].resources, ['student', 'notification'])
  s.client.disconnect(); s.client.connect()
  s.callbacks.shift()(null, { data: { ok: true, ready: true } })
  s.advance(200)
  assert.equal(s.received[2].resync, true)
  s.stop()
})

test('retries a timed-out subscription and ignores acknowledgements from the old connection', () => {
  const s = setup()
  s.client.connect()
  s.callbacks.shift()(new Error('timeout'))
  s.advance(3000)
  const old = s.callbacks.shift()
  s.client.disconnect(); s.client.connect()
  old(null, { ok: true, ready: true })
  s.advance(200)
  assert.equal(s.received.length, 0)
  s.callbacks.shift()(null, { ok: true, ready: true })
  s.advance(200)
  assert.equal(s.received.length, 1)
  s.stop()
  assert.equal(s.tasks.size, 0)
  assert.equal(s.intervals.size, 0)
})

test('recovers the database listener and refreshes while the transport is unavailable', () => {
  const s = setup()
  s.client.connect(); s.callbacks.shift()(null, { ok: true, ready: false }); s.advance(200)
  for (const timer of s.intervals.values()) timer.fn()
  s.advance(200)
  assert.equal(s.received.length, 2)
  s.handlers['updates:status']({ ready: true }); s.advance(200)
  assert.equal(s.received.length, 3)
  s.stop()
  s.target.dispatchEvent(new Event('focus')); s.advance(30000)
  assert.equal(s.received.length, 3)
})

test('refreshes dependent screens for composite writes without refreshing unrelated resources', () => {
  assert.equal(affectsResources({ resources: ['system-settings'] }, ['staff']), true)
  assert.equal(affectsResources({ resources: ['workspace'] }, ['schedule']), true)
  assert.equal(affectsResources({ resources: ['portal'] }, ['score']), true)
  assert.equal(affectsResources({ resources: ['student'] }, ['course']), false)
  assert.equal(affectsResources({ resync: true }, ['course']), true)
})
