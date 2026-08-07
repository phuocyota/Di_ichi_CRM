import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import PageHeader from '../../components/common/PageHeader.jsx'
import AdmissionFunnelChart from '../../components/dashboard/AdmissionFunnelChart.jsx'
import ClassStatusBoard from '../../components/dashboard/ClassStatusBoard.jsx'
import DashboardHero from '../../components/dashboard/DashboardHero.jsx'
import DashboardStats from '../../components/dashboard/DashboardStats.jsx'
import RevenueLineChart from '../../components/dashboard/RevenueLineChart.jsx'
import StudentPieCharts from '../../components/dashboard/StudentPieCharts.jsx'
import TodayWidgets from '../../components/dashboard/TodayWidgets.jsx'
import {
  classStatus,
  dashboardStats,
  todayWidgets,
} from '../../datas/dashboard.js'
import { getAdminDashboard } from '../../services/crmApi.js'

const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const revenuePeriods = ['6 tháng gần nhất']
const summaryFields = [
  'activeStudents',
  'newStudents',
  'activeClasses',
  'teachers',
  'monthlyRevenue',
  'tuitionDebt',
  'attendanceRate',
  'unmarkedHomework',
]
const moneyFields = new Set(['monthlyRevenue', 'tuitionDebt'])
const widgetTypes = [
  'student_birthday',
  'class_starting',
  'unmarked_homework',
  'tuition_due',
  'admission_appointment',
  'notification',
]
const classTemplates = {
  upcoming: classStatus[0],
  active: classStatus[1],
  finishing: classStatus[2],
}

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  notation: 'compact',
  maximumFractionDigits: 2,
}).format(Number(value || 0))

const colorize = (items = []) => items.map((item, index) => ({
  ...item,
  fill: chartColors[index % chartColors.length],
}))

const emptyDashboard = {
  summary: { todayClasses: 0, conversionRate: '0%' },
  stats: dashboardStats.map((item) => ({ ...item, value: 0, trend: 'Dữ liệu tổng hợp từ hệ thống' })),
  revenue: [],
  funnel: [],
  students: { levels: [], ages: [], branches: [] },
  classes: classStatus.map((item) => ({ ...item, value: 0 })),
  widgets: todayWidgets.map((item) => ({ ...item, value: 0 })),
}

function mapDashboard(data) {
  const summary = data?.summary || {}
  const distribution = data?.studentDistribution || {}

  return {
    summary: {
      todayClasses: summary.todayClasses || 0,
      conversionRate: `${summary.conversionRate || 0}%`,
    },
    stats: dashboardStats.map((item, index) => {
      const field = summaryFields[index]
      const rawValue = Number(summary[field] || 0)
      const value = moneyFields.has(field)
        ? formatMoney(rawValue)
        : field === 'attendanceRate' ? `${rawValue}%` : rawValue.toLocaleString('vi-VN')
      return { ...item, value, trend: 'Dữ liệu tổng hợp từ hệ thống' }
    }),
    revenue: (data?.revenueSeries || []).map((item) => ({
      ...item,
      revenue: Number(item.revenue || 0) / 1_000_000,
    })),
    funnel: colorize(data?.admissionFunnel).map((item) => ({ ...item, name: item.label })),
    students: {
      levels: colorize(distribution.levels),
      ages: colorize(distribution.ages),
      branches: colorize(distribution.branches),
    },
    classes: (data?.classStatus || []).map((item) => ({
      ...(classTemplates[item.status] || classStatus[0]),
      value: Number(item.value || 0),
    })),
    widgets: (data?.todayWidgets || []).map((item) => ({
      ...(todayWidgets[widgetTypes.indexOf(item.type)] || todayWidgets[0]),
      value: Number(item.value || 0),
      note: item.note,
    })),
  }
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(emptyDashboard)

  useEffect(() => {
    getAdminDashboard()
      .then((data) => setDashboard(mapDashboard(data)))
      .catch((error) => toast.error(`Không tải được dashboard: ${error.message}`))
  }, [])

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Theo dõi tuyển sinh, lớp học, doanh thu và năng lực vận hành trung tâm."
      />

      <DashboardHero summary={dashboard.summary} />
      <DashboardStats stats={dashboard.stats} />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RevenueLineChart data={dashboard.revenue} periods={revenuePeriods} />
        <AdmissionFunnelChart data={dashboard.funnel} />
      </section>

      <section className="mt-6 grid gap-6">
        <StudentPieCharts charts={dashboard.students} />
        <ClassStatusBoard items={dashboard.classes} />
        <TodayWidgets widgets={dashboard.widgets} />
      </section>
    </>
  )
}

export default DashboardPage
