import PageHeader from '../../components/common/PageHeader.jsx'
import AdmissionFunnelChart from '../../components/dashboard/AdmissionFunnelChart.jsx'
import ClassStatusBoard from '../../components/dashboard/ClassStatusBoard.jsx'
import DashboardHero from '../../components/dashboard/DashboardHero.jsx'
import DashboardStats from '../../components/dashboard/DashboardStats.jsx'
import RevenueLineChart from '../../components/dashboard/RevenueLineChart.jsx'
import StudentPieCharts from '../../components/dashboard/StudentPieCharts.jsx'
import TodayWidgets from '../../components/dashboard/TodayWidgets.jsx'
import {
  admissionFunnel,
  classStatus,
  dashboardStats,
  dashboardSummary,
  revenueData,
  revenuePeriods,
  studentCharts,
  todayWidgets,
} from '../../datas/dashboard.js'

function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Theo dõi tuyển sinh, lớp học, doanh thu và năng lực vận hành trung tâm."
      />

      <DashboardHero summary={dashboardSummary} />

      <DashboardStats stats={dashboardStats} />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RevenueLineChart data={revenueData} periods={revenuePeriods} />
        <AdmissionFunnelChart data={admissionFunnel} />
      </section>

      <section className="mt-6 grid gap-6">
        <StudentPieCharts charts={studentCharts} />
        <ClassStatusBoard items={classStatus} />
        <TodayWidgets widgets={todayWidgets} />
      </section>
    </>
  )
}

export default DashboardPage
