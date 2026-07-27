import { CalendarCheck, TrendingUp } from 'lucide-react'

function DashboardHero({ summary }) {
  return (
    <section className="mb-6 overflow-hidden rounded-md border border-red-100 bg-[linear-gradient(135deg,#b91c1c_0%,#ef4444_48%,#f97316_100%)] text-white shadow-enterprise">
      <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-100">
            Tổng quan vận hành
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            Quản lý trung tâm Di-Ichi trong một bảng điều khiển trực quan.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50">
            Theo dõi tuyển sinh, lớp học, doanh thu và các công việc cần xử lý trong ngày.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-white/15 p-4 ring-1 ring-white/20">
            <CalendarCheck size={22} aria-hidden="true" />
            <p className="mt-3 text-2xl font-bold">{summary.todayClasses}</p>
            <p className="mt-1 text-xs font-medium text-red-50">Lớp học hôm nay</p>
          </div>
          <div className="rounded-md bg-white/15 p-4 ring-1 ring-white/20">
            <TrendingUp size={22} aria-hidden="true" />
            <p className="mt-3 text-2xl font-bold">{summary.conversionRate}</p>
            <p className="mt-1 text-xs font-medium text-red-50">Tỷ lệ chuyển đổi</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardHero
