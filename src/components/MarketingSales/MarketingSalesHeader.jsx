import { Megaphone, Search } from 'lucide-react'

function MarketingSalesHeader({ activeTab, tabs, keyword, onKeywordChange, onTabChange }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Marketing & Sale</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Marketing & Sale</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
            Theo dõi nguồn lead, campaign và hiệu suất sale từ lead đến học thử, đăng ký và đóng học phí.
          </p>
        </div>

        <div className="flex h-11 w-full items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3 xl:w-[420px]">
          <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
          <input
            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Tìm nguồn, campaign, sale, mã lead"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        </div>
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
            <Megaphone size={16} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export default MarketingSalesHeader
