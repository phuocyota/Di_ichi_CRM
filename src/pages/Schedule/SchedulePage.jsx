import { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import ScheduleCalendar from '../../components/Schedule/ScheduleCalendar.jsx'
import ScheduleEventDetail from '../../components/Schedule/ScheduleEventDetail.jsx'
import ScheduleHeader from '../../components/Schedule/ScheduleHeader.jsx'
import ScheduleModal from '../../components/Schedule/ScheduleModal.jsx'
import ScheduleSidebar from '../../components/Schedule/ScheduleSidebar.jsx'
import {
  classrooms,
  classes,
  schedules,
  scheduleFilters,
  scheduleModalConfigs,
  scheduleStatistics,
  scheduleStatuses,
  teacherLeaves,
  teachers,
} from '../../datas/schedules.js'
import { createResource, deleteResource, findIdByName, getScheduleSummary, indexById, updateResource } from '../../services/crmApi.js'

const scheduleSummaryRequests = new Map()
const scheduleStorageKey = 'diichi-crm-schedules'

function requestScheduleSummary(params) {
  const key = JSON.stringify(params)
  if (!scheduleSummaryRequests.has(key)) {
    const request = getScheduleSummary(params).finally(() => scheduleSummaryRequests.delete(key))
    scheduleSummaryRequests.set(key, request)
  }
  return scheduleSummaryRequests.get(key)
}

function SchedulePage() {
  const calendarRef = useRef(null)
  const scheduleRangeRef = useRef(null)
  const scheduleRequestId = useRef(0)
  const [scheduleItems, setScheduleItems] = useState(() => {
    try {
      const stored = localStorage.getItem(scheduleStorageKey)
      return stored ? JSON.parse(stored) : schedules
    } catch {
      return schedules
    }
  })
  const [summaryStatistics, setSummaryStatistics] = useState(
    scheduleStatistics.map((item) => ({ ...item, value: 0 })),
  )
  const [teacherLeaveItems, setTeacherLeaveItems] = useState(teacherLeaves)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [modal, setModal] = useState(null)
  const [modalEvent, setModalEvent] = useState(null)
  const [currentView, setCurrentView] = useState('timeGridWeek')
  const [calendarTitle, setCalendarTitle] = useState('')
  const [filters, setFilters] = useState({})
  const [apiDirectories, setApiDirectories] = useState({})

  useEffect(() => {
    localStorage.setItem(scheduleStorageKey, JSON.stringify(scheduleItems))
  }, [scheduleItems])

  const refreshSchedules = async (range = scheduleRangeRef.current) => {
    if (!range) return

    const requestId = ++scheduleRequestId.current
    const result = await requestScheduleSummary(range)
    if (requestId !== scheduleRequestId.current) return

    const options = result?.filterOptions || {}
    const branchIndex = indexById(options.branches)
    setApiDirectories({
      classes: options.classes || [],
      courses: options.courses || [],
      teachers: options.teachers || [],
      rooms: (options.rooms || []).map((item) => ({
        ...item,
        branch: branchIndex[item.branchId]?.name || '',
      })),
      branches: options.branches || [],
    })

    const statistics = result?.statistics || {}
    const statisticValues = [
      statistics.todayClasses ?? scheduleItems.filter((item) => dayjs(item.start).isSame(dayjs(), 'day')).length,
      statistics.checkedClasses ?? scheduleItems.filter((item) => item.status === 'checked').length,
      statistics.upcomingClasses ?? scheduleItems.filter((item) => dayjs(item.start).isAfter(dayjs())).length,
      statistics.conflictClasses ?? scheduleItems.filter((item) => item.status === 'conflict').length,
    ]
    setSummaryStatistics(
      scheduleStatistics.map((item, index) => ({ ...item, value: statisticValues[index] })),
    )
    setTeacherLeaveItems(result?.teacherLeaves?.length ? result.teacherLeaves : teacherLeaves)
  }

  const filteredSchedules = useMemo(() => {
    return scheduleItems.filter((item) => {
      const checks = [
        !filters.branch || item.branch === filters.branch,
        !filters.course || item.course === filters.course,
        !filters.className || item.className === filters.className,
        !filters.teacher || item.teacher === filters.teacher,
        !filters.room || item.room === filters.room,
        !filters.status || item.status === filters.status,
      ]

      if (filters.range === 'Hôm nay') checks.push(dayjs(item.start).isSame(dayjs(), 'day'))
      if (filters.range === '7 ngày tới') checks.push(dayjs(item.start).isAfter(dayjs().startOf('day')) && dayjs(item.start).isBefore(dayjs().add(8, 'day')))
      if (filters.range === 'Tháng này') checks.push(dayjs(item.start).isSame(dayjs(), 'month'))

      return checks.every(Boolean)
    })
  }, [filters, scheduleItems])

  const sidebarToday = scheduleItems.filter((schedule) => dayjs(schedule.start).isSame(dayjs(), 'day'))
  const sidebarUpcoming = scheduleItems.filter((schedule) => dayjs(schedule.start).isAfter(dayjs().endOf('day')))
  const sidebarConflicts = scheduleItems.filter((schedule) => schedule.status === 'conflict')

  const getCalendarApi = () => calendarRef.current?.getApi()

  const openModal = (type, event = selectedEvent) => {
    if (type === 'filters') return
    setModal(type)
    setModalEvent(type === 'create' ? null : event)
  }

  const closeModal = () => {
    setModal(null)
    setModalEvent(null)
  }

  const handleViewChange = (view) => {
    setCurrentView(view)
    getCalendarApi()?.changeView(view)
  }

  const buildScheduleFromValues = (values, sourceEvent) => {
    const selectedClass = classes.find((item) => item.name === values.className) || classes[0]
    const selectedRoom = classrooms.find((item) => item.name === values.room) || classrooms.find((item) => item.id === selectedClass.roomId)
    const selectedTeacher = teachers.find((item) => item.name === values.teacher) || teachers.find((item) => item.id === selectedClass.teacherId)
    const date = values.date || dayjs(sourceEvent?.start).format('YYYY-MM-DD')

    return {
      ...(sourceEvent || {}),
      id: sourceEvent?.id || `SCH${Date.now()}`,
      classId: selectedClass.id,
      classCode: selectedClass.code,
      className: values.className || selectedClass.name,
      courseId: selectedClass.courseId || sourceEvent?.courseId,
      course: values.course || selectedClass.course,
      teacherId: selectedTeacher?.id || selectedClass.teacherId || sourceEvent?.teacherId,
      teacher: values.teacher || selectedClass.teacher,
      roomId: selectedRoom?.id || selectedClass.roomId || sourceEvent?.roomId,
      room: values.room || selectedClass.room,
      branch: values.branch || selectedRoom?.branch || selectedClass.branch,
      start: `${date}T${values.startTime || '18:00'}:00`,
      end: `${date}T${values.endTime || '20:00'}:00`,
      status: values.status || sourceEvent?.status || 'upcoming',
      attendance: sourceEvent?.attendance || { checked: 0, pending: 0, excused: 0, absent: 0 },
      students: sourceEvent?.students || [],
      homework: sourceEvent?.homework || [],
      lessonNote: values.reason || sourceEvent?.lessonNote || 'Nội dung buổi học sẽ được cập nhật.',
      teacherNote: sourceEvent?.teacherNote || 'Chưa có ghi chú của giáo viên.',
    }
  }

  const buildFullCourseSchedules = (values) => {
    const selectedClass = classes.find((item) => item.name === values.className) || classes[0]
    const seed = buildScheduleFromValues(values, null)
    const totalSessions = Math.max(Number(selectedClass.sessions || 1), 1)

    return Array.from({ length: totalSessions }, (_, index) => ({
      ...seed,
      id: `SCH${Date.now()}-${index + 1}`,
      sessionNo: index + 1,
      start: dayjs(seed.start).add(index, 'week').format('YYYY-MM-DDTHH:mm:ss'),
      end: dayjs(seed.end).add(index, 'week').format('YYYY-MM-DDTHH:mm:ss'),
      lessonNote: `${seed.lessonNote} Buổi ${index + 1}/${totalSessions}.`,
    }))
  }

  const handleModalSubmit = async (type, values, event) => {
    if (apiDirectories.classes?.length && event?.id && !String(event.id).startsWith('SCH')) {
      try {
      if (['create', 'makeup', 'edit'].includes(type)) {
        const classItem = apiDirectories.classes?.find((item) => item.name === values.className)
        const payload = {
          classId: classItem?.id || event?.classId,
          teacherId: findIdByName(apiDirectories.teachers, values.teacher) || event?.teacherId,
          roomId: findIdByName(apiDirectories.rooms, values.room) || event?.roomId,
          branchId: findIdByName(apiDirectories.branches, values.branch) || event?.branchId,
          startAt: `${values.date}T${values.startTime}:00`,
          endAt: `${values.date}T${values.endTime}:00`,
          status: type === 'makeup' ? 'makeup' : values.status,
          lessonNote: values.reason || undefined,
          parentScheduleId: type === 'makeup' ? event?.id : undefined,
        }
        if (type === 'edit') await updateResource('schedule', event.id, payload)
        else await createResource('schedule', payload)
        await refreshSchedules()
        toast.success(type === 'edit' ? 'Đã cập nhật lịch học' : 'Đã tạo lịch học')
        closeModal()
        return
      }
      if (type === 'delete') {
        await deleteResource('schedule', event.id)
        await refreshSchedules()
        toast.success('Đã xóa lịch học')
        closeModal()
        return
      }
      if (['changeTime', 'changeRoom', 'changeTeacher', 'cancel', 'confirm'].includes(type)) {
        const payload = {}
        if (type === 'changeTime') {
          payload.startAt = `${values.date}T${values.startTime}:00`
          payload.endAt = `${values.date}T${values.endTime}:00`
        }
        if (type === 'changeRoom') payload.roomId = findIdByName(apiDirectories.rooms, values.room)
        if (type === 'changeTeacher') payload.teacherId = findIdByName(apiDirectories.teachers, values.teacher)
        if (type === 'cancel') Object.assign(payload, { status: 'cancelled', teacherNote: values.reason, cancelledAt: new Date().toISOString() })
        if (type === 'confirm') Object.assign(payload, { startAt: event.start, endAt: event.end })
        await updateResource('schedule', event.id, payload)
        await refreshSchedules()
        toast.success('Đã cập nhật lịch học')
        closeModal()
        return
      }
      } catch (error) {
        toast.error(error.message)
        return
      }
    }

    if (type === 'create' || type === 'makeup') {
      if (type === 'create' && values.repeatFullCourse) {
        const fullCourseSchedules = buildFullCourseSchedules(values)
        setScheduleItems((items) => [...items, ...fullCourseSchedules])
        toast.success(`Đã tạo ${fullCourseSchedules.length} buổi học cho toàn khóa`)
        closeModal()
        return
      }

      const nextSchedule = buildScheduleFromValues({ ...values, status: type === 'makeup' ? 'makeup' : values.status }, null)
      setScheduleItems((items) => [...items, nextSchedule])
      toast.success(type === 'makeup' ? 'Đã tạo buổi học bù' : 'Đã tạo lịch học mới')
    } else if (type === 'edit') {
      const nextSchedule = buildScheduleFromValues(values, event)
      setScheduleItems((items) => items.map((item) => (item.id === event.id ? nextSchedule : item)))
      setSelectedEvent(nextSchedule)
      toast.success('Đã cập nhật lịch học')
    } else if (type === 'changeTime') {
      setScheduleItems((items) => items.map((item) => (
        item.id === event.id
          ? { ...item, start: `${values.date}T${values.startTime}:00`, end: `${values.date}T${values.endTime}:00` }
          : item
      )))
      toast.success('Đã đổi giờ học')
    } else if (type === 'changeRoom') {
      setScheduleItems((items) => items.map((item) => (item.id === event.id ? { ...item, room: values.room } : item)))
      toast.success('Đã đổi phòng học')
    } else if (type === 'changeTeacher') {
      setScheduleItems((items) => items.map((item) => (item.id === event.id ? { ...item, teacher: values.teacher } : item)))
      toast.success('Đã đổi giáo viên')
    } else if (type === 'cancel') {
      setScheduleItems((items) => items.map((item) => (item.id === event.id ? { ...item, status: 'cancelled', teacherNote: values.reason } : item)))
      toast.success('Đã hủy buổi học')
    } else if (type === 'delete') {
      setScheduleItems((items) => items.filter((item) => item.id !== event.id))
      setSelectedEvent(null)
      toast.success('Đã xóa lịch học')
    } else if (type === 'duplicate') {
      setScheduleItems((items) => [...items, { ...event, id: `SCH${Date.now()}`, start: dayjs(event.start).add(1, 'day').format('YYYY-MM-DDTHH:mm:ss'), end: dayjs(event.end).add(1, 'day').format('YYYY-MM-DDTHH:mm:ss'), status: 'upcoming' }])
      toast.success('Đã sao chép lịch học sang ngày kế tiếp')
    } else if (type === 'recurring') {
      const seed = buildScheduleFromValues(values, event)
      const repeatCount = Number(values.repeatWeeks || 1)
      const recurringItems = Array.from({ length: repeatCount }, (_, index) => ({
        ...seed,
        id: `SCH${Date.now()}-${index}`,
        start: dayjs(seed.start).add(index, 'week').format('YYYY-MM-DDTHH:mm:ss'),
        end: dayjs(seed.end).add(index, 'week').format('YYYY-MM-DDTHH:mm:ss'),
      }))
      setScheduleItems((items) => [...items, ...recurringItems])
      toast.success('Đã tạo lịch lặp theo tuần')
    } else if (type === 'homework') {
      const homework = {
        id: `HW${Date.now()}`,
        title: values.homeworkTitle,
        deadline: values.homeworkDeadline,
        status: values.homeworkStatus || 'Đã giao',
      }
      setScheduleItems((items) => items.map((item) => (item.id === event.id ? { ...item, homework: [...item.homework, homework] } : item)))
      toast.success('Đã giao Homework')
    } else if (type === 'notify') {
      toast.success('Đã gửi thông báo cho lớp')
    } else if (type === 'attendance') {
      toast.success('Đã mở phiên điểm danh')
    } else if (type === 'export') {
      toast.success(`Đã export lịch học dạng ${values.exportFormat}`)
    } else if (type === 'confirm') {
      toast.success('Đã xác nhận thay đổi lịch')
    }

    closeModal()
  }

  const handleCalendarEventChange = ({ id, start, end }) => {
    const changedEvent = scheduleItems.find((item) => item.id === id)
    const nextEvent = changedEvent ? { ...changedEvent, start, end } : null
    setScheduleItems((items) => items.map((item) => (item.id === id ? { ...item, start, end } : item)))
    setSelectedEvent(nextEvent)
    setModalEvent(nextEvent)
    setModal('confirm')
  }

  const handleDoubleClick = (event, dateStr) => {
    if (event) {
      openModal('edit', event)
      return
    }

    openModal('create', {
      start: `${dateStr.slice(0, 10)}T18:00:00`,
      end: `${dateStr.slice(0, 10)}T20:00:00`,
    })
  }

  const handleDatesSet = (info) => {
    setCalendarTitle(info.view.title)
    setCurrentView(info.view.type)

    const range = {
      startAt: info.start.toISOString(),
      endAt: info.end.toISOString(),
    }
    const currentRange = scheduleRangeRef.current
    if (currentRange?.startAt === range.startAt && currentRange?.endAt === range.endAt) return

    scheduleRangeRef.current = range
    refreshSchedules(range)
      .catch((error) => toast.error(`Không tải được lịch học từ API: ${error.message}`))
  }

  const filteredClassOptions = filters.course
    ? classes.filter((item) => item.course === filters.course)
    : classes

  const effectiveFilters = {
    ...scheduleFilters,
    branches: scheduleFilters.branches,
    courses: scheduleFilters.courses,
    classes: filteredClassOptions.map((item) => item.name),
    teachers: scheduleFilters.teachers,
    rooms: scheduleFilters.rooms,
  }

  const handleSidebarFilterChange = (key, value) => {
    setFilters((current) => {
      if (key === 'course') return { ...current, course: value, className: '' }
      return { ...current, [key]: value }
    })
  }

  return (
    <div className="space-y-5">
      <ScheduleHeader
        calendarTitle={calendarTitle}
        currentView={currentView}
        statistics={summaryStatistics}
        onToday={() => getCalendarApi()?.today()}
        onPrev={() => getCalendarApi()?.prev()}
        onNext={() => getCalendarApi()?.next()}
        onViewChange={handleViewChange}
        onOpenModal={openModal}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ScheduleCalendar
          calendarRef={calendarRef}
          events={filteredSchedules}
          statuses={scheduleStatuses}
          initialView={currentView}
          onDatesSet={handleDatesSet}
          onEventClick={setSelectedEvent}
          onEventDoubleClick={handleDoubleClick}
          onEventChange={handleCalendarEventChange}
          onOpenModal={openModal}
        />
        <ScheduleSidebar
          filters={effectiveFilters}
          values={filters}
          todaySchedules={sidebarToday}
          upcomingSchedules={sidebarUpcoming}
          conflictSchedules={sidebarConflicts}
          teacherLeaves={teacherLeaveItems}
          onFilterChange={handleSidebarFilterChange}
          onClearFilters={() => setFilters({})}
          onSelectEvent={setSelectedEvent}
        />
      </div>

      <ScheduleEventDetail
        event={selectedEvent}
        statuses={scheduleStatuses}
        onClose={() => setSelectedEvent(null)}
        onOpenModal={openModal}
      />

      <ScheduleModal
        modal={modal}
        event={modalEvent}
        configs={scheduleModalConfigs}
        filters={effectiveFilters}
        classes={classes}
        teachers={teachers}
        classrooms={classrooms}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  )
}

export default SchedulePage
