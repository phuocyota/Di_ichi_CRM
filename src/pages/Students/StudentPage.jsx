import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import StudentDashboard from '../../components/Students/StudentDashboard.jsx'
import StudentHeader from '../../components/Students/StudentHeader.jsx'
import StudentModal from '../../components/Students/StudentModal.jsx'
import StudentProfile from '../../components/Students/StudentProfile.jsx'
import StudentTable from '../../components/Students/StudentTable.jsx'
import {
  modalConfigs,
  profileTabs,
  studentFilters,
  studentStatistics,
} from '../../datas/students.js'
import { createResource, deleteResource, getStudentSummary, indexById, initials, listAllResource, updateResource } from '../../services/crmApi.js'
import { USER_KEY } from '../../services/apiClient.js'

const statusColors = {
  active: '#10b981',
  reserved: '#f59e0b',
  stopped: '#ef4444',
  trial: '#2563eb',
  potential: '#8b5cf6',
}

const emptyCharts = { monthly: [], status: [], courses: [], branches: [] }
let summaryRequest

function normalizeDate(value, fieldLabel) {
  if (!value) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  const parts = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`
  throw new Error(`${fieldLabel} không đúng định dạng ngày`)
}

function requestStudentSummary() {
  if (!summaryRequest) {
    summaryRequest = getStudentSummary().finally(() => {
      summaryRequest = null
    })
  }
  return summaryRequest
}

function StudentPage() {
  const [canAssignSale] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY))?.role === 'ADMIN' } catch { return false }
  })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [keyword, setKeyword] = useState('')
  const [studentItems, setStudentItems] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [summaryStatistics, setSummaryStatistics] = useState([])
  const [summaryCharts, setSummaryCharts] = useState(emptyCharts)
  const [directories, setDirectories] = useState({ branches: [], courses: [], classes: [], teachers: [] })
  const [studentDataLoaded, setStudentDataLoaded] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState('')
  const [modal, setModal] = useState(null)
  const studentDataRequest = useRef(null)

  const mapStudent = (student, resources) => {
    const status = studentFilters.statuses.find((item) => item.value === student.status)
    const branch = indexById(resources.branch)[student.branchId]
    const current = resources.enrollment.filter((item) => item.studentId === student.id && item.isCurrent)
    const classMap = indexById(resources.class)
    const courseMap = indexById(resources.course)
    const staffMap = indexById(resources.staff)
    const classroomIds = new Set(current.map((item) => item.classId))
    const parent = resources['student-guardian'].find((item) => item.studentId === student.id && item.isPrimary)
      || resources['student-guardian'].find((item) => item.studentId === student.id)
    const join = (values) => [...new Set(values.filter(Boolean))].join(' · ') || '—'
    return {
      ...student,
      avatar: initials(student.name),
      gender: { male: 'Nam', female: 'Nữ' }[student.gender] || student.gender,
      branch: branch?.name || '—',
      parent: parent?.name || '—',
      parentPhone: parent?.phone || '',
      course: join(current.map((item) => courseMap[classMap[item.classId]?.courseId]?.name)),
      className: join(current.map((item) => classMap[item.classId]?.name)),
      teacher: join(resources['class-staff'].filter((item) => classroomIds.has(item.classId)).map((item) => staffMap[item.staffId]?.name)),
      status: status?.label || student.status,
      statusValue: student.status,
    }
  }

  const refreshStudents = () => {
    if (studentDataRequest.current) return studentDataRequest.current
    setStudentsLoading(true)
    setStudentsError('')
    const resources = ['student', 'branch', 'course', 'class', 'staff', 'student-guardian', 'enrollment', 'class-staff']
    studentDataRequest.current = Promise.all(resources.map(async (name) => [name, await listAllResource(name)]))
      .then((entries) => {
        const result = Object.fromEntries(entries)
        const mapped = result.student.filter((item) => !item.deletedAt).map((item) => mapStudent(item, result))
        setDirectories({ branches: result.branch, courses: result.course, classes: result.class, teachers: result.staff.filter((item) => item.type?.toLowerCase() === 'teacher') })
        setStudentItems(mapped)
        setSelectedStudent((current) => mapped.find((item) => item.id === current?.id) || mapped[0] || null)
        setStudentDataLoaded(true)
        return mapped
      })
      .catch((error) => {
        setStudentItems([])
        setSelectedStudent(null)
        setStudentDataLoaded(false)
        setStudentsError(error.message)
        throw error
      })
      .finally(() => {
        setStudentsLoading(false)
        studentDataRequest.current = null
      })
    return studentDataRequest.current
  }

  const refreshSummary = async () => {
    setSummaryLoading(true)
    setSummaryError('')
    try {
      const result = await requestStudentSummary()
      if (!result?.statistics || !result?.charts) throw new Error('Dữ liệu tổng quan không đúng định dạng')
      const statistics = result.statistics
      const charts = result.charts
      const count = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value).toLocaleString('vi-VN') : '—'
      const rows = (items) => Array.isArray(items) ? items.filter((item) => item.value !== null && item.value !== undefined && Number.isFinite(Number(item.value))) : []
      const distribution = rows(charts.statusDistribution)
      const statusTotal = distribution.reduce((sum, item) => sum + Number(item.value), 0)
      setSummaryStatistics(studentStatistics.map((item) => ({ ...item, value: count(statistics[item.field]) })))
      setSummaryCharts({
        monthly: rows(charts.monthlyEnrollment).map((item) => ({ month: item.label, students: Number(item.value) })),
        status: distribution.map((item) => ({ name: item.label, value: statusTotal ? Math.round(Number(item.value) / statusTotal * 100) : 0, fill: statusColors[item.status] || '#64748b' })),
        courses: rows(charts.courseDistribution).map((item) => ({ name: item.name, value: Number(item.value) })),
        branches: rows(charts.branchDistribution).map((item) => ({ name: item.name, value: Number(item.value) })),
      })
    } catch (error) {
      setSummaryStatistics([])
      setSummaryCharts(emptyCharts)
      setSummaryError(error.message)
      throw error
    } finally { setSummaryLoading(false) }
  }

  useEffect(() => {
    refreshSummary().catch((error) => toast.error(`Không tải được tổng quan học viên: ${error.message}`))
  }, [])

  useEffect(() => {
    if (activeTab !== 'dashboard' && !studentDataLoaded) {
      refreshStudents().catch((error) => toast.error(`Không tải được học viên từ API: ${error.message}`))
    }
  }, [activeTab, studentDataLoaded])

  const handleModalSubmit = async (type, values, student) => {
    try {
      if (type === 'delete') {
        await deleteResource('student', student.id)
      } else if (type === 'add' || type === 'edit') {
        const branchId = values.branchId || student?.branchId
        if (!branchId) throw new Error('Vui lòng chọn cơ sở')

        const payload = {
          code: values.code || `HV-${Date.now()}`,
          branchId,
          name: values.name,
          gender: { Nam: 'male', Nữ: 'female' }[values.gender] || values.gender || null,
          birthDate: normalizeDate(values.birthDate, 'Ngày sinh'),
          phone: values.phone || undefined,
          email: values.email || undefined,
          status: values.statusValue || 'active',
          enrollmentDate: normalizeDate(values.enrollmentDate, 'Ngày nhập học'),
          note: values.reason || null,
        }
        if (canAssignSale && (type === 'add' || (values.assignedSaleUserId || null) !== (student?.assignedSaleUserId || null))) {
          payload.assignedSaleUserId = values.assignedSaleUserId || null
        }
        const saved = type === 'add'
          ? await createResource('student', payload)
          : await updateResource('student', student.id, payload)
        if (type === 'add' && values.parent && values.parentPhone) {
          await createResource('student-guardian', { studentId: saved.id, name: values.parent, phone: values.parentPhone, relationship: 'Phụ huynh', isPrimary: true })
        }
        if (type === 'add' && values.classId) {
          await createResource('enrollment', { studentId: saved.id, classId: values.classId, enrolledAt: normalizeDate(values.enrollmentDate, 'Ngày nhập học'), status: 'active', isCurrent: true })
        }
      } else {
        toast.info('Thao tác này chưa được nối vào giao diện')
        setModal(null)
        return
      }
      await refreshStudents()
      await refreshSummary()
      toast.success(type === 'delete' ? 'Đã xóa học viên' : 'Đã lưu học viên')
      setModal(null)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleOpenModal = async (type, student = selectedStudent) => {
    try {
      const loaded = studentDataLoaded ? studentItems : await refreshStudents()
      setSelectedStudent(loaded.find((item) => item.id === student?.id) || loaded[0] || null)
      setModal(type)
    } catch (error) { toast.error(`Không tải được dữ liệu biểu mẫu: ${error.message}`) }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setActiveTab('profile')
  }

  const effectiveFilters = {
    ...studentFilters,
    branches: directories.branches?.map((item) => item.name) || studentFilters.branches,
    courses: directories.courses?.map((item) => item.name) || studentFilters.courses,
    classes: directories.classes?.map((item) => item.name) || studentFilters.classes,
    teachers: directories.teachers?.map((item) => item.name) || studentFilters.teachers,
  }

  return (
    <div className="space-y-5">
      <StudentHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onOpenModal={handleOpenModal}
      />
      {activeTab === 'dashboard' ? (
        summaryLoading ? <p role="status" className="rounded-xl bg-white p-5">Đang tải tổng quan học viên…</p> : summaryError ? (
          <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">{summaryError} <button type="button" className="ml-3 underline" onClick={() => refreshSummary().catch(() => {})}>Thử lại</button></div>
        ) : <StudentDashboard statistics={summaryStatistics} charts={summaryCharts} />
      ) : null}
      {activeTab !== 'dashboard' && studentsLoading ? <p role="status" className="rounded-xl bg-white p-5">Đang tải danh sách học viên…</p> : null}
      {activeTab !== 'dashboard' && studentsError ? <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">{studentsError} <button type="button" className="ml-3 underline" onClick={() => refreshStudents().catch(() => {})}>Thử lại</button></div> : null}
      {activeTab === 'list' && !studentsLoading && !studentsError ? (
        <StudentTable
          students={studentItems}
          filters={effectiveFilters}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelectStudent={handleSelectStudent}
          onOpenModal={handleOpenModal}
        />
      ) : null}
      {activeTab === 'profile' && !studentsLoading && !studentsError ? (
        <StudentProfile key={selectedStudent?.id || 'empty'} student={selectedStudent} tabs={profileTabs} />
      ) : null}
      <StudentModal
        modal={modal}
        configs={modalConfigs}
        selectedStudent={modal === 'add' ? null : selectedStudent}
        filters={effectiveFilters}
        directories={directories}
        canAssignSale={canAssignSale}
        onClose={() => setModal(null)}
        onSubmit={handleModalSubmit}
      />
    </div>
  )
}

export default StudentPage
