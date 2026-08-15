import { useState } from 'react'
import CrmDashboardHeader from '../../components/dashboard/CrmDashboardHeader.jsx'
import DashboardStats from '../../components/dashboard/DashboardStats.jsx'
import LatestLeadTable from '../../components/dashboard/LatestLeadTable.jsx'
import LeadStatusChart from '../../components/dashboard/LeadStatusChart.jsx'
import LeadTrendChart from '../../components/dashboard/LeadTrendChart.jsx'
import NewestCustomerTable from '../../components/dashboard/NewestCustomerTable.jsx'
import TodayCareSchedule from '../../components/dashboard/TodayCareSchedule.jsx'
import {
  crmDashboardStats,
  latestLeads,
  leadChartPeriods,
  leadStatusData,
  newestCustomers,
  todayCareSchedules,
} from '../../datas/dashboard.js'

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-5">
      <CrmDashboardHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'overview' ? (
        <>
          <DashboardStats stats={crmDashboardStats} />

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <LeadTrendChart periods={leadChartPeriods} />
            <LeadStatusChart data={leadStatusData} />
          </section>

          <TodayCareSchedule rows={todayCareSchedules.slice(0, 3)} />

          <section className="grid gap-6 2xl:grid-cols-2">
            <LatestLeadTable rows={latestLeads.slice(0, 5)} onTabChange={setActiveTab} />
            <NewestCustomerTable rows={newestCustomers.slice(0, 4)} onTabChange={setActiveTab} />
          </section>
        </>
      ) : null}

      {activeTab === 'leads' ? (
        <LatestLeadTable rows={latestLeads} showAll onTabChange={setActiveTab} />
      ) : null}

      {activeTab === 'customers' ? (
        <NewestCustomerTable rows={newestCustomers} showAll onTabChange={setActiveTab} />
      ) : null}

      {activeTab === 'care' ? (
        <TodayCareSchedule rows={todayCareSchedules} showAll />
      ) : null}
    </div>
  )
}

export default DashboardPage
