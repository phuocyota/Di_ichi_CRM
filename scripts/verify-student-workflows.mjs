import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

// Exercise real client serialization with an isolated Axios adapter. No live API writes.
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  globalThis.localStorage = { getItem: () => null }
  const { default: client } = await server.ssrLoadModule('/src/services/apiClient.js')
  const workflow = await server.ssrLoadModule('/src/services/studentWorkflow.js')
  const exportService = await server.ssrLoadModule('/src/services/studentExport.js')
  const student = { id: 'student-1', name: 'Nguyễn An', code: 'HV1', branchId: 'branch-1', statusValue: 'active', note: 'Giữ ghi chú', enrollments: [{ id: 'enrollment-1', classId: 'class-1', enrolledAt: '2020-01-01', isCurrent: true, status: 'active', class: { id: 'class-1', name: 'Lớp 1', courseId: 'course-1', endDate: '2098-12-31' } }] }
  const calls = []
  const reply = (config, data) => ({ config, data: { success: true, data }, status: 200, statusText: 'OK', headers: {} })
  client.defaults.adapter = async (config) => { calls.push(config); return reply(config, { student: { id: student.id } }) }
  const statusValues = { effectiveDate: '2020-01-02', reason: '  Lý do  ' }
  for (const [type, route] of [['reserve', 'reserve'], ['stop', 'stop']]) {
    await workflow.performStudentOperation(type, student, statusValues)
    assert.equal(calls.at(-1).url, `/student/student-1/${route}`)
    assert.deepEqual(JSON.parse(calls.at(-1).data), { effectiveDate: '2020-01-02', reason: 'Lý do' })
  }
  await workflow.performStudentOperation('transfer', student, { ...statusValues, enrollmentId: 'enrollment-1', targetClassId: 'class-2' })
  assert.equal(calls.at(-1).url, '/student/student-1/transfer-class')
  assert.deepEqual(JSON.parse(calls.at(-1).data), { reason: 'Lý do', effectiveDate: '2020-01-02', enrollmentId: 'enrollment-1', targetClassId: 'class-2' })
  await workflow.performStudentOperation('extend', student, { reason: 'Gia hạn', enrollmentId: 'enrollment-1', expiresAt: '2099-01-01' })
  assert.equal(calls.at(-1).url, '/student/student-1/extend-enrollment')
  assert.deepEqual(JSON.parse(calls.at(-1).data), { reason: 'Gia hạn', enrollmentId: 'enrollment-1', expiresAt: '2099-01-01' })
  const countBeforeInvalid = calls.length
  for (const [type, record, values] of [
    ['transfer', student, { ...statusValues, enrollmentId: 'enrollment-1', targetClassId: 'class-1' }],
    ['transfer', student, { ...statusValues, enrollmentId: 'wrong', targetClassId: 'class-2' }],
    ['reserve', { ...student, statusValue: 'reserved' }, statusValues],
    ['reserve', student, { ...statusValues, effectiveDate: '2999-01-01' }],
    ['reserve', student, { ...statusValues, effectiveDate: '2020-02-30' }],
    ['stop', student, { ...statusValues, reason: '   ' }],
    ['extend', student, { enrollmentId: 'enrollment-1', expiresAt: '2098-01-01', reason: 'Shorter' }],
  ]) assert.throws(() => workflow.performStudentOperation(type, record, values))
  assert.equal(calls.length, countBeforeInvalid)
  client.defaults.adapter = async () => { throw new Error('API unavailable') }
  await assert.rejects(workflow.performStudentOperation('stop', student, statusValues))

  const file = new File(['test'], 'hoc-vien.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const importResult = { summary: { totalRows: 2, created: 1, skipped: 1 }, created: [{ rowNumber: 1, sheetName: 'Sheet 1', studentId: 'new', studentCode: 'HV2', studentName: 'Học viên mới' }], skipped: [{ rowNumber: 2, sheetName: 'Sheet 1', studentCode: 'HV1', reason: 'exists' }] }
  client.defaults.adapter = async (config) => { calls.push(config); return reply(config, importResult) }
  assert.deepEqual(await workflow.importStudents(file), importResult)
  assert.equal(calls.at(-1).url, '/student/import')
  assert.equal(calls.at(-1).data.get('file').name, 'hoc-vien.xlsx')
  await assert.rejects(workflow.importStudents(new File(['x'], 'wrong.csv')))
  await assert.rejects(workflow.importStudents(new File([], 'empty.xlsx')))
  await assert.rejects(workflow.importStudents({ name: 'large.xlsx', size: 10 * 1024 * 1024 + 1 }))

  const values = { code: 'HV1', name: student.name, branchId: student.branchId, gender: 'Nam', phone: '0900000000', email: 'test@example.test', enrollmentDate: '2020-01-01', reason: student.note, parent: '', parentPhone: '', assignedSaleUserId: '' }
  client.defaults.adapter = async (config) => { calls.push(config); return reply(config, { id: student.id }) }
  await workflow.saveStudent('edit', values, student, { canAssignSale: true, classes: [] })
  const savedPayload = JSON.parse(calls.at(-1).data)
  assert.equal(calls.at(-1).method, 'patch')
  assert.equal(savedPayload.note, student.note)
  assert.ok(!('status' in savedPayload))
  assert.ok(!('assignedSaleUserId' in savedPayload))
  client.defaults.adapter = async (config) => {
    calls.push(config)
    if (config.url === '/student') return reply(config, { id: 'new-student' })
    throw new Error('Related request failed')
  }
  const start = calls.length
  const partial = await workflow.saveStudent('add', { ...values, parent: 'Phụ huynh', parentPhone: '0900000001', courseId: 'course-1', classId: 'class-1', statusValue: 'active' }, null, { canAssignSale: true, classes: [{ id: 'class-1', courseId: 'course-1' }] })
  assert.equal(partial.saved.id, 'new-student')
  assert.equal(partial.warnings.length, 2)
  assert.equal(calls.slice(start).filter((call) => call.url === '/student').length, 1)
  const wrongCourseStart = calls.length
  await assert.rejects(workflow.saveStudent('add', { ...values, courseId: 'wrong', classId: 'class-1' }, null, { canAssignSale: true, classes: [{ id: 'class-1', courseId: 'course-1' }] }))
  assert.equal(calls.length, wrongCourseStart)

  const html = exportService.studentPrintHtml([{ ...student, name: '<script>alert(1)</script>' }])
  assert.ok(html.includes('&lt;script&gt;'))
  assert.ok(!html.includes('<script>'))
  assert.ok(html.includes('Họ tên'))
  const { default: OperationModal } = await server.ssrLoadModule('/src/components/Students/StudentOperationModal.jsx')
  const { default: ImportResult } = await server.ssrLoadModule('/src/components/Students/StudentImportResult.jsx')
  const { default: StudentModal } = await server.ssrLoadModule('/src/components/Students/StudentModal.jsx')
  const { modalConfigs, studentFilters } = await server.ssrLoadModule('/src/datas/students.js')
  const props = { student, classes: [{ id: 'class-2', name: 'Lớp 2', courseId: 'course-1', status: 'active' }], onClose() {}, onSubmit() {} }
  assert.match(renderToString(createElement(OperationModal, { ...props, type: 'transfer' })), /Lượt ghi danh hiện tại/)
  assert.match(renderToString(createElement(OperationModal, { ...props, type: 'extend' })), /Hạn học mới/)
  assert.match(renderToString(createElement(OperationModal, { ...props, type: 'import' })), /accept=".xlsx"/)
  const resultHtml = renderToString(createElement(ImportResult, { result: importResult, onClose() {} }))
  assert.match(resultHtml, /Đã tồn tại/)
  assert.match(resultHtml, /Học viên mới/)
  const editHtml = renderToString(createElement(StudentModal, { modal: 'edit', configs: modalConfigs, selectedStudent: student, filters: studentFilters, directories: { classes: [], courses: [], branches: [] }, onClose() {}, onSubmit() {} }))
  assert.match(editHtml, /Giáo viên theo lớp/)
  assert.ok(!editHtml.includes('name="teacherId"'))
  assert.ok(!editHtml.includes('name="statusValue"'))
  console.log('PASS: operation contracts, validation, multipart import, partial-save handling, edit preservation, print escaping and modal rendering.')
} finally { await server.close() }
