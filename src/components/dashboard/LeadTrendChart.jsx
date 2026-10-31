import React, { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { ChartCard, EmptyState } from '../common/ui.jsx'
import { chartPalette, chartStyle } from '../common/presentation.js'

export default function LeadTrendChart({ periods }) {
  const [activePeriod, setActivePeriod] = useState(periods[0]?.dataKey || '')
  const period = useMemo(
    () => periods.find((p) => p.dataKey === activePeriod) || periods[0],
    [periods, activePeriod]
  )
  const monthly = period?.dataKey === 'month'
  const axes = (
    <>
      <CartesianGrid
        stroke={chartStyle.grid}
        strokeDasharray="3 3"
        vertical={false}
      />
      <XAxis
        dataKey="label"
        axisLine={false}
        tickLine={false}
        tick={chartStyle.axis}
      />
      <YAxis
        allowDecimals={false}
        axisLine={false}
        tickLine={false}
        tick={chartStyle.axis}
      />
      <Tooltip
        contentStyle={chartStyle.tooltip}
        formatter={(value) => [value.toLocaleString('vi-VN'), 'Ứng viên']}
      />
    </>
  )
  return (
    <ChartCard
      title="Xu hướng ứng viên"
      description="Số hồ sơ mới theo thời gian."
      actions={
        periods.length > 0 && (
          <div className="ui-segment">
            {periods.map((item) => (
              <button
                type="button"
                key={item.dataKey}
                aria-pressed={period?.dataKey === item.dataKey}
                onClick={() => setActivePeriod(item.dataKey)}
              >
                {item.label.replace('Theo ', '')}
              </button>
            ))}
          </div>
        )
      }
    >
      {!period?.data?.length ? (
        <EmptyState compact title="Chưa có dữ liệu xu hướng" />
      ) : (
        <div className="ui-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            {monthly ? (
              <LineChart data={period.data} margin={{ right: 8, top: 8 }}>
                {axes}
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke={chartPalette[0]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            ) : (
              <BarChart data={period.data} margin={{ right: 8, top: 8 }}>
                {axes}
                <Bar
                  dataKey="leads"
                  fill={chartPalette[0]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}
