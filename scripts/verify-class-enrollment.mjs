import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

// API adapter cô lập: không gửi request hoặc ghi dữ liệu lên server thật.
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null } })
  const { default: api } = await server.ssrLoadModule('/src/services/apiClient.js')
  const workflow = await server.ssrLoadModule('/src/services/classEnrollment.js')
  const { listAllCourseResource } = await server.ssrLoadModule('/src/services/courseApi.js')
  const classroom = { id: 'class-1', name: 'Lớp N5', code: 'N5', status: 'active', scopeBranchId: 'branch-1', maxSize: 20, endDate: '2099-12-31' }
  const student = { id: 'student-1', name: 'Nguyễn An', code: 'HV1', status: 'active', branchId: 'branch-1' }
  const date = workflow.enrollmentToday()
  let enrollments = [{ id: 'other', studentId: student.id, classId: 'other-class', isCurrent: true, status: 'active' }]
  const calls = []
  const reply = (config, data) => ({ config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data } })
  let postMode = 'success'
  let batchMode = false
  const secondStudent = { ...student, id: 'student-2', name: 'Học viên 2', status: 'stopped' }
  const thirdStudent = { ...student, id: 'student-3', name: 'Học viên 3' }
  api.defaults.adapter = async config => {
    calls.push(config)
    if (config.url === '/class/class-1') return reply(config, classroom)
    if (config.url === '/student/student-1') return reply(config, student)
    if (config.url === '/student/student-2') return reply(config, secondStudent)
    if (config.url === '/student/student-3') return reply(config, thirdStudent)
    if (config.url === '/student') return reply(config, { page: config.params.page, size: 20, total: 1, data: [student] })
    if (config.url === '/enrollment' && config.method === 'get') {
      const rows = enrollments.filter(row => row.classId === config.params.classId && row.isCurrent === config.params.isCurrent)
      const page = config.params.page || 1
      return reply(config, { page, total: rows.length, data: rows.slice((page - 1) * 10, page * 10) })
    }
    if (config.url === '/enrollment' && config.method === 'post') {
      if (postMode === 'forbidden') throw { config, response: { status: 403, data: { message: 'Không có quyền ghi danh' } } }
      const body = JSON.parse(config.data)
      const saved = { id: batchMode ? `enrollment-${body.studentId}` : 'enrollment-1', ...body }
      enrollments.push(saved)
      if (postMode === 'lost-response') throw new Error('Response lost after commit')
      return reply(config, saved)
    }
    throw new Error('Unexpected API call: ' + config.url)
  }
  const found = await workflow.findEnrollmentStudents({ search: ' An ', page: 2, branchId: 'branch-1' })
  assert.equal(found.total, 1)
  assert.deepEqual(calls.at(-1).params, { page: 2, size: 20, status: 'active', search: 'An', branchId: 'branch-1' })
  const input = { classId: classroom.id, studentId: student.id, enrolledAt: date, reason: '  Học bổ sung  ' }
  const saved = await workflow.addStudentToClass(input)
  assert.equal(saved.alreadyEnrolled, false)
  assert.deepEqual(saved.enrollment, { id: 'enrollment-1', classId: classroom.id, studentId: student.id, enrolledAt: date, status: 'active', isCurrent: true, reason: 'Học bổ sung' })
  assert.equal(enrollments.find(row => row.classId === 'other-class').isCurrent, true)
  const beforeDuplicate = calls.filter(call => call.method === 'post').length
  assert.equal((await workflow.addStudentToClass(input)).alreadyEnrolled, true)
  assert.equal(calls.filter(call => call.method === 'post').length, beforeDuplicate)
  enrollments = enrollments.filter(row => row.classId !== classroom.id)
  postMode = 'lost-response'
  const recovered = await workflow.addStudentToClass(input)
  assert.equal(recovered.enrollment.id, 'enrollment-1')
  assert.equal(recovered.alreadyEnrolled, true)
  enrollments = []
  postMode = 'forbidden'
  await assert.rejects(workflow.addStudentToClass(input), /Không có quyền/)
  assert.equal(enrollments.length, 0)
  postMode = 'success'
  const beforeInvalid = calls.filter(call => call.method === 'post').length
  for (const overrides of [
    { enrolledAt: '2026-02-30' }, { enrolledAt: 'bad' }, { reason: 'x'.repeat(2001) },
  ]) await assert.rejects(workflow.addStudentToClass({ ...input, ...overrides }))
  classroom.maxSize = 1
  enrollments = [{ id: 'occupied', classId: classroom.id, studentId: 'someone-else', isCurrent: true }]
  await assert.rejects(workflow.addStudentToClass(input), /đủ sĩ số/)
  enrollments = []
  classroom.maxSize = 20
  student.branchId = 'branch-2'
  await assert.rejects(workflow.addStudentToClass(input), /cùng cơ sở/)
  student.branchId = 'branch-1'
  student.status = 'stopped'
  await assert.rejects(workflow.addStudentToClass(input), /đang học/)
  student.status = 'active'
  classroom.status = 'ended'
  await assert.rejects(workflow.addStudentToClass(input), /không còn nhận/)
  classroom.status = 'active'
  assert.equal(calls.filter(call => call.method === 'post').length, beforeInvalid)
  enrollments = Array.from({ length: 23 }, (_, index) => ({ id: 'e' + index, studentId: 's' + index, classId: classroom.id, isCurrent: true }))
  assert.equal((await listAllCourseResource('enrollment', { params: { classId: classroom.id, isCurrent: true } })).length, 23)
  assert.deepEqual(calls.at(-1).params, { classId: classroom.id, isCurrent: true, page: 3 })
  batchMode = true
  enrollments = []
  const beforeBatch = calls.length
  const progress = []
  const multi = await workflow.addStudentsToClass({ classId: classroom.id, students: [student, secondStudent, thirdStudent, student], enrolledAt: date, reason: 'Ghi danh nhiều học viên' }, value => progress.push(value))
  assert.equal(multi.added.length, 2)
  assert.equal(multi.failed.length, 1)
  assert.equal(multi.failed[0].student.id, secondStudent.id)
  assert.match(multi.failed[0].message, /đang học/)
  assert.deepEqual(progress.at(-1), { completed: 3, total: 3 })
  assert.equal(calls.slice(beforeBatch).filter(call => call.method === 'post').length, 2)
  secondStudent.status = 'active'
  const beforeRetry = calls.length
  const retried = await workflow.addStudentsToClass({ classId: classroom.id, students: multi.failed.map(row => row.student), enrolledAt: date })
  assert.equal(retried.added.length, 1)
  assert.equal(retried.failed.length, 0)
  assert.equal(calls.slice(beforeRetry).filter(call => call.method === 'post').length, 1)
  assert.equal(enrollments.length, 3)
  const duplicateBatchPosts = calls.filter(call => call.method === 'post').length
  const existingBatch = await workflow.addStudentsToClass({ classId: classroom.id, students: [student, secondStudent], enrolledAt: date })
  assert.equal(existingBatch.existing.length, 2)
  assert.equal(calls.filter(call => call.method === 'post').length, duplicateBatchPosts)
  enrollments = []
  classroom.maxSize = 1
  const capacityBatch = await workflow.addStudentsToClass({ classId: classroom.id, students: [student, thirdStudent], enrolledAt: date })
  assert.equal(capacityBatch.added.length, 1)
  assert.equal(capacityBatch.failed.length, 1)
  assert.match(capacityBatch.failed[0].message, /đủ sĩ số/)
  assert.equal(enrollments.length, 1)
  await assert.rejects(workflow.addStudentsToClass({ classId: classroom.id, students: [], enrolledAt: date }), /ít nhất/)
  classroom.maxSize = 20
  const { default: Modal } = await server.ssrLoadModule('/src/components/Courses/ClassEnrollmentModal.jsx')
  const modalHtml = renderToString(createElement(Modal, { item: classroom, onClose() {}, onAdded() {} }))
  assert.match(modalHtml, /Thêm học viên vào lớp/)
  assert.match(modalHtml, /Ngày vào lớp/)
  assert.match(modalHtml, /Tìm học viên/)
  assert.match(modalHtml, /Giữ nguyên|giữ nguyên/)
  const { default: CourseModal } = await server.ssrLoadModule('/src/components/Courses/CourseModal.jsx')
  const details = renderToString(createElement(CourseModal, { modal: { entity: 'class', mode: 'view', item: classroom }, courses: [], teachers: [], courseMap: {}, teacherMap: {}, classStatuses: [], courseStatuses: [], onClose() {}, onSubmit() {}, onAddStudents() {} }))
  assert.match(details, /Thêm học viên/)
  console.log('PASS: picker pagination, exact enrollment payload, duplicate avoidance, lost-response recovery, authorization errors, capacity/date/branch validation, preservation of other classes modal entry point, multi-selection deduplication, per-student results, partial retry, progress and capacity during batch. No live writes.')
} finally { await server.close() }
