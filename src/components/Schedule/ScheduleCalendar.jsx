import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import dayjs from 'dayjs'
import viLocale from '@fullcalendar/core/locales/vi'
import { CalendarDays, Clock, DoorOpen, Eye, GraduationCap, MapPin, Pencil, Plus, Table2, Trash2 } from 'lucide-react'

function ScheduleCalendar({
  calendarRef,
  events,
  statuses,
  initialView,
  onDatesSet,
  onEventClick,
  onEventDoubleClick,
  onEventChange,
  onOpenModal,
}) {
  const [activeTab, setActiveTab] = useState('calendar')
  const statusMap = statuses.reduce((result, item) => ({ ...result, [item.value]: item }), {})

  const calendarEvents = events.map((event) => {
    const status = statusMap[event.status] || statusMap.active

    return {
      id: event.id,
      title: event.className,
      start: event.start,
      end: event.end,
      backgroundColor: status.color,
      borderColor: status.color,
      extendedProps: event,
    }
  })

  const renderEventContent = ({ event, timeText }) => {
    const item = event.extendedProps

    return (
      <div className="min-w-0 space-y-1 overflow-hidden px-1 py-0.5 text-[11px] leading-tight">
        <div className="truncate font-black">{item.className}</div>
        <div className="truncate font-semibold opacity-95">{item.course}</div>
        <div className="flex min-w-0 items-center gap-1 truncate opacity-95">
          <GraduationCap size={12} aria-hidden="true" />
          <span className="truncate">{item.teacher}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1 truncate opacity-95">
          <DoorOpen size={12} aria-hidden="true" />
          <span className="truncate">{item.room}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1 truncate font-bold opacity-95">
          <Clock size={12} aria-hidden="true" />
          <span className="truncate">{timeText || `${dayjs(item.start).format('HH:mm')} - ${dayjs(item.end).format('HH:mm')}`}</span>
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
      `Trạng thái: ${status}`,
    ].join('\n')
  }

  const emitEventChange = (changeInfo, action) => {
    onEventChange({
      id: changeInfo.event.id,
      start: dayjs(changeInfo.event.start).format('YYYY-MM-DDTHH:mm:ss'),
      end: dayjs(changeInfo.event.end).format('YYYY-MM-DDTHH:mm:ss'),
      action,
    })
  }

  return (
    <section className="schedule-calendar min-w-0 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 rounded-xl border border-gray-300 bg-slate-50 p-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
            {[
              { key: 'calendar', label: 'Calendar', icon: CalendarDays },
              { key: 'table', label: 'Bảng lịch học', icon: Table2 },
            ].map((tab) => {
              const Icon = tab.icon

              return (
                <button
                  key={tab.key}
                  type="button"
                  className={[
                    'inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold transition',
                    activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
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
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-bold ${status.className}`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }} />
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

      {activeTab === 'calendar' ? (
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
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
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
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Lớp học</th>
                  <th className="px-4 py-3">Khóa học</th>
                  <th className="px-4 py-3">Giáo viên</th>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="px-4 py-3">Cơ sở</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((item) => {
                  const status = statusMap[item.status]

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-black text-slate-900">{item.className}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{item.classCode}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{item.course}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{item.teacher}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{item.room}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{item.branch}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {dayjs(item.start).format('DD/MM/YYYY HH:mm')} - {dayjs(item.end).format('HH:mm')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-xl border px-2 py-1 text-xs font-black ${status?.className || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                          {status?.label || item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-100"
                            title="Xem chi tiết"
                            aria-label="Xem chi tiết"
                            onClick={() => onEventClick(item)}
                          >
                            <Eye size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-blue-700 shadow-sm hover:bg-blue-50"
                            title="Sửa lịch học"
                            aria-label="Sửa lịch học"
                            onClick={() => onOpenModal('edit', item)}
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100"
                            title="Xóa lịch học"
                            aria-label="Xóa lịch học"
                            onClick={() => onOpenModal('delete', item)}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

export default ScheduleCalendar
