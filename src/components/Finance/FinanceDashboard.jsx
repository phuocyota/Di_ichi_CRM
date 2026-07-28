import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const formatCurrency = (value) => `${Math.round(value / 1000000)}M`

function FinanceDashboard({ statistics, reports, transactions, onOpenModal }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon

          return (
            <article key={item.label} className={`rounded-xl border p-5 shadow-sm ${item.color}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold opacity-80">{item.label}</p>
                  <p className="mt-2 text-3xl font-black">{item.value}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/75 shadow-sm">
                  <Icon size={23} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold opacity-75">{item.description}</p>
            </article>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Doanh thu theo ngày</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Theo dõi doanh thu trong 7 ngày gần nhất.</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reports.dailyRevenue} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Tỷ lệ phương thức thanh toán</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">QR, tiền mặt, chuyển khoản và thẻ.</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                <Pie data={reports.paymentRatio} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                  {reports.paymentRatio.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {reports.paymentRatio.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}
                </span>
                <span className="font-black text-slate-950">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Doanh thu theo khóa học</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.byCourse} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Doanh thu theo cơ sở</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.byBranch} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Công nợ theo trạng thái</h2>
          <div className="mt-4 space-y-3">
            {reports.debtStatus.map((item) => (
              <div key={item.name} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-slate-700">{item.name}</span>
                  <span className="text-xl font-black text-slate-950">{formatCurrency(item.value)}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(item.value / 80000, 100)}%`, backgroundColor: item.fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">Giao dịch gần đây</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Các phiếu thu và khoản thanh toán mới nhất.</p>
          </div>
          <button type="button" className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700" onClick={() => onOpenModal('createReceipt')}>
            Tạo phiếu thu
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-300">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã giao dịch</th>
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Khóa học</th>
                <th className="px-4 py-3">Phải thu</th>
                <th className="px-4 py-3">Đã đóng</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.slice(0, 5).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-bold text-blue-700">{item.code}</td>
                  <td className="px-4 py-3 font-black text-slate-950">{item.student}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{item.course}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{formatCurrency(item.payable)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{formatCurrency(item.paid)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default FinanceDashboard
