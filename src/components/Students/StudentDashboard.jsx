import { chartPalette, chartStyle } from '../common/presentation.js'
import React from 'react'
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
  YAxis
} from 'recharts'
import StatCard from '../common/StatCard.jsx'
import { ChartCard, EmptyState } from '../common/ui.jsx'

function DistributionChart({ title, description, data, color = chartPalette[2] }) {
  return (
    <ChartCard title={title} description={description}>
      {!data.length ? (
        <EmptyState compact />
      ) : (
        <div className={`ui-chart-area ${data.length <= 3 ? 'is-small' : ''}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ right: 8, top: 8 }}>
              <CartesianGrid
                stroke={chartStyle.grid}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={chartStyle.tooltip}
                formatter={(v) => [`${v} học viên`, 'Số lượng']}
              />
              <Bar
                dataKey="value"
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}
export default function StudentDashboard({
  statistics,
  charts,
  onOpenStudents
}) {
  return (
    <div className="space-y-6">
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
        aria-label="Thống kê học viên"
      >
        {statistics.map((item, index) => (
          <StatCard
            key={item.field || item.label}
            {...item}
            color={['info', 'success', 'warning', 'danger', 'purple'][index % 5]}
            onClick={
              item.field === 'totalStudents' ? onOpenStudents : undefined
            }
          />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ChartCard
          title="Học viên theo tháng"
          description="Hồ sơ học viên mới được ghi nhận theo tháng."
        >
          {!charts.monthly.length ? (
            <EmptyState compact />
          ) : (
            <div className="ui-chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthly} margin={{ top: 8, right: 8 }}>
                  <CartesianGrid
                    stroke={chartStyle.grid}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartStyle.tooltip}
                    formatter={(v) => [`${v} học viên`, 'Học viên mới']}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke={chartPalette[0]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
        <ChartCard
          title="Trạng thái học viên"
          description="Phân bố trạng thái hiện tại."
        >
          {!charts.status.some((s) => s.value > 0) ? (
            <EmptyState compact />
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={chartStyle.tooltip}
                      formatter={(v) => [`${v}%`, 'Tỷ lệ']}
                    />
                    <Pie
                      data={charts.status}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={2}
                    >
                      {charts.status.map(item => <Cell key={item.name} fill={item.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {charts.status.map((s) => (
                  <div
                    className="flex items-center justify-between gap-2 text-xs"
                    key={s.name}
                  >
                    <span className="flex items-center gap-2 text-slate-500">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.fill }}
                      />
                      {s.name}
                    </span>
                    <span className="font-semibold">{s.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <DistributionChart
          title="Học viên theo khóa học"
          description="Số lượng học viên trong các chương trình đào tạo."
          data={charts.courses}
        />
        <DistributionChart
          title="Học viên theo cơ sở"
          description="Phân bố hồ sơ tại các cơ sở đang quản lý."
          color={chartPalette[4]}
          data={charts.branches}
        />
      </section>
    </div>
  )
}
