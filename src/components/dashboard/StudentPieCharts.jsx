import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

function MiniPie({ title, data }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
      <h3 className="text-sm font-bold text-ink-900">{title}</h3>
      <div className="mt-3 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip formatter={(value) => [`${value}%`, title]} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={38} outerRadius={68} paddingAngle={3} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 font-medium text-ink-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              {item.name}
            </span>
            <span className="font-bold text-ink-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudentPieCharts({ charts }) {
  return (
    <section className="rounded-md border border-blue-100 bg-white p-5 shadow-enterprise">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Học viên</p>
        <h2 className="mt-1 text-lg font-bold text-ink-900">Phân bổ học viên</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <MiniPie title="Theo cấp độ" data={charts.levels} />
        <MiniPie title="Theo độ tuổi" data={charts.ages} />
        <MiniPie title="Theo cơ sở" data={charts.branches} />
      </div>
    </section>
  )
}

export default StudentPieCharts
