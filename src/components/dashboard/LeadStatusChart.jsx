import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartCard, EmptyState } from '../common/ui.jsx'
import { chartStyle } from '../common/presentation.js'

export default function LeadStatusChart({ data }) {
  return (
    <ChartCard
      title="Trạng thái ứng viên"
      description="Tỷ trọng hồ sơ theo trạng thái hiện tại."
    >
      {!data.length ? (
        <EmptyState compact />
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={chartStyle.tooltip}
                  formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={76}
                  paddingAngle={2}
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
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="flex min-w-0 items-center gap-2 text-slate-500">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold tabular-nums">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  )
}
