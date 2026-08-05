import {
  Area,
  AreaChart,
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
import { ArrowDownRight, ArrowUpRight, Eye, TrendingUp } from 'lucide-react'

const formatCurrency = (value) => `${Math.round(value / 1000000)}M`

function ChartPanel({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      <div className="mt-4 h-72">{children}</div>
    </div>
  )
}

function ReportContent({ reportKey, report, rows, onOpenDetail }) {
  const renderCharts = () => {
    if (reportKey === 'admissions') {
      return (
        <>
          <ChartPanel title="Funnel tuyển sinh">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.funnel} layout="vertical" margin={{ left: 20, right: 16, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" width={82} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {report.funnel.map((entry) => <Cell key={entry.stage} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Lead theo tháng">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.monthly} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" name="Lead" stroke="#2563eb" strokeWidth={3} />
                <Line type="monotone" dataKey="enrollments" name="Đăng ký" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Lead theo nguồn">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.leadSources} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="leads" name="Lead" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </>
      )
    }

    if (reportKey === 'learning') {
      return (
        <>
          <ChartPanel title="Điểm theo lớp">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.scoreByClass} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="className" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="score" name="Điểm TB" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Tiến bộ theo thời gian">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.progressTimeline} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, '']} />
                <Area type="monotone" dataKey="progress" name="Tiến bộ" stroke="#10b981" fill="#dcfce7" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Chuyên cần theo tháng">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.attendanceByMonth} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, 'Chuyên cần']} />
                <Line type="monotone" dataKey="attendance" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </>
      )
    }

    if (reportKey === 'teachers') {
      return (
        <>
          <ChartPanel title="KPI theo tháng">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.kpiByMonth} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, '']} />
                <Line type="monotone" dataKey="kpi" name="KPI" stroke="#6366f1" strokeWidth={3} />
                <Line type="monotone" dataKey="completed" name="Hoàn thành" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Giờ dạy theo tuần">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.teachingHoursByWeek} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="hours" name="Giờ dạy" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Đánh giá giáo viên">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.rating} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="teacher" axisLine={false} tickLine={false} hide />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="rating" name="Đánh giá" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </>
      )
    }

    if (reportKey === 'finance') {
      return (
        <>
          <ChartPanel title="Doanh thu theo tháng">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.monthly} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2563eb" strokeWidth={3} />
                <Line type="monotone" dataKey="cost" name="Chi phí" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Công nợ theo trạng thái">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => [formatCurrency(value), 'Công nợ']} />
                <Pie data={report.debtStatus} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92}>
                  {report.debtStatus.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Doanh thu theo cơ sở">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.revenueByBranch} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="branch" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </>
      )
    }

    return (
      <>
        <ChartPanel title="Sĩ số theo lớp">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.sizeByClass} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="className" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="current" name="Hiện tại" fill="#2563eb" radius={[8, 8, 0, 0]} />
              <Bar dataKey="max" name="Tối đa" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Trạng thái lớp học">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie data={report.status} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92}>
                {report.status.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Tỷ lệ hoàn thành">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.completion} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="course" axisLine={false} tickLine={false} hide />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value}%`, 'Hoàn thành']} />
              <Bar dataKey="completion" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </>
    )
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {report.summary.map((item) => {
          const isUp = item.trend >= 0
          return (
            <article key={item.label} className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{item.value}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black ${isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {isUp ? <ArrowUpRight size={15} aria-hidden="true" /> : <ArrowDownRight size={15} aria-hidden="true" />}
                  {Math.abs(item.trend)}%
                </span>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">{renderCharts()}</section>

      <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">Điểm nổi bật cần theo dõi</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Các dòng có xu hướng tăng/giảm rõ rệt so với kỳ trước.</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-700">
            <TrendingUp size={17} aria-hidden="true" />
            {rows.length} bản ghi sau lọc
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {rows.slice(0, 3).map((row) => (
            <button key={row.id} type="button" className="rounded-xl border border-gray-300 bg-slate-50 p-4 text-left shadow-sm hover:bg-white" onClick={() => onOpenDetail(row)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-950">{row.className || row.branch}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{row.branch} · {row.status}</p>
                </div>
                <Eye size={17} className="text-blue-700" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-600">So với kỳ trước: <span className={Number(row.previous || 0) <= Number(row.conversion || row.progress || row.kpi || row.revenue || row.completionRate || 0) ? 'text-emerald-700' : 'text-red-700'}>{row.previous}</span></p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ReportContent
