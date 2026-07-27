import { CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function ClassDashboard({ statistics, charts }) {
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
                  <Icon size={23} />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold opacity-75">{item.description}</p>
            </article>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Số lượng lớp theo tháng</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Theo dõi số lớp mở mới theo từng tháng.</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthly} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} lớp`, 'Số lớp']} />
                <Line type="monotone" dataKey="classes" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Trạng thái lớp học</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Tỷ lệ lớp theo trạng thái.</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                <Pie data={charts.status} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {charts.status.map((item) => (
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
    </div>
  )
}

export default ClassDashboard
