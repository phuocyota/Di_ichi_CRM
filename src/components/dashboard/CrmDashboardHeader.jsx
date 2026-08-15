const dashboardTabs = [
  { key: 'overview', label: 'Tổng quan CRM' },
  { key: 'leads', label: 'Danh sách Lead' },
  { key: 'customers', label: 'Khách hàng' },
  { key: 'care', label: 'Lịch chăm sóc' },
]

function CrmDashboardHeader({ activeTab, onTabChange }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div>
        <div>
          <nav className="text-sm font-semibold text-slate-500">
            Admin Portal / <span className="text-blue-700">Dashboard CRM</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Dashboard CRM</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Theo dõi Lead, khách hàng và lịch chăm sóc trong một không gian làm việc.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {dashboardTabs.map((tab) => (
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

export default CrmDashboardHeader
