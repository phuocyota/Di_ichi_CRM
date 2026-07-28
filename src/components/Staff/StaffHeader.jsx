import { FileDown, FileSpreadsheet, Mail, Printer, Search, Upload, UserPlus } from 'lucide-react'

function StaffHeader({
  activeTab,
  onTabChange,
  activeGroup,
  onGroupChange,
  groups,
  tabs,
  keyword,
  onKeywordChange,
  onOpenModal,
}) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Quản lý Nhân sự</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý Nhân sự</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Quản lý giáo viên, nhân viên, tài khoản, phân công lớp và KPI vận hành trung tâm.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[560px]">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3">
              <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Tìm mã, họ tên, email, số điện thoại"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              onClick={() => onOpenModal('add')}
            >
              <UserPlus size={18} aria-hidden="true" />
              Thêm nhân sự
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-emerald-700" onClick={() => onOpenModal('import')}>
              <Upload size={17} aria-hidden="true" />
              Import
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-emerald-700" onClick={() => onOpenModal('exportExcel')}>
              <FileSpreadsheet size={17} aria-hidden="true" />
              Excel
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-red-700" onClick={() => onOpenModal('exportPdf')}>
              <FileDown size={17} aria-hidden="true" />
              PDF
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-blue-700" onClick={() => onOpenModal('printProfile')}>
              <Printer size={17} aria-hidden="true" />
              In hồ sơ
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={[
                'shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition',
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.key}
              type="button"
              className={[
                'rounded-xl px-4 py-2 text-sm font-bold transition',
                activeGroup === group.key ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
              onClick={() => onGroupChange(group.key)}
            >
              {group.label}
            </button>
          ))}
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('email')}>
            <Mail size={16} aria-hidden="true" />
            Gửi Email
          </button>
        </div>
      </div>
    </section>
  )
}

export default StaffHeader
