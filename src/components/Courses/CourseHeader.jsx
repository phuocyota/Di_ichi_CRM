import { BookOpen, Plus, Search } from 'lucide-react'

function CourseHeader({
  activeTab,
  tabs,
  keyword,
  filters,
  filterValues,
  onTabChange,
  onKeywordChange,
  onFilterChange,
  onAdd,
  showAdd = true,
}) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Quản lý khóa học</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý khóa học</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Quản lý danh mục khóa học, lớp được mở và kết quả học tập của từng học viên.
          </p>
        </div>

        {showAdd ? (
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            onClick={onAdd}
          >
            <Plus size={18} aria-hidden="true" />
            Thêm mới
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={[
              'inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition',
              activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
            onClick={() => onTabChange(tab.key)}
          >
            <BookOpen size={16} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(420px,1fr)_repeat(3,minmax(170px,220px))]">
          <label className="block">
            <span className="text-xs font-black uppercase text-slate-500">Tìm kiếm</span>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 shadow-sm">
              <Search size={18} className="text-blue-600" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Tìm theo tên, mã khóa học, lớp hoặc học viên"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
              />
            </div>
          </label>

          {filters.map((filter) => (
            <label key={filter.key} className="block">
              <span className="text-xs font-black uppercase text-slate-500">{filter.label}</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none"
                value={filterValues[filter.key] || ''}
                onChange={(event) => onFilterChange(filter.key, event.target.value)}
              >
                <option value="">Tất cả</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CourseHeader
