import { useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import viLocale from '@fullcalendar/core/locales/vi'
import { CalendarOff, Minus, Plus, RotateCcw, Repeat2 } from 'lucide-react'
import { toast } from 'sonner'
import { attendanceStatus } from '../../services/workSchedule.js'
import { DEFAULT_ZOOM_INDEX, ZOOM_LEVELS, minutesToTime, timeToMinutes, workCalendarEvents, workDayOffEvents, workTimeRange, workAssignmentFromCalendarChange, TIME_GRID_SNAP_MINUTES } from '../../services/timeGridZoom.js'
import useTimeGridZoom from './useTimeGridZoom.js'
import './WorkTimeGrid.css'

const calendarPlugins = [timeGridPlugin, interactionPlugin]
const snapDuration = { minutes: TIME_GRID_SNAP_MINUTES }

export default function WorkTimeGrid({ week, revision, assignments, shifts, people, attendance, preferences = [], disabled, editing, onAdd, onRequestAdd, onRequestDayOff, onDayOff, onDetail, onReplace, onChange }) {
  const root = useRef(null), calendar = useRef(null)
  const [gestureActive, setGestureActive] = useState(false), [savingChange, setSavingChange] = useState(false)
  const gesture = useRef(null), writeLock = useRef(false)
  const zoomBlocked = editing || gestureActive || savingChange
  const canEdit = !disabled && !editing && !savingChange && Boolean(onChange)
  const { zoomIndex, zoomLevel, zoomTo, dragging } = useTimeGridZoom(root, calendar, zoomBlocked)
  const range = useMemo(() => workTimeRange(assignments, shifts), [assignments, shifts])
  const events = useMemo(() => workCalendarEvents(assignments, people), [assignments, people])
  const offEvents = useMemo(() => workDayOffEvents(preferences, people), [preferences, people])
  const allEvents = useMemo(() => [...events, ...offEvents], [events, offEvents])
  const records = useMemo(() => new Map(attendance.map(record => [record.assignmentId, record])), [attendance])
  useEffect(() => { calendar.current?.getApi().gotoDate(week) }, [week])
  const addAt = (date, start = shifts[0]?.start || '07:30', person, selectedEnd) => {
    if (disabled) return
    const minute = timeToMinutes(start)
    const shift = shifts.find(item => minute >= timeToMinutes(item.start) && minute < timeToMinutes(item.end)) || shifts[0]
    onAdd(person, date, { start, end: selectedEnd || (shift?.end && timeToMinutes(shift.end) > minute ? shift.end : minutesToTime(Math.min(minute + 60, range.end)).slice(0, 5)), shiftId: shift?.id || '' })
  }
  const beginGesture = info => {
    gesture.current = { assignment: { ...info.event.extendedProps.assignment }, revision }
    dragging.current = true; setGestureActive(true)
  }
  const endGesture = () => { dragging.current = false; setGestureActive(false) }
  const saveCalendarChange = async info => {
    if (!canEdit || writeLock.current) { info.revert(); return }
    writeLock.current = true; setSavingChange(true)
    try {
      const original = gesture.current || { assignment: info.oldEvent.extendedProps.assignment, revision }
      await onChange(workAssignmentFromCalendarChange(original.assignment, info.event.start, info.event.end, original.revision))
    } catch (cause) { info.revert(); toast.error(cause.message) }
    finally { gesture.current = null; writeLock.current = false; setSavingChange(false) }
  }
  return <div className="work-timegrid">
    <div className="work-timegrid-toolbar">
      <div className="work-timegrid-legend" aria-label="Chú thích lịch"><strong>{assignments.length} ca làm</strong><span className="is-sale">Sale</span><span className="is-cskh">CSKH</span><span className="is-off">Ngày nghỉ</span></div>
      <div className="work-timegrid-zoom" role="group" aria-label="Thu phóng lịch làm việc">
        <button type="button" className="ui-button ui-icon-button" title="Thu nhỏ" aria-label="Thu nhỏ lịch" disabled={zoomBlocked || zoomIndex === 0} onClick={() => zoomTo(zoomIndex - 1)}><Minus size={16} /></button>
        <output aria-live="polite" aria-label="Khoảng thời gian mỗi ô">{zoomLevel.label}</output>
        <button type="button" className="ui-button ui-icon-button" title="Phóng to" aria-label="Phóng to lịch" disabled={zoomBlocked || zoomIndex === ZOOM_LEVELS.length - 1} onClick={() => zoomTo(zoomIndex + 1)}><Plus size={16} /></button>
        <button type="button" className="ui-button" title="Khôi phục 2 giờ/ô" aria-label="Khôi phục mức zoom mặc định" disabled={zoomBlocked || zoomIndex === DEFAULT_ZOOM_INDEX} onClick={() => zoomTo(DEFAULT_ZOOM_INDEX)}><RotateCcw size={14} />Mặc định</button>
        <button type="button" className="ui-button" disabled={disabled || editing || gestureActive || savingChange || !onRequestDayOff} onClick={() => onRequestDayOff(week)}><CalendarOff size={15} />Đăng ký nghỉ (OFF)</button>
        <button type="button" className="ui-button work-timegrid-add" disabled={disabled || editing || gestureActive || savingChange || !onRequestAdd} onClick={() => onRequestAdd(week)}><Plus size={16} />Thêm ca làm</button>
      </div>
    </div>
    <div className="work-timegrid-horizontal">
      <div ref={root} className="work-timegrid-calendar" data-zoom-level={zoomLevel.id} style={{ '--work-slot-height': `${zoomLevel.slotHeight}px` }}>
        <FullCalendar ref={calendar} plugins={calendarPlugins} locale={viLocale} timeZone="UTC"
          initialView="timeGridWeek" initialDate={week} firstDay={1} headerToolbar={false} height={620}
          allDaySlot allDayContent="OFF" slotMinTime={minutesToTime(range.start)} slotMaxTime={minutesToTime(range.end)}
          slotDuration={zoomLevel.duration} slotLabelInterval={zoomLevel.duration} snapDuration={snapDuration}
          slotLabelContent={arg => arg.date.toISOString().slice(11, 16)}
          dayHeaderContent={arg => <div className="work-timegrid-day"><span>{['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][arg.date.getUTCDay()]}</span><strong>{String(arg.date.getUTCDate()).padStart(2, '0')}<small>/{String(arg.date.getUTCMonth() + 1).padStart(2, '0')}</small></strong></div>}
          scrollTime={minutesToTime(range.start)} scrollTimeReset={false} expandRows={false}
          editable={canEdit} eventStartEditable={canEdit} eventDurationEditable={canEdit} eventResizableFromStart
          selectable={!disabled && !editing && !savingChange} selectMirror selectMinDistance={5}
          selectAllow={info => info.start.toISOString().slice(0, 10) === info.end.toISOString().slice(0, 10)}
          select={info => { calendar.current?.getApi().unselect(); if (info.allDay) return; addAt(info.startStr.slice(0, 10), info.startStr.slice(11, 16), undefined, info.endStr.slice(11, 16)) }}
          eventDrop={saveCalendarChange} eventResize={saveCalendarChange}
          eventMinHeight={1} slotEventOverlap={false} events={allEvents}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventClick={info => { info.jsEvent.preventDefault(); const off = info.event.extendedProps.dayOff; if (off) { if (!disabled && onDayOff) onDayOff(off) } else onDetail(info.event.extendedProps.assignment) }}
          dateClick={info => { if (!info.allDay) addAt(info.dateStr.slice(0, 10), info.dateStr.slice(11, 16)) }}
          eventDragStart={beginGesture} eventDragStop={endGesture}
          eventResizeStart={beginGesture} eventResizeStop={endGesture}
          eventDidMount={info => { if (info.event.extendedProps.dayOff) { info.el.title = `${info.event.title} · bấm để bỏ ngày nghỉ`; return } info.el.title = `${info.event.title} · ${info.event.extendedProps.assignment.start}–${info.event.extendedProps.assignment.end}` }}
          eventContent={({ event }) => {
            if (event.extendedProps.dayOff) return <div className="work-timegrid-off">{event.title}</div>
            const item = event.extendedProps.assignment
            const status = attendanceStatus(item, records.get(item.id))
            return <div className="work-timegrid-event">
              <strong>{event.title}</strong><span>{item.start}–{item.end}</span>
              <span>{item.shiftName || (item.employeeType === 'cskh' ? 'CSKH' : 'Sale')}</span>
              <small>{status.label}</small>
              <button type="button" disabled={disabled} aria-label={`Đổi nhân viên ca ${item.start} ngày ${item.date}`} onClick={e => { e.preventDefault(); e.stopPropagation(); onReplace(item) }}><Repeat2 size={12} /> Đổi nhân viên</button>
            </div>
          }} />
      </div>
    </div>
    <div className="work-timegrid-footer"><span>Nhấp vào ô trống để thêm ca · Kéo ca để đổi giờ</span><span>Ctrl/Cmd + cuộn để thu phóng</span></div>
  </div>
}
