import { ArrowDownRight, ArrowUpRight, BookOpen, GraduationCap, Landmark, LineChart as LineChartIcon, Users } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const formatCurrency = (value) => `${Math.round(value / 1000000)}M`

function ChartBox({ title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-5 h-72">{children}</div>
    </section>
  )
}

function ReportDashboard({ statistics, charts, onTabChange }) {
  const quickLinks = [
    { label: 'Tuyển sinh', key: 'admissions', value: 'Lead +14.2%', icon: GraduationCap, className: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: 'Học tập', key: 'learning', value: 'Chuyên cần 91.2%', icon: BookOpen, className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Giáo viên', key: 'teachers', value: 'KPI 88.6%', icon: Users, className: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { label: 'Tài chính', key: 'finance', value: 'Lợi nhuận 168M', icon: Landmark, className: 'bg-amber-50 text-amber-700 border-amber-100' },
  ]

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const isUp = item.trend >= 0
          return (
            <article key={item.key} className={`rounded-xl border p-5 shadow-sm ${item.color}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold opacity-80">{item.label}</p>
                  <p className="mt-2 text-3xl font-black">{item.displayValue}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/75 shadow-sm">
                  <LineChartIcon size={23} aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm font-bold">
                <span className="opacity-75">{item.description}</span>
                <span className={`inline-flex items-center gap-1 ${isUp ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isUp ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowDownRight size={16} aria-hidden="true" />}
                  {Math.abs(item.trend)}%
                </span>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.key} type="button" className={`rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${item.className}`} onClick={() => onTabChange(item.key)}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <Icon size={20} aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-black">{item.label}</p>
              <p className="mt-1 text-xs font-bold opacity-75">{item.value}</p>
            </button>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartBox title="Doanh thu theo tháng" subtitle="Doanh thu, chi phí và lợi nhuận trong 7 tháng gần nhất.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.revenueByMonth} margin={{ left: 0, right: 16, top: 8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [formatCurrency(value), '']} />
              <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
              <Line type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Học viên theo trạng thái" subtitle="Cơ cấu học viên hiện tại theo trạng thái học tập.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
              <Pie data={charts.studentStatus} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={3}>
                {charts.studentStatus.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <ChartBox title="Tuyển sinh theo tháng" subtitle="Lead, học thử và đăng ký chính thức.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.admissionByMonth} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="leads" name="Lead" fill="#2563eb" radius={[8, 8, 0, 0]} />
              <Bar dataKey="enrollments" name="Đăng ký" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Hiệu suất giáo viên" subtitle="KPI và điểm đánh giá theo giáo viên.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.teacherPerformance} layout="vertical" margin={{ left: 18, right: 16, top: 8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} />
              <YAxis dataKey="teacher" type="category" width={72} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="kpi" name="KPI" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Hoàn thành khóa học" subtitle="Tỷ lệ hoàn thành theo từng khóa học.">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="28%" outerRadius="95%" data={charts.courseCompletion} startAngle={90} endAngle={-270}>
              <Tooltip formatter={(value) => [`${value}%`, 'Hoàn thành']} />
              <RadialBar dataKey="completion" background fill="#0ea5e9" cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartBox>
      </section>
    </div>
  )
}

export default ReportDashboard
