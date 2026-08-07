import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function RevenueLineChart({ data, periods }) {
  return (
    <section className="rounded-md border border-red-100 bg-white p-5 shadow-enterprise">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Biểu đồ</p>
          <h2 className="mt-1 text-lg font-bold text-ink-900">Doanh thu</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {periods.map((item, index) => (
            <button
              key={item}
              type="button"
              className={[
                'rounded-md px-3 py-2 text-xs font-bold transition',
                periods.length === 1 || index === 2 ? 'bg-red-600 text-white shadow-md shadow-red-100' : 'bg-red-50 text-red-700',
              ].join(' ')}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 16, top: 8 }}>
            <CartesianGrid stroke="#fee2e2" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}tr`} />
            <Tooltip
              formatter={(value) => [`${value} triệu`, 'Doanh thu']}
              contentStyle={{
                borderRadius: 8,
                borderColor: '#fecaca',
                boxShadow: '0 10px 24px rgb(15 23 42 / 0.12)',
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default RevenueLineChart
