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
  studentAttendanceSessions,
  studentCertificateItems,
  studentFilters,
  studentHistoryItems,
  studentHomeworkItems,
  studentScoreItems,
  studentStatistics,
  studentTuitionItems,
  students,
} from '../../datas/students.js'
import { createResource, deleteResource, findIdByName, getStudentSummary, indexById, initials, loadResources, updateResource } from '../../services/crmApi.js'

const statusColors = {
  active: '#10b981',
  reserved: '#f59e0b',
  stopped: '#ef4444',
  completed: '#8b5cf6',
}

const emptyStatistics = studentStatistics.map((item) => ({ ...item, value: 0 }))
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
  const [activeTab, setActiveTab] = useState('dashboard')
  const [keyword, setKeyword] = useState('')
  const [studentItems, setStudentItems] = useState(students)
  const [selectedStudent, setSelectedStudent] = useState(students[0])
  const [summaryStatistics, setSummaryStatistics] = useState(emptyStatistics)
  const [summaryCharts, setSummaryCharts] = useState(emptyCharts)
  const [directories, setDirectories] = useState({ branches: [], courses: [], classes: [], teachers: [] })
  const [studentDataLoaded, setStudentDataLoaded] = useState(false)
  const [modal, setModal] = useState(null)
  const studentDataRequest = useRef(null)

  const mapStudent = (student, branchItems) => {
    const status = studentFilters.statuses.find((item) => item.value === student.status)
    const branch = indexById(branchItems)[student.branchId]
    return {
      ...student,
      avatar: initials(student.name),
      gender: { male: 'Nam', female: 'Nữ' }[student.gender] || student.gender,
      branch: branch?.name || student.branchId,
      status: status?.label || student.status,
      statusValue: student.status,
      attendance: '—',
      score: '—',
      homework: '—',
      tuition: '—',
      certificate: '—',
    }
  }

  const refreshStudents = () => {
    if (studentDataRequest.current) return studentDataRequest.current

    studentDataRequest.current = loadResources(['student', 'branch', 'course', 'class', 'staff'])
      .then((result) => {
        const mapped = result.student.map((item) => mapStudent(item, result.branch))
        setDirectories({
          branches: result.branch,
          courses: result.course,
          classes: result.class,
          teachers: result.staff.filter((item) => item.type === 'teacher'),
        })
        setStudentItems(mapped)
        setSelectedStudent((current) => mapped.find((item) => item.id === current?.id) || mapped[0] || null)
        setStudentDataLoaded(true)
      })
      .finally(() => {
        studentDataRequest.current = null
      })

    return studentDataRequest.current
  }

  const refreshSummary = async () => {
    const result = await requestStudentSummary()
    const statistics = result?.statistics || {}
    const charts = result?.charts || {}
    const statisticFields = ['totalStudents', 'activeStudents', 'reservedStudents', 'stoppedStudents', 'completedStudents']
    const statusTotal = (charts.statusDistribution || []).reduce((sum, item) => sum + Number(item.value || 0), 0)

    setSummaryStatistics(studentStatistics.map((item, index) => ({
      ...item,
      value: Number(statistics[statisticFields[index]] || 0).toLocaleString('vi-VN'),
    })))
    setSummaryCharts({
      monthly: (charts.monthlyEnrollment || []).map((item) => ({ month: item.label, students: Number(item.value || 0) })),
      status: (charts.statusDistribution || []).map((item) => ({
        name: item.label,
        value: statusTotal ? Math.round((Number(item.value || 0) / statusTotal) * 100) : 0,
        fill: statusColors[item.status] || '#64748b',
      })),
      courses: (charts.courseDistribution || []).map((item) => ({ name: item.name, value: Number(item.value || 0) })),
      branches: (charts.branchDistribution || []).map((item) => ({ name: item.name, value: Number(item.value || 0) })),
    })
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
        const payload = {
          code: values.code || `HV-${Date.now()}`,
          branchId: findIdByName(directories.branches, values.branch),
          name: values.name,
          gender: { Nam: 'male', Nữ: 'female' }[values.gender] || values.gender || null,
          birthDate: values.birthDate || undefined,
          phone: values.phone || undefined,
          email: values.email || undefined,
          status: values.statusValue || 'active',
          enrollmentDate: values.enrollmentDate || undefined,
          note: values.reason || null,
        }
        const saved = type === 'add'
          ? await createResource('student', payload)
          : await updateResource('student', student.id, payload)
        if (type === 'add' && values.parent && values.parentPhone) {
          await createResource('student-guardian', { studentId: saved.id, name: values.parent, phone: values.parentPhone, relationship: 'Phụ huynh', isPrimary: true })
        }
        if (type === 'add' && values.className) {
          await createResource('enrollment', { studentId: saved.id, classId: findIdByName(directories.classes, values.className), enrolledAt: values.enrollmentDate, status: 'active', isCurrent: true })
        }
      } else {
        toast.info('Backend hiện chưa có endpoint nghiệp vụ tương ứng')
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
    if (!studentDataLoaded) {
      try {
        await refreshStudents()
      } catch (error) {
        toast.error(`Không tải được dữ liệu biểu mẫu: ${error.message}`)
        return
      }
    }
    setSelectedStudent(student || studentItems[0])
    setModal(type)
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
        <StudentDashboard statistics={summaryStatistics} charts={summaryCharts} />
      ) : null}
      {activeTab === 'list' ? (
        <StudentTable
          students={studentItems}
          filters={effectiveFilters}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelectStudent={handleSelectStudent}
          onOpenModal={handleOpenModal}
        />
      ) : null}
      {activeTab === 'profile' ? (
        <StudentProfile
          student={selectedStudent}
          tabs={profileTabs}
          attendanceSessions={studentAttendanceSessions}
          scoreItems={studentScoreItems}
          homeworkItems={studentHomeworkItems}
          tuitionItems={studentTuitionItems}
          historyItems={studentHistoryItems}
          certificateItems={studentCertificateItems}
        />
      ) : null}
      <StudentModal
        modal={modal}
        configs={modalConfigs}
        selectedStudent={modal === 'add' ? null : selectedStudent}
        filters={effectiveFilters}
        onClose={() => setModal(null)}
        onSubmit={handleModalSubmit}
      />
    </div>
  )
}

export default StudentPage
