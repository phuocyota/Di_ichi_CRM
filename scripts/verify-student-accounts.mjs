import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  globalThis.localStorage = { getItem: () => null }
  const { default: client } = await server.ssrLoadModule('/src/services/apiClient.js')
  const { createStudentAccount } = await server.ssrLoadModule('/src/services/studentWorkflow.js')
  const calls = []
  client.defaults.adapter = async config => {
    calls.push(config)
    return { data: { success: true, data: { studentId: 'student-1', accountId: 'account-1', email: 'legacy@example.test', userType: 'STUDENT' } }, status: 201, statusText: 'Created', headers: {}, config }
  }
  const student = { id: 'student-1', code: 'HV1', name: 'Học viên cũ', avatar: 'HV', statusValue: 'active', enrollments: [], email: null, hasAccount: false }
  assert.equal((await createStudentAccount(student, '  Legacy@Example.test  ')).accountId, 'account-1')
  assert.equal(calls[0].method, 'post')
  assert.equal(calls[0].url, '/student/student-1/account')
  assert.deepEqual(JSON.parse(calls[0].data), { email: 'legacy@example.test' })
  for (const value of ['', 'invalid']) assert.throws(() => createStudentAccount(student, value), /email/)
  assert.throws(() => createStudentAccount({ ...student, hasAccount: true }, 'legacy@example.test'), /đã có tài khoản/)
  assert.equal(calls.length, 1)
  client.defaults.adapter = async () => { throw Object.assign(new Error('Conflict'), { response: { status: 409, data: { message: 'Email đã được sử dụng' } } }) }
  await assert.rejects(createStudentAccount(student, 'legacy@example.test'), /Email đã được sử dụng/)

  const { default: Table } = await server.ssrLoadModule('/src/components/Students/StudentTable.jsx')
  const { default: Modal } = await server.ssrLoadModule('/src/components/Students/StudentAccountModal.jsx')
  const { default: Profile } = await server.ssrLoadModule('/src/components/Students/StudentProfile.jsx')
  const students = [student, { ...student, id: 'student-2', name: 'Có tài khoản', hasAccount: true }, { ...student, id: 'student-3', name: 'Có email chưa có user', email: 'other@example.test' }, { ...student, id: 'student-4', name: 'Chưa xác định', hasAccount: undefined }]
  const props = { students, filters: { statuses: [], courses: [], classes: [], teachers: [], branches: [] }, keyword: '', onKeywordChange() {}, onSelectStudent() {}, onOpenModal() {} }
  const html = renderToString(createElement(Table, { ...props, canManage: true }))
  assert.equal((html.match(/aria-label="Tạo tài khoản cho /g) || []).length, 2)
  assert.ok(!html.includes('aria-label="Tạo tài khoản cho Có tài khoản"'))
  assert.ok(!html.includes('aria-label="Tạo tài khoản cho Chưa xác định"'))
  assert.ok(!renderToString(createElement(Table, { ...props, canManage: false })).includes('aria-label="Tạo tài khoản cho '))
  const modalHtml = renderToString(createElement(Modal, { student, onClose() {}, onSubmit() {} }))
  assert.match(modalHtml, /type="email"/)
  assert.match(modalHtml, /required=""/)
  assert.match(modalHtml, /123456/)
  assert.match(renderToString(createElement(Profile, { student, tabs: ['Thông tin'], canManage: true, onOpenModal() {} })), /Tạo tài khoản/)
  console.log('PASS: account creation API payload, error handling, real-account button visibility, admin gating, profile action and required-email modal.')
} finally { await server.close() }
