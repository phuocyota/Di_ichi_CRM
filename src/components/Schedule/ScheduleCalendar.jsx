import { WorkspaceTable } from '../common/WorkspaceView.jsx'
import { ActionDropdown, StatusBadge } from '../common/ui.jsx'
import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import dayjs from 'dayjs'
import viLocale from '@fullcalendar/core/locales/vi'
import {
  CalendarDays,
  Clock,
  DoorOpen,
  Eye,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Table2,
  Trash2
} from 'lucide-react'

function ScheduleCalendar({
  calendarRef,
  events,
  statuses,
  initialView,
  onDatesSet,
  onEventClick,
  onEventDoubleClick,
  onEventChange,
  onOpenModal
}) {
  const [activeTab, setActiveTab] = useState('calendar')
  useEffect(() => {
    if (activeTab === 'calendar') calendarRef.current?.getApi().updateSize()
  }, [activeTab, calendarRef])
  const statusMap = statuses.reduce(
    (result, item) => ({ ...result, [item.value]: item }),
    {}
  )

  const calendarEvents = events.map((event) => {
    const status = statusMap[event.status] || statusMap.active

    return {
      id: event.id,
      title: event.className,
      start: event.start,
      end: event.end,
      backgroundColor: status.color,
      borderColor: status.color,
      extendedProps: event
    }
  })

  const renderEventContent = ({ event, timeText }) => {
    const item = event.extendedProps

    return (
      <div className="min-w-0 space-y-1 overflow-hidden px-1 py-0.5 text-[11px] leading-tight">
        <div className="truncate font-semibold">{item.className}</div>
        <div className="truncate font-semibold opacity-95">{item.course}</div>
        <div className="flex min-w-0 items-center gap-1 truncate opacity-95">
          <GraduationCap size={12} aria-hidden="true" />
          <span className="truncate">{item.teacher}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1 truncate opacity-95">
          <DoorOpen size={12} aria-hidden="true" />
          <span className="truncate">{item.room}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1 truncate font-semibold opacity-95">
          <Clock size={12} aria-hidden="true" />
          <span className="truncate">
            {timeText ||
              `${dayjs(item.start).format('HH:mm')} - ${dayjs(item.end).format('HH:mm')}`}
          </span>
        </div>
      </div>
    )
  }

  const handleEventMount = ({ event, el }) => {
    const item = event.extendedProps
    const status = statusMap[item.status]?.label || item.status
    el.title = [
      item.className,
      item.course,
      `Giáo viên: ${item.teacher}`,
      `Phòng: ${item.room}`,
      `Cơ sở: ${item.branch}`,
      `Thời gian: ${dayjs(item.start).format('DD/MM/YYYY HH:mm')} - ${dayjs(item.end).format('HH:mm')}`,
      `Trạng thái: ${status}`
    ].join('\n')
  }

  const emitEventChange = (changeInfo, action) => {
    onEventChange({
      id: changeInfo.event.id,
      start: dayjs(changeInfo.event.start).format('YYYY-MM-DDTHH:mm:ss'),
      end: dayjs(changeInfo.event.end).format('YYYY-MM-DDTHH:mm:ss'),
      action
    })
  }

  return (
    <section className="schedule-calendar min-w-0 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 rounded-xl border border-gray-300 bg-slate-50 p-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
            {[
              { key: 'calendar', label: 'Lịch biểu', icon: CalendarDays },
              { key: 'table', label: 'Bảng lịch học', icon: Table2 }
            ].map((tab) => {
              const Icon = tab.icon

              return (
                <button
                  key={tab.key}
                  type="button"
                  className={[
                    'inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition',
                    activeTab === tab.key
                      ? 'bg-red-50 text-red-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  ].join(' ')}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon size={16} aria-hidden="true" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'table' ? (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              onClick={() => onOpenModal('create', null)}
            >
              <Plus size={17} aria-hidden="true" />
              Thêm lịch học
            </button>
          ) : null}
        </div>

        {activeTab === 'calendar' ? (
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((status) => (
              <span
                key={status.value}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                {status.label}
              </span>
            ))}
            <span className="ml-auto hidden items-center gap-1 text-xs font-semibold text-slate-500 lg:inline-flex">
              <MapPin size={14} aria-hidden="true" />
              Kéo thả để đổi lịch, kéo cạnh sự kiện để đổi thời lượng
            </span>
          </div>
        ) : null}
      </div>

      <div hidden={activeTab !== 'calendar'}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={viLocale}
          initialView={initialView}
          headerToolbar={false}
          allDaySlot={false}
          nowIndicator
          editable
          selectable
          eventResizableFromStart
          dayMaxEvents
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:30:00"
          slotDuration="00:30:00"
          expandRows
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          events={calendarEvents}
          eventContent={renderEventContent}
          datesSet={onDatesSet}
          eventClick={(info) => onEventClick(info.event.extendedProps)}
          eventDrop={(info) => emitEventChange(info, 'drop')}
          eventResize={(info) => emitEventChange(info, 'resize')}
          dateClick={(info) => onEventDoubleClick(null, info.dateStr)}
          eventDidMount={(info) => {
            handleEventMount(info)
            let lastClick = 0
            info.el.addEventListener('click', () => {
              const now = Date.now()
              if (now - lastClick < 320) {
                onEventDoubleClick(info.event.extendedProps)
              }
              lastClick = now
            })
          }}
        />
      </div>
      {activeTab === 'table' && (
        <WorkspaceTable
          rows={events}
          columns={[
            [
              'className',
              'Lớp / khóa học',
              (item) => (
                <div>
                  <button
                    type="button"
                    className="ui-identity-name hover:underline"
                    onClick={() => onEventClick(item)}
                  >
                    {item.className}
                  </button>
                  <span className="ui-identity-code">
                    {item.classCode} · {item.course}
                  </span>
                </div>
              )
            ],
            ['teacher', 'Giáo viên'],
            ['room', 'Phòng học'],
            ['branch', 'Cơ sở'],
            [
              'start',
              'Thời gian',
              (item) => (
                <div>
                  {dayjs(item.start).format('DD/MM/YYYY')}
                  <span className="ui-identity-code">
                    {dayjs(item.start).format('HH:mm')} –{' '}
                    {dayjs(item.end).format('HH:mm')}
                  </span>
                </div>
              )
            ],
            [
              'status',
              'Trạng thái',
              (item) => <StatusBadge value={item.status} context="schedule" />
            ],
            [
              'actions',
              'Thao tác',
              (item) => (
                <ActionDropdown
                  compact
                  label={`Thao tác lịch ${item.className}`}
                  items={[
                    {
                      label: 'Xem chi tiết',
                      icon: Eye,
                      onClick: () => onEventClick(item)
                    },
                    {
                      label: 'Sửa lịch học',
                      icon: Pencil,
                      onClick: () => onOpenModal('edit', item)
                    },
                    {
                      label: 'Xóa lịch học',
                      icon: Trash2,
                      danger: true,
                      onClick: () => onOpenModal('delete', item)
                    }
                  ]}
                />
              )
            ]
          ]}
        />
      )}
    </section>
  )
}

export default ScheduleCalendar
