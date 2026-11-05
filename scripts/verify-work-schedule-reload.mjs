import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// Run the actual hook with a small hook lifecycle harness and controlled API.
// No browser, network calls or extra test dependencies are required.
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const react = moduleUrl(`
  export const useState = value => globalThis.workReloadHarness.state(value)
  export const useRef = value => globalThis.workReloadHarness.ref(value)
  export const useCallback = (fn, deps) => globalThis.workReloadHarness.memo(fn, deps)
  export const useEffect = (fn, deps) => globalThis.workReloadHarness.effect(fn, deps)
`)
function harness() {
  const slots = [], effects = [], cleanups = []
  let cursor = 0
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]))
  const h = {
    requests: [], updates: null,
    state(value) {
      const i = cursor++
      if (!(i in slots)) slots[i] = typeof value === 'function' ? value() : value
      return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next }]
    },
    ref(value) { const i = cursor++; return slots[i] ||= { current: value } },
    memo(fn, deps) {
      const i = cursor++
      if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { value: fn, deps }
      return slots[i].value
    },
    effect(fn, deps) {
      const i = cursor++
      if (!slots[i] || !same(slots[i].deps, deps)) {
        slots[i] = { deps }
        effects.push(() => { cleanups[i]?.(); cleanups[i] = fn() })
      }
    },
    load(signal) {
      return new Promise((resolve, reject) => h.requests.push({ signal, resolve, reject }))
    },
    render(hook, ...args) {
      globalThis.workReloadHarness = h
      cursor = 0
      const result = hook(...args)
      while (effects.length) effects.shift()()
      return result
    },
    unmount() { cleanups.forEach(cleanup => cleanup?.()) },
  }
  return h
}
async function loadHook(path, loaderName) {
  let source = await readFile(new URL(path, import.meta.url), 'utf8')
  source = source.replace("from 'react'", `from '${react}'`)
    .replace(/import \{ getWorkShifts, saveWorkShifts \} from '[^']+'/, 'const getWorkShifts = (branchId, signal) => globalThis.workReloadHarness.load(signal); const saveWorkShifts = (branchId, revision, values) => globalThis.workReloadHarness.write(branchId, revision, values)')
    .replace(new RegExp(`import \\{ ${loaderName} \\} from '[^']+'`), `const ${loaderName} = signal => globalThis.workReloadHarness.load(signal)`)
    .replace(/import \{ useResourceUpdates \} from '[^']+'/, 'const useResourceUpdates = (callback, resources, enabled) => { globalThis.workReloadHarness.updates = { callback, resources, enabled } }')
  return (await import(moduleUrl(source))).default
}
const useEmployees = await loadHook('../src/components/WorkSchedule/useWorkScheduleEmployees.js', 'loadWorkScheduleEmployees')
const h = harness()
let result = h.render(useEmployees)
assert.equal(result.loading, true)
assert.equal(h.requests.length, 1)
const initial = { employees: [{ id: 'staff' }], unclassified: [], branches: [{ id: 'branch' }] }
h.requests[0].resolve(initial)
await Promise.resolve()
result = h.render(useEmployees)
assert.equal(result.loading, false)
assert.deepEqual(result.branches, initial.branches)

const refresh = h.updates.callback()
result = h.render(useEmployees)
assert.equal(result.loading, false, 'Background refresh must keep the form mounted')
assert.deepEqual(result.branches, initial.branches)
await h.updates.callback()
assert.equal(h.requests.length, 2, 'Simultaneous refresh triggers must share the active request')
assert.equal(h.requests[1].signal.aborted, false)
h.requests[1].reject(new Error('Offline'))
await refresh
result = h.render(useEmployees)
assert.equal(result.error, '', 'Background failure must not replace the form')
assert.equal(result.refreshError, 'Offline')
assert.equal(result.loading, false)
assert.deepEqual(result.branches, initial.branches)
const retry = result.reload()
h.requests[2].resolve(initial)
await retry
result = h.render(useEmployees)
assert.equal(result.refreshError, '')
h.updates.callback()
h.unmount()
assert.equal(h.requests[3].signal.aborted, true)
h.requests[3].resolve({ ...initial, branches: [] })
await Promise.resolve()

const failed = harness()
failed.render(useEmployees)
failed.requests[0].reject(new Error('Initial failure'))
await Promise.resolve()
result = failed.render(useEmployees)
assert.equal(result.error, 'Initial failure')
assert.equal(result.loading, false)
failed.unmount()

const useCatalog = await loadHook('../src/components/WorkSchedule/useWorkScheduleCatalog.js', 'loadWorkScheduleCatalog')
const inactive = harness()
inactive.render(useCatalog, true, { load: false })
assert.equal(inactive.requests.length, 0, 'Unused teacher catalog must not issue API requests')
assert.equal(inactive.updates.enabled, false)
inactive.unmount()
const useShifts = await loadHook('../src/components/WorkSchedule/useWorkShifts.js', 'unused')
const shiftsHarness = harness()
const snapshot = { branchId: 'a', revision: 1, saved: true, shifts: [{ id: 'a-morning' }, { id: 'a-evening' }] }
result = shiftsHarness.render(useShifts, 'a')
assert.equal(result.loading, true)
shiftsHarness.requests[0].resolve(snapshot)
await Promise.resolve()
result = shiftsHarness.render(useShifts, 'a')
assert.equal(result.snapshot.revision, 1)
const shiftRefresh = shiftsHarness.updates.callback()
result = shiftsHarness.render(useShifts, 'a')
assert.equal(result.loading, false)
shiftsHarness.requests[1].reject(new Error('Offline'))
await shiftRefresh
result = shiftsHarness.render(useShifts, 'a')
assert.equal(result.error, '')
assert.equal(result.refreshError, 'Offline')
let finishSave
shiftsHarness.write = (branchId, revision, values) => {
  assert.equal(branchId, 'a'); assert.equal(revision, 1); assert.equal(values, snapshot.shifts)
  return new Promise(resolve => { finishSave = resolve })
}
const saved = result.save(snapshot.shifts, 1)
result = shiftsHarness.render(useShifts, 'a')
assert.equal(result.saving, true)
assert.equal(shiftsHarness.updates.enabled, false)
await assert.rejects(result.save(snapshot.shifts, 1), /Đang lưu/)
finishSave({ ...snapshot, revision: 2 })
await saved
result = shiftsHarness.render(useShifts, 'a')
assert.equal(result.snapshot.revision, 2)
assert.equal(result.saving, false)
assert.equal(result.refreshError, '')
result = shiftsHarness.render(useShifts, 'b')
assert.equal(result.snapshot, null, 'Switching branches must hide the previous snapshot')
assert.equal(result.loading, true)
shiftsHarness.requests[2].reject(new Error('API not deployed'))
await Promise.resolve()
result = shiftsHarness.render(useShifts, 'b')
assert.equal(result.error, 'API not deployed')
assert.equal(result.snapshot, null, 'Failed API must not fall back to local shifts')
shiftsHarness.unmount()
delete globalThis.workReloadHarness
console.log('PASS: initial load/error, silent refresh, concurrent triggers, retained data, async shift save, duplicate save prevention, branch switching, API failure without local fallback, cancellation and unused catalog disabled.')
