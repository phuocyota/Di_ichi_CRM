import React, { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import ScheduleCalendar from '../../components/Schedule/ScheduleCalendar.jsx'
import ScheduleEventDetail from '../../components/Schedule/ScheduleEventDetail.jsx'
import ScheduleHeader from '../../components/Schedule/ScheduleHeader.jsx'
import ScheduleModal from '../../components/Schedule/ScheduleModal.jsx'
import ScheduleSidebar from '../../components/Schedule/ScheduleSidebar.jsx'
import {
  scheduleFilters,
  scheduleModalConfigs,
  scheduleStatistics,
  scheduleStatuses
} from '../../config/schedules.js'
import {
  createResource,
  deleteResource,
  updateResource,
  initials
} from '../../services/crmApi.js'
import apiClient from '../../services/apiClient.js'
import {
  useWorkspace,
  nameOf,
  exportRows
} from '../../services/workspaceApi.js'
import {
  WorkspaceState,
  button
} from '../../components/common/WorkspaceView.jsx'

const labels = {
  present: 'Có mặt',
  late: 'Đi muộn',
  excused: 'Nghỉ phép',
  absent: 'Vắng'
}
export default function SchedulePage() {
  const workspace = useWorkspace('schedule'),
    calendar = useRef(null),
    saving = useRef(false)
  const [title, setTitle] = useState(''),
    [view, setView] = useState('timeGridWeek'),
    [filters, setFilters] = useState({}),
    [selectedId, setSelectedId] = useState(''),
    [modal, setModal] = useState(null),
    [modalEvent, setModalEvent] = useState(null),
    [busy, setBusy] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1280
  )
  useEffect(() => {
    calendar.current?.getApi().updateSize()
  }, [filtersOpen])
  const [selectedDate, setSelectedDate] = useState('')
  const d = workspace.data?.data
  const classes = useMemo(
    () =>
      (d?.class || []).map((c) => {
        const scheduled = d.schedule.find((s) => s.classId === c.id)
        const teacherId =
          scheduled?.teacherId ||
          d.classStaff.find((s) => s.classId === c.id)?.staffId
        const roomId =
          scheduled?.roomId ||
          d.classRoom.find((r) => r.classId === c.id)?.roomId
        const branchId =
          scheduled?.branchId || d.room.find((r) => r.id === roomId)?.branchId
        return {
          ...c,
          teacherId,
          roomId,
          branchId,
          course: nameOf(d.course, c.courseId),
          teacher: nameOf(d.staff, teacherId),
          room: nameOf(d.room, roomId),
          branch: nameOf(d.branch, branchId)
        }
      }),
    [d]
  )
  const events = useMemo(
    () =>
      (d?.schedule || []).map((s) => {
        const c = classes.find((c) => c.id === s.classId)
        const students = d.enrollment
          .filter((e) => e.classId === s.classId && e.isCurrent)
          .map((e) => {
            const student = d.student.find((r) => r.id === e.studentId)
            const record = d.portalAttendance.find(
              (r) => r.parentId === s.id && r.ownerId === e.studentId
            )
            const status =
              record?.content.status ||
              (d.attendanceRecord.some(
                (r) => r.scheduleId === s.id && r.studentId === e.studentId
              )
                ? 'present'
                : '')
            return {
              id: e.studentId,
              name: student?.name || '—',
              avatar: initials(student?.name),
              status: labels[status] || 'Chưa điểm danh',
              statusValue: status
            }
          })
        return {
          ...s,
          start: s.startAt,
          end: s.endAt,
          className: c?.name || '—',
          classCode: c?.code || '—',
          course: c?.course || '—',
          teacher: nameOf(d.staff, s.teacherId),
          room: nameOf(d.room, s.roomId),
          branch: nameOf(d.branch, s.branchId),
          students,
          homework: d.homework.filter((h) => h.scheduleId === s.id),
          attendance: {
            checked: students.filter((r) =>
              ['present', 'late'].includes(r.statusValue)
            ).length,
            pending: students.filter((r) => !r.statusValue).length,
            excused: students.filter((r) => r.statusValue === 'excused').length,
            absent: students.filter((r) => r.statusValue === 'absent').length
          },
          lessonNote: s.lessonNote || 'Chưa cập nhật',
          teacherNote: s.teacherNote || 'Chưa cập nhật'
        }
      }),
    [d, classes]
  )
  const selected = events.find((e) => e.id === selectedId)
  const filtered = events.filter(
    (e) =>
      ['branch', 'course', 'className', 'teacher', 'room', 'status'].every(
        (key) => !filters[key] || e[key] === filters[key]
      ) &&
      (!filters.range || filters.range === 'Hôm nay'
        ? !filters.range || dayjs(e.start).isSame(dayjs(), 'day')
        : filters.range === '7 ngày tới'
          ? dayjs(e.start).isAfter(dayjs().startOf('day')) &&
            dayjs(e.start).isBefore(dayjs().add(8, 'day'))
          : dayjs(e.start).isSame(dayjs(), 'month'))
  )
  const options = {
    ...scheduleFilters,
    branches: (d?.branch || []).map((r) => r.name),
    courses: (d?.course || []).map((r) => r.name),
    classes: classes
      .filter((c) => !filters.course || c.course === filters.course)
      .map((r) => r.name),
    teachers: (d?.staff || [])
      .filter((s) => s.type.toLowerCase() === 'teacher')
      .map((r) => r.name),
    rooms: (d?.room || []).map((r) => r.name)
  }
  const open = (type, event = selected) => {
    if (workspace.loading || busy || !d) return
    setModalEvent(event || null)
    setModal(type)
  }
  const close = () => {
    if (!saving.current) {
      if (modal === 'confirm') workspace.reload().catch(() => {})
      setModal(null)
      setModalEvent(null)
    }
  }
  async function reloadAfter() {
    try {
      await workspace.reload()
    } catch {
      toast.warning('Đã lưu thay đổi, vui lòng tải lại dữ liệu')
    }
  }
  async function submit(type, values, event) {
    if (saving.current) return
    saving.current = true
    setBusy(true)
    try {
      if (type === 'filters') {
        setFilters(values)
        setModal(null)
        return
      }
      const id = (key, value, fallback) =>
        value ? d[key].find((r) => r.id === value)?.id : fallback
      const start =
        values.date && values.startTime
          ? `${values.date}T${values.startTime}:00`
          : event?.start
      const end =
        values.date && values.endTime
          ? `${values.date}T${values.endTime}:00`
          : event?.end
      const payload = {
        classId: id('class', values.className, event?.classId),
        teacherId: id('staff', values.teacher, event?.teacherId),
        roomId: id('room', values.room, event?.roomId) || null,
        branchId: id('branch', values.branch, event?.branchId),
        startAt: start,
        endAt: end,
        status:
          type === 'makeup'
            ? 'makeup'
            : values.status || event?.status || 'upcoming',
        lessonNote: values.reason || event?.lessonNote || null
      }
      if (['create', 'makeup', 'recurring', 'duplicate'].includes(type)) {
        const count =
          type === 'recurring'
            ? Number(values.repeatWeeks || 1)
            : values.repeatFullCourse
              ? Number(values.totalSessions)
              : 1
        if (count < 1 || count > 104)
          throw new Error('Số buổi cần từ 1 đến 104')
        const schedules = Array.from({ length: count }, (_, index) => ({
          ...payload,
          startAt:
            type === 'duplicate'
              ? dayjs(event.start).add(1, 'day').toISOString()
              : dayjs(start).add(index, 'week').toISOString(),
          endAt:
            type === 'duplicate'
              ? dayjs(event.end).add(1, 'day').toISOString()
              : dayjs(end).add(index, 'week').toISOString(),
          ...(type === 'makeup' && event?.id
            ? { parentScheduleId: event.id }
            : {})
        }))
        await apiClient.post('/workspace/schedules', { schedules })
      } else if (type === 'edit')
        await updateResource('schedule', event.id, payload)
      else if (['changeTime', 'confirm'].includes(type))
        await updateResource('schedule', event.id, {
          startAt: start,
          endAt: end
        })
      else if (type === 'changeRoom')
        await updateResource('schedule', event.id, { roomId: payload.roomId })
      else if (type === 'changeTeacher')
        await updateResource('schedule', event.id, {
          teacherId: payload.teacherId
        })
      else if (type === 'cancel')
        await updateResource('schedule', event.id, {
          status: 'cancelled',
          teacherNote: values.reason || null,
          cancelledAt: new Date().toISOString()
        })
      else if (type === 'delete') {
        await deleteResource('schedule', event.id)
        setSelectedId('')
      } else if (type === 'homework')
        await createResource('homework', {
          classId: event.classId,
          scheduleId: event.id,
          title: values.homeworkTitle,
          deadline: new Date(values.homeworkDeadline).toISOString(),
          status: 'assigned'
        })
      else if (type === 'notify')
        await apiClient.post('/workspace/notify', {
          classId: event.classId,
          title: values.notifyTitle,
          content: values.notifyContent
        })
      else if (type === 'export') {
        await exportRows(
          filtered.map(
            ({ id, className, teacher, room, branch, start, end, status }) => ({
              id,
              className,
              teacher,
              room,
              branch,
              start,
              end,
              status
            })
          ),
          'lich-hoc'
        )
        setModal(null)
        return
      } else throw new Error('Vui lòng chọn thao tác hợp lệ')
      toast.success(
        type === 'notify'
          ? 'Đã tạo thông báo trong tài khoản học viên'
          : 'Đã lưu thay đổi lịch học'
      )
      setModal(null)
      setModalEvent(null)
      await reloadAfter()
    } catch (cause) {
      toast.error(cause.message)
      await reloadAfter()
    } finally {
      saving.current = false
      setBusy(false)
    }
  }
  async function attendance(studentId, status) {
    if (saving.current || !status) return
    saving.current = true
    setBusy(true)
    try {
      await apiClient.post(`/workspace/schedules/${modalEvent.id}/attendance`, {
        studentId,
        status
      })
      toast.success('Đã lưu điểm danh')
      await reloadAfter()
    } catch (cause) {
      toast.error(cause.message)
    } finally {
      saving.current = false
      setBusy(false)
    }
  }
  const attendanceEvent = events.find((e) => e.id === modalEvent?.id)
  const values = [
    events.filter((e) => dayjs(e.start).isSame(dayjs(), 'day')).length,
    events.filter((e) => e.status === 'checked').length,
    events.filter(
      (e) => dayjs(e.start).isAfter(dayjs()) && e.status !== 'cancelled'
    ).length,
    events.filter((e) => e.status === 'conflict').length
  ]
  return (
    <div className="space-y-6">
      <ScheduleHeader
        calendarTitle={title}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((value) => !value)}
        selectedDate={selectedDate}
        onDateChange={(value) => {
          setSelectedDate(value)
          calendar.current?.getApi().gotoDate(value)
        }}
        currentView={view}
        statistics={scheduleStatistics.map((s, i) => ({
          ...s,
          value: workspace.loading ? '—' : values[i]
        }))}
        onToday={() => calendar.current?.getApi().today()}
        onPrev={() => calendar.current?.getApi().prev()}
        onNext={() => calendar.current?.getApi().next()}
        onViewChange={(v) => {
          setView(v)
          calendar.current?.getApi().changeView(v)
        }}
        onOpenModal={open}
      />
      <WorkspaceState {...workspace} />
      {d && (
        <>
          <div
            className={`grid min-w-0 gap-6 ${filtersOpen ? 'xl:grid-cols-[minmax(0,1fr)_19rem]' : 'grid-cols-1'}`}
          >
            <ScheduleCalendar
              calendarRef={calendar}
              events={filtered}
              statuses={scheduleStatuses}
              initialView={view}
              onDatesSet={(info) => {
                setTitle(info.view.title)
                setSelectedDate(
                  dayjs(info.view.calendar.getDate()).format('YYYY-MM-DD')
                )
                setView(info.view.type)
              }}
              onEventClick={(e) => setSelectedId(e.id)}
              onEventDoubleClick={(e, date) =>
                open(e ? 'edit' : 'create', e || { start: date })
              }
              onEventChange={({ id, start, end }) =>
                open('confirm', {
                  ...events.find((e) => e.id === id),
                  start,
                  end
                })
              }
              onOpenModal={open}
            />
            {filtersOpen && (
              <div id="schedule-filters" className="min-w-0">
                <ScheduleSidebar
                  filters={options}
                  values={filters}
                  todaySchedules={filtered.filter((e) =>
                    dayjs(e.start).isSame(dayjs(), 'day')
                  )}
                  upcomingSchedules={filtered.filter((e) =>
                    dayjs(e.start).isAfter(dayjs().endOf('day'))
                  )}
                  conflictSchedules={filtered.filter(
                    (e) => e.status === 'conflict'
                  )}
                  teacherLeaves={workspace.data.records
                    .filter(
                      (r) => r.kind === 'teacher-leave' && r.status === 'active'
                    )
                    .map((r) => ({
                      ...r,
                      teacher: nameOf(d.staff, r.content.staffId),
                      time: r.content.time,
                      reason: r.content.note
                    }))}
                  onFilterChange={(key, value) =>
                    setFilters((current) => ({
                      ...current,
                      [key]: value,
                      ...(key === 'course' ? { className: '' } : {})
                    }))
                  }
                  onClearFilters={() => setFilters({})}
                  onSelectEvent={(e) => setSelectedId(e.id)}
                />
              </div>
            )}
          </div>
          <ScheduleEventDetail
            event={selected}
            statuses={scheduleStatuses}
            onClose={() => setSelectedId('')}
            onOpenModal={open}
          />
          {modal === 'attendance' && attendanceEvent ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
              <section
                role="dialog"
                aria-modal="true"
                aria-label="Điểm danh học viên"
                className="max-h-[85vh] w-full max-w-xl space-y-3 overflow-y-auto rounded-2xl bg-white p-6"
              >
                <header className="flex justify-between">
                  <h2 className="font-bold">
                    Điểm danh · {attendanceEvent.className}
                  </h2>
                  <button className={button} disabled={busy} onClick={close}>
                    Đóng
                  </button>
                </header>
                {attendanceEvent.students.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 text-sm"
                  >
                    <span>{s.name}</span>
                    <select
                      disabled={busy}
                      className="rounded-lg border p-2"
                      value={s.statusValue}
                      onChange={(e) => attendance(s.id, e.target.value)}
                    >
                      <option value="">Chưa điểm danh</option>
                      {Object.entries(labels).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                {!attendanceEvent.students.length && (
                  <p className="text-sm text-slate-500">
                    Chưa có học viên trong lớp.
                  </p>
                )}
              </section>
            </div>
          ) : (
            <ScheduleModal
              modal={modal}
              event={modalEvent}
              configs={scheduleModalConfigs}
              filters={options}
              classes={classes}
              teachers={d.staff.filter(
                (s) => s.type.toLowerCase() === 'teacher'
              )}
              classrooms={d.room.map((r) => ({
                ...r,
                branch: nameOf(d.branch, r.branchId)
              }))}
              branches={d.branch}
              onClose={busy ? () => {} : close}
              onSubmit={submit}
            />
          )}
        </>
      )}
    </div>
  )
}
