import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import PanelHeader from './PanelHeader.jsx'

function LeadStatusChart({ data }) {
  return (
    <section className="rounded-md border border-blue-100 bg-white p-5 shadow-enterprise">
      <PanelHeader eyebrow="Trạng thái Lead" title="Tỷ trọng trong pipeline" />
      <div className="grid gap-5 lg:grid-cols-[240px_1fr] lg:items-center">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4 rounded-md bg-slate-50 p-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name}
              </span>
              <span className="text-sm font-bold text-ink-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LeadStatusChart
