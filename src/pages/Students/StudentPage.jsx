import { statusColor } from '../../components/common/presentation.js'
import { LoadingSkeleton } from '../../components/common/ui.jsx'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import StudentDashboard from '../../components/Students/StudentDashboard.jsx'
import StudentHeader from '../../components/Students/StudentHeader.jsx'
import StudentModal from '../../components/Students/StudentModal.jsx'
import StudentAccountModal from '../../components/Students/StudentAccountModal.jsx'
import StudentOperationModal from '../../components/Students/StudentOperationModal.jsx'
import StudentImportResult from '../../components/Students/StudentImportResult.jsx'
import StudentProfile from '../../components/Students/StudentProfile.jsx'
import StudentTable from '../../components/Students/StudentTable.jsx'
import {
  modalConfigs,
  profileTabs,
  studentFilters,
  studentStatistics
} from '../../datas/students.js'
import {
  deleteResource,
  getStudentSummary,
  indexById,
  initials,
  listAllResource
} from '../../services/crmApi.js'
import {
  importStudents,
  performStudentOperation,
  saveStudent,
  createStudentAccount
} from '../../services/studentWorkflow.js'
import {
  exportStudentsExcel,
  exportStudentsPdf
} from '../../services/studentExport.js'
import { USER_KEY } from '../../services/apiClient.js'


const emptyCharts = { monthly: [], status: [], courses: [], branches: [] }
let summaryRequest

function requestStudentSummary() {
  if (!summaryRequest) {
    summaryRequest = getStudentSummary().finally(() => {
      summaryRequest = null
    })
  }
  return summaryRequest
}

