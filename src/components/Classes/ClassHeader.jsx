import { FileDown, FileSpreadsheet, Plus, Printer, Search } from 'lucide-react'

function ClassHeader({ activeTab, onTabChange, keyword, onKeywordChange, onOpenModal }) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard lớp học' },
    { key: 'list', label: 'Danh sách lớp' },
    { key: 'detail', label: 'Chi tiết lớp' },
  ]

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Quản lý lớp học</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý lớp học</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Theo dõi lớp học, giáo viên, phòng học, sĩ số và lịch vận hành.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[540px]">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3">
              <Search size={18} className="text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none"
                placeholder="Tìm tên lớp, khóa học, giáo viên"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              onClick={() => onOpenModal('create')}
            >
              <Plus size={18} aria-hidden="true" />
              Tạo lớp
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700" type="button">
              <FileSpreadsheet size={17} /> Export Excel
            </button>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700" type="button">
              <FileDown size={17} /> Export PDF
            </button>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700" type="button">
              <Printer size={17} /> In danh sách
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={[
              'rounded-xl px-4 py-2 text-sm font-bold transition',
              activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export default ClassHeader
