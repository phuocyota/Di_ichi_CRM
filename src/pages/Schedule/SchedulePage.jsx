import { useMemo, useRef, useState } from 'react'
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
  conflictSchedules,
  scheduleFilters,
  scheduleModalConfigs,
  schedules,
  scheduleStatistics,
  scheduleStatuses,
  teacherLeaves,
  teachers,
  todaySchedules,
  upcomingSchedules,
} from '../../datas/schedules.js'

function SchedulePage() {
  const calendarRef = useRef(null)
  const [scheduleItems, setScheduleItems] = useState(schedules)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [modal, setModal] = useState(null)
  const [modalEvent, setModalEvent] = useState(null)
  const [currentView, setCurrentView] = useState('timeGridWeek')
  const [calendarTitle, setCalendarTitle] = useState('')
  const [filters, setFilters] = useState({})

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

      if (filters.range === 'Hôm nay') checks.push(dayjs(item.start).isSame('2026-07-28', 'day'))
      if (filters.range === '7 ngày tới') checks.push(dayjs(item.start).isBefore(dayjs('2026-07-28').add(8, 'day')))
      if (filters.range === 'Tháng này') checks.push(dayjs(item.start).isSame('2026-07-28', 'month'))

      return checks.every(Boolean)
    })
  }, [filters, scheduleItems])

  const dynamicStatistics = useMemo(() => {
    return scheduleStatistics.map((item) => {
      if (item.label === 'Lớp hôm nay') return { ...item, value: scheduleItems.filter((schedule) => dayjs(schedule.start).isSame('2026-07-28', 'day')).length }
      if (item.label === 'Đã điểm danh') return { ...item, value: scheduleItems.filter((schedule) => schedule.status === 'checked').length }
      if (item.label === 'Sắp diễn ra') return { ...item, value: scheduleItems.filter((schedule) => schedule.status === 'upcoming').length }
      if (item.label === 'Lịch bị trùng') return { ...item, value: scheduleItems.filter((schedule) => schedule.status === 'conflict').length }

      return item
    })
  }, [scheduleItems])

  const sidebarToday = scheduleItems.filter((schedule) => dayjs(schedule.start).isSame('2026-07-28', 'day'))
  const sidebarUpcoming = scheduleItems.filter((schedule) => dayjs(schedule.start).isAfter('2026-07-28T23:59:59'))
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
    const selectedRoom = classrooms.find((item) => item.name === values.room)
    const date = values.date || dayjs(sourceEvent?.start).format('YYYY-MM-DD')

    return {
      ...(sourceEvent || {}),
      id: sourceEvent?.id || `SCH${Date.now()}`,
      classId: selectedClass.id,
      classCode: selectedClass.code,
      className: values.className || selectedClass.name,
      course: values.course || selectedClass.course,
      teacher: values.teacher || selectedClass.teacher,
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

  const handleModalSubmit = (type, values, event) => {
    if (type === 'create' || type === 'makeup') {
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

  return (
    <div className="space-y-5">
      <ScheduleHeader
        calendarTitle={calendarTitle}
        currentView={currentView}
        statistics={dynamicStatistics}
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
          onDatesSet={(info) => {
            setCalendarTitle(info.view.title)
            setCurrentView(info.view.type)
          }}
          onEventClick={setSelectedEvent}
          onEventDoubleClick={handleDoubleClick}
          onEventChange={handleCalendarEventChange}
          onOpenModal={openModal}
        />
        <ScheduleSidebar
          filters={scheduleFilters}
          values={filters}
          todaySchedules={sidebarToday.length ? sidebarToday : todaySchedules}
          upcomingSchedules={sidebarUpcoming.length ? sidebarUpcoming : upcomingSchedules}
          conflictSchedules={sidebarConflicts.length ? sidebarConflicts : conflictSchedules}
          teacherLeaves={teacherLeaves}
          onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
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
        filters={scheduleFilters}
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
