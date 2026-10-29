import apiClient from './apiClient.js'
import { createResource, updateResource } from './crmApi.js'

export const businessDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function operationPayload(type, student, values) {
  if (!student?.id) throw new Error('Vui lòng chọn học viên')
  const reason = values.reason?.trim()
  if (!reason) throw new Error('Vui lòng nhập lý do')
  if (reason.length > 2000) throw new Error('Lý do tối đa 2.000 ký tự')
  if (type === 'reserve' && student.statusValue !== 'active') throw new Error('Chỉ bảo lưu học viên đang học')
  if (type === 'stop' && !['active', 'reserved'].includes(student.statusValue)) throw new Error('Chỉ nghỉ học với học viên đang học hoặc bảo lưu')
  const payload = { reason }
  if (type !== 'extend') {
    if (!validDate(values.effectiveDate) || values.effectiveDate > businessDate()) throw new Error('Ngày có hiệu lực phải là ngày hợp lệ, không ở tương lai')
    payload.effectiveDate = values.effectiveDate
  }
  if (type === 'transfer' || type === 'extend') {
    const enrollment = student.enrollments?.find((item) => item.id === values.enrollmentId && item.isCurrent)
    if (!enrollment) throw new Error('Vui lòng chọn lượt ghi danh hiện tại của học viên')
    payload.enrollmentId = enrollment.id
    if (type === 'transfer') {
      if (student.statusValue !== 'active' || enrollment.status !== 'active') throw new Error('Chỉ chuyển lớp cho học viên và ghi danh đang học')
      if (!values.targetClassId || values.targetClassId === enrollment.classId) throw new Error('Vui lòng chọn lớp đích khác lớp hiện tại')
      if (values.effectiveDate < enrollment.enrolledAt) throw new Error('Ngày chuyển không được trước ngày ghi danh')
      payload.targetClassId = values.targetClassId
    } else {
      if (!['active', 'reserved'].includes(student.statusValue)) throw new Error('Chỉ gia hạn học viên đang học hoặc bảo lưu')
      const previousExpiry = enrollment.expiresAt || enrollment.class?.endDate
      if (!validDate(values.expiresAt) || values.expiresAt <= businessDate() || (previousExpiry && values.expiresAt <= previousExpiry)) throw new Error('Hạn mới phải sau hạn hiện tại và sau hôm nay')
      payload.expiresAt = values.expiresAt
    }
  }
  return payload
}

export function performStudentOperation(type, student, values) {
  const routes = { transfer: 'transfer-class', reserve: 'reserve', stop: 'stop', extend: 'extend-enrollment' }
  if (!routes[type]) throw new Error('Thao tác học viên không hợp lệ')
  const payload = operationPayload(type, student, values)
  return apiClient.post(`/student/${student.id}/${routes[type]}`, payload)
}

export async function importStudents(file) {
  if (!file || !/\.xlsx$/i.test(file.name)) throw new Error('Vui lòng chọn file .xlsx')
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('File phải có dữ liệu và không vượt quá 10 MB')
  const form = new FormData()
  form.append('file', file)
  const result = await apiClient.post('/student/import', form, { timeout: 120000 })
  if (!result?.summary || !Array.isArray(result.created) || !Array.isArray(result.skipped)) throw new Error('Kết quả import không đúng định dạng. Vui lòng kiểm tra danh sách học viên trước khi thử lại.')
  return result
}

const inputDate = (value) => value || null
export async function saveStudent(type, values, student, { canAssignSale, classes }) {
  const creating = type === 'add'
  if (!creating && !student?.id) throw new Error('Vui lòng chọn học viên')
  if (!values.name?.trim()) throw new Error('Vui lòng nhập họ tên')
  const email = values.email?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Vui lòng nhập email đăng nhập hợp lệ')
  const branchId = values.branchId || student?.branchId
  if (!branchId) throw new Error('Vui lòng chọn cơ sở')
  const parent = values.parent?.trim() || ''
  const parentPhone = values.parentPhone?.trim() || ''
  if (Boolean(parent) !== Boolean(parentPhone)) throw new Error('Vui lòng nhập đủ họ tên và số điện thoại phụ huynh')
  if (!creating && student.guardianId && !parent) throw new Error('Vui lòng giữ thông tin phụ huynh hoặc cập nhật đủ họ tên và số điện thoại')
  if (creating && values.classId) {
    const classroom = classes.find((item) => item.id === values.classId)
    if (!classroom || classroom.courseId !== values.courseId) throw new Error('Lớp học phải thuộc khóa học đã chọn')
    if (!values.enrollmentDate) throw new Error('Vui lòng chọn ngày nhập học')
  }
  const payload = {
    code: values.code?.trim() || (creating ? `HV-${Date.now()}` : student.code),
    branchId, name: values.name.trim(),
    gender: { Nam: 'male', Nữ: 'female' }[values.gender] || values.gender || null,
    birthDate: inputDate(values.birthDate), phone: values.phone?.trim() || null,
    email,
    enrollmentDate: inputDate(values.enrollmentDate), note: values.reason?.trim() || null,
    ...(creating ? { status: values.statusValue || 'active' } : {}),
  }
  if (canAssignSale && (creating || (values.assignedSaleUserId || null) !== (student.assignedSaleUserId || null))) payload.assignedSaleUserId = values.assignedSaleUserId || null
  const saved = creating ? await createResource('student', payload) : await updateResource('student', student.id, payload)
  // The existing APIs commit these records separately. Once the student is saved,
  // report a related-record failure without encouraging a duplicate student POST.
  const warnings = []
  if (parent && parentPhone) {
    const guardian = { name: parent, phone: parentPhone, relationship: student?.guardianRelationship || 'Phụ huynh', isPrimary: student?.guardianIsPrimary ?? true }
    const changed = creating || parent !== (student.parent || '') || parentPhone !== (student.parentPhone || '')
    if (changed) {
      try {
        if (student?.guardianId && !creating) await updateResource('student-guardian', student.guardianId, guardian)
        else await createResource('student-guardian', { ...guardian, studentId: saved.id })
      } catch (error) { warnings.push(`Đã lưu học viên nhưng chưa lưu được phụ huynh: ${error.message}`) }
    }
  }
  if (creating && values.classId) {
    const stopped = payload.status === 'stopped'
    try { await createResource('enrollment', { studentId: saved.id, classId: values.classId, enrolledAt: values.enrollmentDate, status: payload.status === 'reserved' ? 'reserved' : stopped ? 'stopped' : 'active', isCurrent: !stopped, ...(stopped ? { endedAt: values.enrollmentDate } : {}) }) }
    catch (error) { warnings.push(`Đã lưu học viên nhưng chưa xếp được lớp: ${error.message}`) }
  }
  return { saved, warnings }
}
