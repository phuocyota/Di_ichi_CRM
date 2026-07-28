import { CalendarPlus, ChevronLeft, ChevronRight, Download, ListFilter } from 'lucide-react'
import dayjs from 'dayjs'

function ScheduleHeader({
  calendarTitle,
  currentView,
  statistics,
  onToday,
  onPrev,
  onNext,
  onViewChange,
  onOpenModal,
}) {
  const viewOptions = [
    { key: 'timeGridDay', label: 'Theo ngày' },
    { key: 'timeGridWeek', label: 'Theo tuần' },
    { key: 'dayGridMonth', label: 'Theo tháng' },
  ]

  const statTone = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Quản lý Lịch học</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            Quản lý Lịch học
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
            Điều phối lớp học, giáo viên, phòng học và điểm danh theo lịch vận hành của trung tâm.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:min-w-[720px]">
          {statistics.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border px-4 py-3 shadow-sm ${statTone[item.tone] || statTone.blue}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">{item.label}</p>
              <p className="mt-2 text-2xl font-black">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 overflow-x-auto rounded-xl border border-gray-300 bg-slate-50 p-3">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100"
            onClick={onToday}
          >
            Hôm nay
          </button>
          <div className="inline-flex shrink-0 items-center rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Tháng trước"
              title="Tháng trước"
              onClick={onPrev}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Tháng sau"
              title="Tháng sau"
              onClick={onNext}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <span className="whitespace-nowrap px-3 text-sm font-black text-slate-900">
              {calendarTitle || dayjs().format('MMMM YYYY')}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="inline-flex shrink-0 rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
            {viewOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className={[
                  'h-9 whitespace-nowrap rounded-lg px-3 text-sm font-bold transition',
                  currentView === option.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')}
                onClick={() => onViewChange(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={() => onOpenModal('export')}
          >
            <Download size={18} aria-hidden="true" />
            Export lịch học
          </button>
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 xl:hidden"
            onClick={() => onOpenModal('filters')}
          >
            <ListFilter size={18} aria-hidden="true" />
            Bộ lọc
          </button>
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            onClick={() => onOpenModal('create')}
          >
            <CalendarPlus size={18} aria-hidden="true" />
            Tạo lịch học mới
          </button>
        </div>
      </div>
    </section>
  )
}

export default ScheduleHeader
