function FinanceHeader({ activeTab, tabs, onTabChange }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Quản lý tài chính</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý tài chính</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Quản lý học phí, thu tiền, công nợ và doanh thu từ học phí.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 xl:justify-end">
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
      </div>
    </section>
  )
}

export default FinanceHeader
