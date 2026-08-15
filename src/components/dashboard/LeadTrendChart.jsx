import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function LeadTrendChart({ periods }) {
  const [activePeriod, setActivePeriod] = useState(periods[0].dataKey)
  const period = useMemo(
    () => periods.find((item) => item.dataKey === activePeriod) || periods[0],
    [activePeriod, periods],
  )
  const isMonthly = activePeriod === 'month'

  return (
    <section className="rounded-md border border-red-100 bg-white p-5 shadow-enterprise">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Biểu đồ Lead</p>
          <h2 className="mt-1 text-lg font-bold text-ink-900">Lead theo ngày, tuần, tháng</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-md bg-slate-100 p-1">
          {periods.map((item) => (
            <button
              key={item.dataKey}
              type="button"
              onClick={() => setActivePeriod(item.dataKey)}
              className={[
                'rounded px-3 py-2 text-xs font-bold transition',
                activePeriod === item.dataKey
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-ink-500 hover:text-ink-900',
              ].join(' ')}
            >
              {item.label.replace('Theo ', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {isMonthly ? (
            <LineChart data={period.data} margin={{ left: -8, right: 18, top: 8 }}>
              <CartesianGrid stroke="#fee2e2" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [value.toLocaleString('vi-VN'), 'Lead']}
                contentStyle={{ borderRadius: 8, borderColor: '#fecaca' }}
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ r: 4, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={period.data} margin={{ left: -8, right: 18, top: 8 }}>
              <CartesianGrid stroke="#fee2e2" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [value.toLocaleString('vi-VN'), 'Lead']}
                contentStyle={{ borderRadius: 8, borderColor: '#fecaca' }}
              />
              <Bar dataKey="leads" radius={[6, 6, 0, 0]} fill="#dc2626" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default LeadTrendChart
