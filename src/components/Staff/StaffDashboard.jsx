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

function StaffDashboard({ statistics, charts, staffs }) {
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

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Giáo viên theo bộ phận</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Phân bổ giáo viên theo bộ phận đào tạo.</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departments} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} giáo viên`, 'Giáo viên']} />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Giáo viên theo chuyên môn</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Tỷ trọng chuyên môn của đội ngũ giáo viên.</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => [`${value} giáo viên`, 'Số lượng']} />
                <Pie data={charts.specialties} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                  {charts.specialties.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {charts.specialties.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}
                </span>
                <span className="font-black text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">KPI theo tháng</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Điểm KPI trung bình đội ngũ trong 7 tháng gần nhất.</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyKpi} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, 'KPI']} />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Tỷ lệ hoàn thành KPI</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Nhóm giáo viên theo mức hoàn thành.</p>
          <div className="mt-4 space-y-3">
            {charts.kpiCompletion.map((item) => (
              <div key={item.name} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-slate-700">{item.name}</span>
                  <span className="text-xl font-black text-slate-950">{item.value}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Giáo viên cần theo dõi</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">Các hồ sơ thử việc, tạm nghỉ hoặc đã nghỉ việc.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-300">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã giáo viên</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Chức vụ</th>
                <th className="px-4 py-3">Bộ phận</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staffs.filter((item) => item.statusValue !== 'active').map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-bold text-blue-700">{item.code}</td>
                  <td className="px-4 py-3 font-black text-slate-950">{item.name}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{item.position}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{item.department}</td>
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

export default StaffDashboard