function StudentPage() {
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const query = searchParams.get('search')
    if (query != null) {
      setKeyword(query)
      setActiveTab('list')
    }
  }, [searchParams])
  const [canAssignSale] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))?.role === 'ADMIN'
    } catch {
      return false
    }
  })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [keyword, setKeyword] = useState('')
  const [studentItems, setStudentItems] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [summaryStatistics, setSummaryStatistics] = useState([])
  const [summaryCharts, setSummaryCharts] = useState(emptyCharts)
  const [directories, setDirectories] = useState({
    branches: [],
    courses: [],
    classes: [],
    teachers: []
  })
  const [studentDataLoaded, setStudentDataLoaded] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState('')
  const [modal, setModal] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [profileVersion, setProfileVersion] = useState(0)
  const [exportRows, setExportRows] = useState([])
  const [exportBusy, setExportBusy] = useState(false)
  const studentDataRequest = useRef(null)

  const mapStudent = (student, resources) => {
    const status = studentFilters.statuses.find(
      (item) => item.value === student.status
    )
    const branch = indexById(resources.branch)[student.branchId]
    const current = resources.enrollment.filter(
      (item) => item.studentId === student.id && item.isCurrent
    )
    const classMap = indexById(resources.class)
    const courseMap = indexById(resources.course)
    const staffMap = indexById(resources.staff)
    const classroomIds = new Set(current.map((item) => item.classId))
    const parent =
      resources['student-guardian'].find(
        (item) => item.studentId === student.id && item.isPrimary
      ) ||
      resources['student-guardian'].find(
        (item) => item.studentId === student.id
      )
    const join = (values) =>
      [...new Set(values.filter(Boolean))].join(' · ') || '—'
    return {
      ...student,
      avatar: initials(student.name),
      gender: { male: 'Nam', female: 'Nữ' }[student.gender] || student.gender,
      branch: branch?.name || '—',
      parent: parent?.name || '',
      guardianId: parent?.id,
      guardianRelationship: parent?.relationship,
      guardianIsPrimary: parent?.isPrimary,
      parentPhone: parent?.phone || '',
      courseId: classMap[current[0]?.classId]?.courseId || '',
      classId: current[0]?.classId || '',
      enrollments: current.map((item) => ({
        ...item,
        class: classMap[item.classId]
      })),
      course: join(
        current.map((item) => courseMap[classMap[item.classId]?.courseId]?.name)
      ),
      className: join(current.map((item) => classMap[item.classId]?.name)),
      teacher: join(
        resources['class-staff']
          .filter((item) => classroomIds.has(item.classId))
          .map((item) => staffMap[item.staffId]?.name)
      ),
      status: status?.label || student.status,
      statusValue: student.status
    }
  }

  const refreshStudents = () => {
    if (studentDataRequest.current) return studentDataRequest.current
    setStudentsLoading(true)
    setStudentsError('')
    const resources = [
      'student',
      'branch',
      'course',
      'class',
      'staff',
      'student-guardian',
      'enrollment',
      'class-staff'
    ]
    studentDataRequest.current = Promise.all(
      resources.map(async (name) => [name, await listAllResource(name)])
    )
      .then((entries) => {
        const result = Object.fromEntries(entries)
        const mapped = result.student
          .filter((item) => !item.deletedAt)
          .map((item) => mapStudent(item, result))
        setDirectories({
          branches: result.branch,
          courses: result.course,
          classes: result.class
            .filter((item) => !item.deletedAt)
            .map((item) => ({
              ...item,
              branchIds: [
                ...new Set(
                  result['class-staff']
                    .filter((link) => link.classId === item.id)
                    .map(
                      (link) => indexById(result.staff)[link.staffId]?.branchId
                    )
                    .filter(Boolean)
                )
              ],
              teacherNames: result['class-staff']
                .filter((link) => link.classId === item.id)
                .map((link) => indexById(result.staff)[link.staffId]?.name)
                .filter(Boolean)
                .join(', ')
            })),
          teachers: result.staff.filter(
            (item) => item.type?.toLowerCase() === 'teacher'
          )
        })
        setStudentItems(mapped)
        setSelectedStudent(
          (current) =>
            mapped.find((item) => item.id === current?.id) || mapped[0] || null
        )
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
      if (!result?.statistics || !result?.charts)
        throw new Error('Dữ liệu tổng quan không đúng định dạng')
      const statistics = result.statistics
      const charts = result.charts
      const count = (value) =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        Number.isFinite(Number(value))
          ? Number(value).toLocaleString('vi-VN')
          : '—'
      const rows = (items) =>
        Array.isArray(items)
          ? items.filter(
              (item) =>
                item.value !== null &&
                item.value !== undefined &&
                Number.isFinite(Number(item.value))
            )
          : []
      const distribution = rows(charts.statusDistribution)
      const statusTotal = distribution.reduce(
        (sum, item) => sum + Number(item.value),
        0
      )
      setSummaryStatistics(
        studentStatistics.map((item) => ({
          ...item,
          value: count(statistics[item.field])
        }))
      )
      setSummaryCharts({
        monthly: rows(charts.monthlyEnrollment).map((item) => ({
          month: item.label,
          students: Number(item.value)
        })),
        status: distribution.map((item) => ({
          name: item.label,
          value: statusTotal
            ? Math.round((Number(item.value) / statusTotal) * 100)
            : 0,
          fill: statusColor(item.status, 'student')
        })),
        courses: rows(charts.courseDistribution).map((item) => ({
          name: item.name,
          value: Number(item.value)
        })),
        branches: rows(charts.branchDistribution).map((item) => ({
          name: item.name,
          value: Number(item.value)
        }))
      })
    } catch (error) {
      setSummaryStatistics([])
      setSummaryCharts(emptyCharts)
      setSummaryError(error.message)
      throw error
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    refreshSummary().catch((error) =>
      toast.error(`Không tải được tổng quan học viên: ${error.message}`)
    )
  }, [])

  useEffect(() => {
    if (activeTab !== 'dashboard' && !studentDataLoaded) {
      refreshStudents().catch((error) =>
        toast.error(`Không tải được học viên từ API: ${error.message}`)
      )
    }
  }, [activeTab, studentDataLoaded])

  const handleModalSubmit = async (type, values, student) => {
    let warnings = []
    let successMessage = 'Đã lưu học viên'
    if (type === 'delete') {
      await deleteResource('student', student.id)
      successMessage = 'Đã xóa học viên'
    } else if (type === 'add' || type === 'edit') {
      const result = await saveStudent(type, values, student, {
        canAssignSale,
        classes: directories.classes
      })
      warnings = result.warnings
    } else if (type === 'create-account') {
      const account = await createStudentAccount(student, values.email)
      successMessage = `Đã tạo tài khoản học sinh: ${account.email}`
    } else if (type === 'import') {
      const result = await importStudents(values.file?.[0])
      setImportResult(result)
      successMessage = `Import hoàn tất: tạo ${result.summary.created}, bỏ qua ${result.summary.skipped} dòng`
    } else {
      await performStudentOperation(type, student, values)
      successMessage = {
        transfer: 'Đã chuyển lớp',
        reserve: 'Đã bảo lưu học viên',
        stop: 'Đã ghi nhận nghỉ học',
        extend: 'Đã gia hạn thời gian học'
      }[type]
    }
    // The write is complete. A refresh error must not leave a form that repeats it.
    setModal(null)
    setProfileVersion((value) => value + 1)
    toast.success(successMessage)
    warnings.forEach((warning) => toast.warning(warning, { duration: 10000 }))
    const refreshed = await Promise.allSettled([
      refreshStudents(),
      refreshSummary()
    ])
    if (refreshed.some((result) => result.status === 'rejected'))
      toast.warning(
        'Thao tác đã lưu. Chưa tải lại đủ dữ liệu; vui lòng bấm Thử lại ở phần báo lỗi.'
      )
  }

  const handleOpenModal = async (type, student = selectedStudent) => {
    if (type === 'import') {
      setModal(type)
      return
    }
    try {
      const operation = [
        'transfer',
        'reserve',
        'stop',
        'extend',
        'create-account'
      ].includes(type)
      const loaded =
        !studentDataLoaded || operation ? await refreshStudents() : studentItems
      const selected =
        type === 'add' ? null : loaded.find((item) => item.id === student?.id)
      if (type !== 'add' && !selected)
        throw new Error(
          'Không tìm thấy học viên. Vui lòng chọn lại trong danh sách.'
        )
      if (
        type === 'create-account' &&
        (!canAssignSale || selected.hasAccount !== false)
      )
        throw new Error(
          'Học viên đã có tài khoản hoặc bạn chưa có quyền tạo tài khoản.'
        )
      if (type !== 'add') setSelectedStudent(selected)
      setModal(type)
    } catch (error) {
      toast.error(`Không tải được dữ liệu biểu mẫu: ${error.message}`)
    }
  }

  const handleExport = async (format) => {
    if (!exportRows.length) {
      toast.info('Không có học viên để xuất')
      return
    }
    setExportBusy(true)
    try {
      if (format === 'excel') {
        await exportStudentsExcel(exportRows)
        toast.success('Đã xuất danh sách Excel')
      } else {
        toast.info('Chọn Lưu dưới dạng PDF trong hộp thoại in.')
        await exportStudentsPdf(exportRows)
      }
    } catch (error) {
      toast.error(`Không xuất được danh sách: ${error.message}`)
    } finally {
      setExportBusy(false)
    }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setActiveTab('profile')
  }

  const effectiveFilters = {
    ...studentFilters,
    branches:
      directories.branches?.map((item) => item.name) || studentFilters.branches,
    courses:
      directories.courses?.map((item) => item.name) || studentFilters.courses,
    classes:
      directories.classes?.map((item) => item.name) || studentFilters.classes,
    teachers:
      directories.teachers?.map((item) => item.name) || studentFilters.teachers
  }

  return (
    <div className="space-y-6">
      <StudentHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenModal={handleOpenModal}
        canManage={canAssignSale}
        onExport={handleExport}
        exportBusy={exportBusy}
        canExport={
          activeTab === 'list' &&
          studentDataLoaded &&
          !studentsLoading &&
          !studentsError
        }
      />
      {importResult ? (
        <StudentImportResult
          result={importResult}
          onClose={() => setImportResult(null)}
        />
      ) : null}
      {activeTab === 'dashboard' ? (
        summaryLoading ? (
          <LoadingSkeleton label="Đang tải tổng quan học viên…" rows={4} />
        ) : summaryError ? (
          <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            {summaryError}{' '}
            <button
              type="button"
              className="ml-3 underline"
              onClick={() => refreshSummary().catch(() => {})}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <StudentDashboard
            statistics={summaryStatistics}
            charts={summaryCharts}
            onOpenStudents={() => {
              setKeyword('')
              setActiveTab('list')
            }}
          />
        )
      ) : null}
      {activeTab !== 'dashboard' && studentsLoading ? (
        <LoadingSkeleton label="Đang tải danh sách học viên…" rows={4} />
      ) : null}
      {activeTab !== 'dashboard' && studentsError ? (
        <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
          {studentsError}{' '}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => refreshStudents().catch(() => {})}
          >
            Thử lại
          </button>
        </div>
      ) : null}
      {activeTab === 'list' && !studentsLoading && !studentsError ? (
        <StudentTable
          students={studentItems}
          filters={effectiveFilters}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelectStudent={handleSelectStudent}
          onOpenModal={handleOpenModal}
          canManage={canAssignSale}
          onExportRowsChange={setExportRows}
          onExport={handleExport}
          exportBusy={exportBusy}
        />
      ) : null}
      {activeTab === 'profile' && !studentsLoading && !studentsError ? (
        <StudentProfile
          key={`${selectedStudent?.id || 'empty'}-${profileVersion}`}
          student={selectedStudent}
          tabs={profileTabs}
          canManage={canAssignSale}
          onOpenModal={handleOpenModal}
        />
      ) : null}
      {modal === 'create-account' && selectedStudent ? (
        <StudentAccountModal
          key={selectedStudent.id}
          student={selectedStudent}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
        />
      ) : null}
      <StudentModal
        modal={['add', 'edit', 'delete'].includes(modal) ? modal : null}
        configs={modalConfigs}
        selectedStudent={modal === 'add' ? null : selectedStudent}
        filters={effectiveFilters}
        directories={directories}
        canAssignSale={canAssignSale}
        onClose={() => setModal(null)}
        onSubmit={handleModalSubmit}
      />
      {['import', 'transfer', 'reserve', 'stop', 'extend'].includes(modal) ? (
        <StudentOperationModal
          key={`${modal}-${selectedStudent?.id || 'import'}`}
          type={modal}
          student={selectedStudent}
          classes={directories.classes}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
        />
      ) : null}
    </div>
  )
}

export default StudentPage
