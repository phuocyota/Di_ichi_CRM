import { BarChart3, CalendarRange, FileDown, FileSpreadsheet, Filter, Printer, RefreshCw, Search, Share2 } from 'lucide-react'

function ReportHeader({ activeTab, tabs, keyword, filters, onTabChange, onKeywordChange, onOpenModal, onExportPdf, onPrint, onRefresh }) {
  const periodLabels = { day: 'Ngày', week: 'Tuần', month: 'Tháng', quarter: 'Quý', year: 'Năm', range: 'Khoảng thời gian' }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Báo cáo & Thống kê</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Báo cáo & Thống kê</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
            Bảng điều hành dành cho Ban giám đốc: theo dõi tuyển sinh, học viên, giáo viên, tài chính và lớp học theo thời gian thực.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3 py-2">
              <CalendarRange size={15} aria-hidden="true" />
              {periodLabels[filters.period] || 'Tháng'}
            </span>
            {filters.branch ? <span className="rounded-xl border border-gray-300 bg-slate-50 px-3 py-2">{filters.branch}</span> : null}
            {filters.course ? <span className="rounded-xl border border-gray-300 bg-slate-50 px-3 py-2">{filters.course}</span> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[620px]">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3">
              <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Tìm báo cáo, cơ sở, lớp học, giáo viên"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
              />
            </div>
            <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700" onClick={() => onOpenModal('filter')}>
              <Filter size={18} aria-hidden="true" />
              Bộ lọc
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-5">
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-emerald-700" onClick={() => onOpenModal('export')}>
              <FileSpreadsheet size={17} aria-hidden="true" />
              Xuất
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-red-700" onClick={onExportPdf}>
              <FileDown size={17} aria-hidden="true" />
              PDF
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-blue-700" onClick={onPrint}>
              <Printer size={17} aria-hidden="true" />
              In
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-cyan-700" onClick={() => onOpenModal('share')}>
              <Share2 size={17} aria-hidden="true" />
              Chia sẻ
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-indigo-700" onClick={onRefresh}>
              <RefreshCw size={17} aria-hidden="true" />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={[
              'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition',
              activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
            onClick={() => onTabChange(tab.key)}
          >
            <BarChart3 size={16} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export default ReportHeader
