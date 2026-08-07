import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import ClassDashboard from '../../components/Classes/ClassDashboard.jsx'
import ClassDetail from '../../components/Classes/ClassDetail.jsx'
import ClassHeader from '../../components/Classes/ClassHeader.jsx'
import ClassModal from '../../components/Classes/ClassModal.jsx'
import ClassTable from '../../components/Classes/ClassTable.jsx'
import {
  classDetailTabs,
  classAttendanceSessions,
  classDocumentItems,
  classFilters,
  classHomeworkItems,
  classModalConfigs,
  classNotificationItems,
  classSchedules,
  classScoreItems,
  classStatistics,
  classStudents,
} from '../../datas/classes.js'
import { createResource, deleteResource, findIdByName, getClassSummary, indexById, loadResources, updateResource } from '../../services/crmApi.js'

let classSummaryRequest

function requestClassSummary() {
  if (!classSummaryRequest) {
    classSummaryRequest = getClassSummary().finally(() => {
      classSummaryRequest = null
    })
  }
  return classSummaryRequest
}

const emptyClassSummary = {
  statistics: classStatistics.map((item) => ({ ...item, value: 0 })),
  charts: { monthly: [], status: [] },
}

function ClassPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [keyword, setKeyword] = useState('')
  const [classItems, setClassItems] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [classDataLoaded, setClassDataLoaded] = useState(false)
  const [classSummary, setClassSummary] = useState(emptyClassSummary)
  const [directories, setDirectories] = useState({})
  const [modal, setModal] = useState(null)

  const refreshClasses = useCallback(async (force = false) => {
    if (!force && classDataLoaded) return classItems
    const result = await loadResources(['class', 'course', 'enrollment', 'class-room', 'room', 'class-staff', 'staff', 'class-weekly-schedule', 'branch'])
    const courses = indexById(result.course)
    const rooms = indexById(result.room)
    const staffs = indexById(result.staff)
    const branches = indexById(result.branch)
    const mapped = result.class.map((item) => {
      const roomLink = result['class-room'].find((link) => link.classId === item.id)
      const staffLink = result['class-staff'].find((link) => link.classId === item.id && link.role === 'teacher')
      const weekly = result['class-weekly-schedule'].filter((entry) => entry.classId === item.id)
      const room = rooms[roomLink?.roomId]
      const status = classFilters.statuses.find((entry) => entry.value === item.status)
      return {
        ...item,
        course: courses[item.courseId]?.name || item.courseId,
        teacher: staffs[staffLink?.staffId]?.name || '—',
        room: room?.name || '—',
        branch: branches[room?.branchId]?.name || '—',
        currentSize: result.enrollment.filter((entry) => entry.classId === item.id && entry.isCurrent).length,
        schedule: weekly.length ? `${weekly.map((entry) => entry.weekday === 7 ? 'CN' : `T${entry.weekday + 1}`).join('-')} ${String(weekly[0].startTime).slice(0, 5)}` : '—',
        status: status?.label || item.status,
        statusValue: item.status,
      }
    })
    setDirectories({ courses: result.course, teachers: result.staff.filter((item) => item.type === 'teacher'), rooms: result.room, branches: result.branch, classes: result.class })
    setClassItems(mapped)
    setSelectedClass((current) => mapped.find((item) => item.id === current?.id) || mapped[0] || null)
    setClassDataLoaded(true)
    return mapped
  }, [classDataLoaded, classItems])

  useEffect(() => {
    requestClassSummary()
      .then((result) => {
        const statistics = result?.statistics || result?.summary || {}
        const charts = result?.charts || {}
        const values = [
          statistics.totalClasses ?? 0,
          statistics.activeClasses ?? 0,
          statistics.upcomingClasses ?? 0,
          statistics.finishedClasses ?? 0,
        ]

        setClassSummary({
          statistics: classStatistics.map((item, index) => ({ ...item, value: values[index] })),
          charts: {
            monthly: charts.monthlyClasses || charts.monthly || [],
            status: charts.statusDistribution || charts.status || [],
          },
        })
      })
      .catch((error) => toast.error(`Không tải được tổng quan lớp học: ${error.message}`))
  }, [])

  useEffect(() => {
    if ((activeTab !== 'list' && activeTab !== 'detail') || classDataLoaded) return

    refreshClasses().catch((error) => toast.error(`Không tải được lớp học từ API: ${error.message}`))
  }, [activeTab, classDataLoaded, refreshClasses])

  const handleModalSubmit = async (type, values, classItem) => {
    try {
      if (type === 'delete') {
        await deleteResource('class', classItem.id)
      } else if (type === 'create' || type === 'edit') {
        const payload = {
          code: values.code || `CLS-${Date.now()}`,
          courseId: findIdByName(directories.courses, values.course),
          name: values.name,
          maxSize: Number(values.maxSize),
          startDate: values.startDate,
          endDate: values.endDate,
          status: classItem?.statusValue || 'upcoming',
          note: values.reason || undefined,
        }
        const saved = type === 'create'
          ? await createResource('class', payload)
          : await updateResource('class', classItem.id, payload)

        if (type === 'create') {
          const roomId = findIdByName(directories.rooms, values.room)
          const staffId = findIdByName(directories.teachers, values.teacher)
          if (roomId) await createResource('class-room', { classId: saved.id, roomId })
          if (staffId) await createResource('class-staff', { classId: saved.id, staffId, role: 'teacher' })
          const weekdayMap = { 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6, 'Chủ nhật': 7 }
          for (const day of values.scheduleDays || []) {
            await createResource('class-weekly-schedule', { classId: saved.id, weekday: weekdayMap[day], startTime: values.startTime, endTime: values.endTime })
          }
        }
      } else {
        toast.info('Backend hiện chưa có endpoint nghiệp vụ tương ứng')
        setModal(null)
        return
      }
      await refreshClasses(true)
      toast.success(type === 'delete' ? 'Đã xóa lớp học' : 'Đã lưu lớp học')
      setModal(null)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleOpenModal = async (type, classItem = selectedClass) => {
    try {
      const availableClasses = classDataLoaded ? classItems : await refreshClasses()
      setSelectedClass(classItem || availableClasses?.[0] || null)
      setModal(type)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSelectClass = (classItem) => {
    setSelectedClass(classItem)
    setActiveTab('detail')
  }

  const effectiveFilters = {
    ...classFilters,
    courses: directories.courses?.map((item) => item.name) || classFilters.courses,
    teachers: directories.teachers?.map((item) => item.name) || classFilters.teachers,
    rooms: directories.rooms?.map((item) => item.name) || classFilters.rooms,
    branches: directories.branches?.map((item) => item.name) || classFilters.branches,
  }

  return (
    <div className="space-y-5">
      <ClassHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onOpenModal={handleOpenModal}
      />
      {activeTab === 'dashboard' ? (
        <ClassDashboard statistics={classSummary.statistics} charts={classSummary.charts} />
      ) : null}
      {activeTab === 'list' ? (
        <ClassTable
          classes={classItems}
          filters={effectiveFilters}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelectClass={handleSelectClass}
          onOpenModal={handleOpenModal}
        />
      ) : null}
      {activeTab === 'detail' ? (
        <ClassDetail
          classItem={selectedClass}
          tabs={classDetailTabs}
          students={classStudents}
          schedules={classSchedules}
          attendanceSessions={classAttendanceSessions}
          homeworkItems={classHomeworkItems}
          scoreItems={classScoreItems}
          notificationItems={classNotificationItems}
          documentItems={classDocumentItems}
        />
      ) : null}
      <ClassModal
        modal={modal}
        configs={classModalConfigs}
        selectedClass={modal === 'create' ? null : selectedClass}
        filters={effectiveFilters}
        onClose={() => setModal(null)}
        onSubmit={handleModalSubmit}
      />
    </div>
  )
}

export default ClassPage
