import { useEffect, useState } from 'react'
import { CalendarCheck, ClipboardList, UserCheck, UserPlus } from 'lucide-react'
import CrmDashboardHeader from '../../components/dashboard/CrmDashboardHeader.jsx'
import DashboardStats from '../../components/dashboard/DashboardStats.jsx'
import { getAdminDashboard } from '../../services/crmApi.js'

function UnavailablePanel({ title, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-enterprise">
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      <p className="mt-4 text-sm text-ink-500">{children}</p>
    </section>
  )
}

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setDashboard(null)
    getAdminDashboard()
      .then((result) => {
        if (!result || !Array.isArray(result.admissionFunnel)) {
          throw new Error('Dữ liệu Dashboard trả về không đúng định dạng')
        }
        if (!cancelled) setDashboard(result)
      })
      .catch((cause) => {
        if (!cancelled) setError(cause.message || 'Không thể tải Dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [requestVersion])

  const leadCount = dashboard?.admissionFunnel.find((item) => item.stage === 'lead')?.value
  const hasLeadCount = typeof leadCount === 'number' && Number.isFinite(leadCount) && leadCount >= 0
  const stats = [
    {
      label: 'Lead trong tháng',
      value: hasLeadCount ? leadCount.toLocaleString('vi-VN') : '—',
      trend: hasLeadCount ? undefined : 'Chưa có dữ liệu',
      icon: ClipboardList,
      color: 'blue',
    },
    { label: 'Lead mới hôm nay', value: '—', trend: 'Chưa có dữ liệu', icon: UserPlus, color: 'emerald' },
    { label: 'Khách hàng', value: '—', trend: 'Chưa có dữ liệu', icon: UserCheck, color: 'rose' },
    { label: 'Lịch chăm sóc hôm nay', value: '—', trend: 'Chưa có dữ liệu', icon: CalendarCheck, color: 'amber' },
  ]

  return (
    <div className="space-y-5">
      <CrmDashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {loading ? <p role="status" className="rounded-md bg-white p-5 text-sm text-ink-500">Đang tải dữ liệu Dashboard…</p> : null}
      {error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={() => setRequestVersion((value) => value + 1)} className="mt-3 rounded bg-white px-4 py-2 font-bold">Thử lại</button>
        </div>
      ) : null}
      {!loading && !error && dashboard ? (
        <>
          {activeTab === 'overview' ? (
            <>
              <DashboardStats stats={stats} />
              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <UnavailablePanel title="Lead theo ngày, tuần, tháng">Chưa có dữ liệu thống kê Lead theo thời gian.</UnavailablePanel>
                <UnavailablePanel title="Tỷ trọng trong pipeline">Chưa có dữ liệu phân bố trạng thái Lead.</UnavailablePanel>
              </section>
              <UnavailablePanel title="Lịch chăm sóc hôm nay">Chưa có dữ liệu lịch chăm sóc.</UnavailablePanel>
              <section className="grid gap-6 2xl:grid-cols-2">
                <UnavailablePanel title="Lead mới nhất">Chưa có dữ liệu danh sách Lead.</UnavailablePanel>
                <UnavailablePanel title="Khách hàng mới nhất">Chưa có dữ liệu danh sách khách hàng.</UnavailablePanel>
              </section>
            </>
          ) : null}
          {activeTab === 'leads' ? <UnavailablePanel title="Danh sách Lead">Chưa có dữ liệu danh sách Lead.</UnavailablePanel> : null}
          {activeTab === 'customers' ? <UnavailablePanel title="Khách hàng">Chưa có dữ liệu danh sách khách hàng.</UnavailablePanel> : null}
          {activeTab === 'care' ? <UnavailablePanel title="Lịch chăm sóc">Chưa có dữ liệu lịch chăm sóc.</UnavailablePanel> : null}
        </>
      ) : null}
    </div>
  )
}

export default DashboardPage
