import assert from 'node:assert/strict'
import { createServer } from 'vite'

globalThis.localStorage = { getItem: () => null }
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: client } = await server.ssrLoadModule('/src/services/apiClient.js')
  const { loadWorkScheduleCatalog, classMatchesWorkBranch } = await server.ssrLoadModule('/src/services/workScheduleCatalog.js')
  const calls = []
  const resources = {
    course: [{ id: 'api-course-1', name: 'Khóa API 1' }, { id: 'api-course-2', name: 'Khóa API 2' }],
    class: [
      { id: 'api-class-1', code: 'API01', courseId: 'api-course-1', startDate: '2026-11-01T00:00:00Z', endDate: null },
      { id: 'api-class-2', courseId: 'api-course-1', branchId: 'api-branch-2' },
      { id: 'unassigned', courseId: 'api-course-2' },
      { id: 'deleted', courseId: 'api-course-1', deletedAt: '2026-11-01' },
      { id: 'orphan', courseId: 'missing-course' },
      { id: 'restricted', courseId: 'api-course-1', branchId: 'inaccessible-branch' },
    ],
    branch: [{ id: 'api-branch-1', name: 'Cơ sở API 1' }, { id: 'api-branch-2', name: 'Cơ sở API 2' }],
    room: [{ id: 'api-room-1', branchId: 'api-branch-1' }],
    'class-room': [{ id: 'link-1', classId: 'api-class-1', roomId: 'api-room-1' }],
  }
  const controller = new AbortController()
  client.defaults.adapter = async config => {
    calls.push(config)
    assert.equal(config.method, 'get')
    assert.equal(config.signal, controller.signal)
    const resource = config.url.slice(1)
    const page = Number(config.params.page || 1)
    const rows = resources[resource]
    return { status: 200, statusText: 'OK', headers: {}, config, data: { success: true, data: { data: rows.slice((page - 1) * 2, page * 2), total: rows.length, page } } }
  }
  const result = await loadWorkScheduleCatalog(controller.signal)
  assert.equal(result.courses.length, 2)
  assert.equal(result.classes.length, 4)
  assert.ok(calls.some(call => call.url === '/class' && call.params.page === 3))
  const first = result.classes.find(item => item.id === 'api-class-1')
  assert.equal(first.startDate, '2026-11-01')
  assert.equal(first.endDate, '')
  assert.ok(classMatchesWorkBranch(first, 'api-branch-1'))
  assert.ok(!classMatchesWorkBranch(first, 'api-branch-2'))
  assert.ok(classMatchesWorkBranch(result.classes.find(item => item.id === 'unassigned'), 'api-branch-2'))
  assert.ok(!classMatchesWorkBranch(result.classes.find(item => item.id === 'restricted'), 'api-branch-1'))
  assert.ok(!classMatchesWorkBranch(first, ''))
  client.defaults.adapter = async config => ({ status: 200, statusText: 'OK', headers: {}, config, data: { success: true, data: [] } })
  assert.deepEqual(await loadWorkScheduleCatalog(), { courses: [], classes: [], branches: [] })
  client.defaults.adapter = async () => { throw new Error('API temporarily unavailable') }
  await assert.rejects(loadWorkScheduleCatalog(), /Không thể kết nối đến máy chủ/)
  client.defaults.adapter = async config => ({ status: 200, statusText: 'OK', headers: {}, config, data: { unexpected: true } })
  await assert.rejects(loadWorkScheduleCatalog(), /không đúng định dạng/)
  controller.abort()
  await assert.rejects(loadWorkScheduleCatalog(controller.signal))
  console.log('PASS: GET-only catalog loading, pagination, linked branches/rooms/classes/courses, deleted rows, unassigned/restricted classes, date normalization, empty API, API errors, invalid responses and cancellation. No live API writes.')
} finally {
  await server.close()
}
