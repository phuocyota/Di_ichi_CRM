import dayjs from 'dayjs'
import { AlertTriangle, CalendarCheck2, Clock3, Filter, UserRoundX } from 'lucide-react'

function ScheduleSidebar({
  filters,
  values,
  todaySchedules,
  upcomingSchedules,
  conflictSchedules,
  teacherLeaves,
  onFilterChange,
  onClearFilters,
  onSelectEvent,
}) {
  const inputClass = 'mt-2 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const labelClass = 'text-xs font-black uppercase tracking-wide text-slate-500'

  const renderSelect = (key, label, options) => (
    <label className="block" key={key}>
      <span className={labelClass}>{label}</span>
      <select className={inputClass} value={values[key] || ''} onChange={(event) => onFilterChange(key, event.target.value)}>
        <option value="">Tất cả</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label

          return <option key={value} value={value}>{optionLabel}</option>
        })}
      </select>
    </label>
  )

  const renderScheduleList = (items, emptyText) => (
    <div className="space-y-2">
      {items.length ? items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-blue-300 hover:bg-blue-50"
          onClick={() => onSelectEvent(item)}
        >
          <p className="truncate text-sm font-black text-slate-900">{item.className}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {dayjs(item.start).format('DD/MM HH:mm')} · {item.teacher}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-600">{item.room} · {item.branch}</p>
        </button>
      )) : (
        <p className="rounded-xl border border-dashed border-gray-300 p-3 text-sm font-semibold text-slate-500">
          {emptyText}
        </p>
      )}
    </div>
  )

  return (
    <aside className="space-y-4 rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-900">
            <Filter size={16} aria-hidden="true" />
            Bộ lọc
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Lọc theo cơ sở, lớp, giáo viên và thời gian.</p>
        </div>
        <button type="button" className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50" onClick={onClearFilters}>
          Xóa lọc
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {renderSelect('branch', 'Cơ sở', filters.branches)}
        {renderSelect('course', 'Khóa học', filters.courses)}
        {renderSelect('className', 'Lớp học', filters.classes)}
        {renderSelect('teacher', 'Giáo viên', filters.teachers)}
        {renderSelect('room', 'Phòng học', filters.rooms)}
        {renderSelect('status', 'Trạng thái', filters.statuses)}
        {renderSelect('range', 'Khoảng thời gian', filters.ranges)}
      </div>

      <div className="space-y-4">
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
            <CalendarCheck2 size={16} className="text-blue-600" aria-hidden="true" />
            Lớp học hôm nay
          </h3>
          {renderScheduleList(todaySchedules, 'Không có lớp học hôm nay.')}
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
            <Clock3 size={16} className="text-amber-600" aria-hidden="true" />
            Lớp sắp diễn ra
          </h3>
          {renderScheduleList(upcomingSchedules.slice(0, 3), 'Chưa có lớp sắp diễn ra.')}
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
            <AlertTriangle size={16} className="text-red-600" aria-hidden="true" />
            Lịch học bị trùng
          </h3>
          {renderScheduleList(conflictSchedules, 'Không phát hiện lịch bị trùng.')}
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
            <UserRoundX size={16} className="text-violet-600" aria-hidden="true" />
            Giáo viên nghỉ
          </h3>
          <div className="space-y-2">
            {teacherLeaves.map((item) => (
              <div key={item.id} className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-800">
                <p className="font-black">{item.teacher}</p>
                <p className="mt-1 text-xs font-bold">{item.time}</p>
                <p className="mt-1 text-xs font-semibold">{item.reason}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}

export default ScheduleSidebar
