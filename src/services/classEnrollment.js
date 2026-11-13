import apiClient from './apiClient.js'
import { createResource, getResource } from './crmApi.js'
import { listAllCourseResource } from './courseApi.js'
import { businessDate } from './studentWorkflow.js'

export { businessDate as enrollmentToday }

function pageData(response) {
  const body = response?.success !== undefined ? response.data : response
  const rows = Array.isArray(body) ? body : body?.data ?? body?.items
  if (!Array.isArray(rows)) throw new Error('Danh sách học viên không đúng định dạng')
  const total = Array.isArray(body) ? rows.length : Number(body.total)
  if (!Number.isSafeInteger(total) || total < rows.length) throw new Error('Thông tin phân trang học viên không hợp lệ')
  return { items: rows, total }
}

export async function findEnrollmentStudents({ search = '', page = 1, branchId, signal } = {}) {
  const response = await apiClient.get('/student', {
    signal,
    preserveResponse: true,
    params: { page, size: 20, status: 'active', ...(search.trim() ? { search: search.trim() } : {}), ...(branchId ? { branchId } : {}) },
  })
  return pageData(response)
}

export async function getClassEnrollmentState(classId, signal) {
  if (!classId) throw new Error('Vui lòng chọn lớp học')
  const [classroom, enrollments] = await Promise.all([
    getResource('class', classId, undefined, signal),
    listAllCourseResource('enrollment', { signal, params: { classId, isCurrent: true } }),
  ])
  if (classroom?.id !== classId || enrollments.some(item => item.classId !== classId || item.isCurrent !== true)) {
    throw new Error('Dữ liệu ghi danh không đúng lớp. Vui lòng tải lại')
  }
  return { classroom, enrollments }
}

export function enrollmentPayload({ classroom, student, enrollments, enrolledAt, reason = '' }) {
  if (!classroom?.id || !student?.id) throw new Error('Vui lòng chọn lớp và học viên')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(enrolledAt || '') || !Number.isFinite(Date.parse(`${enrolledAt}T00:00:00Z`)) || new Date(`${enrolledAt}T00:00:00Z`).toISOString().slice(0, 10) !== enrolledAt) throw new Error('Ngày vào lớp không hợp lệ')
  if (classroom.deletedAt || !['active', 'upcoming'].includes(classroom.status) || (classroom.endDate && enrolledAt > classroom.endDate)) throw new Error('Lớp học không còn nhận học viên ở ngày đã chọn')
  if (student.deletedAt || student.status !== 'active') throw new Error('Chỉ thêm học viên đang học vào lớp')
  if (classroom.scopeBranchId && student.branchId !== classroom.scopeBranchId) throw new Error('Học viên và lớp học phải cùng cơ sở')
  if (enrollments.some(item => item.studentId === student.id && item.isCurrent && item.classId === classroom.id)) throw new Error('Học viên đã có trong lớp này')
  if (!Number.isSafeInteger(Number(classroom.maxSize)) || Number(classroom.maxSize) <= 0) throw new Error('Sĩ số tối đa của lớp không hợp lệ')
  if (Number(classroom.maxSize) <= enrollments.length) throw new Error('Lớp đã đủ sĩ số. Vui lòng kiểm tra lại lớp học')
  if (reason.trim().length > 2000) throw new Error('Ghi chú tối đa 2.000 ký tự')
  return { studentId: student.id, classId: classroom.id, enrolledAt, status: 'active', isCurrent: true, ...(reason.trim() ? { reason: reason.trim() } : {}) }
}

export async function addStudentToClass({ classId, studentId, enrolledAt, reason }) {
  if (!classId || !studentId) throw new Error('Vui lòng chọn lớp và học viên')
  // Đọc lại trước mỗi lần lưu để tránh dùng sĩ số/trạng thái cũ hoặc POST lặp khi retry.
  const [{ classroom, enrollments }, student] = await Promise.all([
    getClassEnrollmentState(classId), getResource('student', studentId),
  ])
  if (student?.id !== studentId) throw new Error('Dữ liệu học viên không hợp lệ. Vui lòng tải lại')
  const existing = enrollments.find(item => item.studentId === studentId)
  if (existing) return { enrollment: existing, alreadyEnrolled: true }
  const payload = enrollmentPayload({ classroom, student, enrollments, enrolledAt, reason })
  const confirm = record => record?.id && record.classId === classId && record.studentId === studentId && record.isCurrent === true
  let record
  let failure
  try { record = await createResource('enrollment', payload) }
  catch (error) { failure = error }
  if (confirm(record)) return { enrollment: record, alreadyEnrolled: false }
  // Mất response không có nghĩa là server chưa ghi nhận: xác minh trước khi cho thử lại.
  try {
    const current = await getClassEnrollmentState(classId)
    const saved = current.enrollments.find(item => item.studentId === studentId)
    if (confirm(saved)) return { enrollment: saved, alreadyEnrolled: Boolean(failure) }
  } catch { /* Báo chưa xác nhận, lần retry tiếp theo luôn đọc lại trước khi POST. */ }
  throw new Error(failure?.message || 'Chưa xác nhận được ghi danh. Vui lòng tải lại trước khi thử lại')
}

export async function addStudentsToClass({ classId, students, enrolledAt, reason }, onProgress) {
  if (!Array.isArray(students) || !students.length || students.some(student => !student?.id)) throw new Error('Vui lòng chọn ít nhất một học viên')
  const unique = [...new Map(students.map(student => [student.id, student])).values()]
  const result = { added: [], existing: [], failed: [] }
  for (const [index, student] of unique.entries()) {
    try {
      const saved = await addStudentToClass({ classId, studentId: student.id, enrolledAt, reason })
      result[saved.alreadyEnrolled ? 'existing' : 'added'].push({ student, enrollment: saved.enrollment })
    } catch (error) {
      result.failed.push({ student, message: error.message })
    }
    onProgress?.({ completed: index + 1, total: unique.length })
  }
  return result
}
