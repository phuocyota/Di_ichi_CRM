import { useEffect, useState } from 'react'
import { ClipboardList, UserPlus } from 'lucide-react'
import CrmDashboardHeader from '../../components/dashboard/CrmDashboardHeader.jsx'
import DashboardStats from '../../components/dashboard/DashboardStats.jsx'
import LeadTrendChart from '../../components/dashboard/LeadTrendChart.jsx'
import LeadStatusChart from '../../components/dashboard/LeadStatusChart.jsx'
import { getCrmDashboard } from '../../services/crmApi.js'

const chartColors = ['#2563eb', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#10b981', '#ef4444']
const formatDate = (value) => new Date(value).toLocaleDateString('vi-VN', { timeZone: 'Asia/Bangkok' })

function UnavailablePanel({ title, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-enterprise">
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      <p className="mt-4 text-sm text-ink-500">{children}</p>
    </section>
  )
}

function LeadList({ leads, page, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(leads.total / leads.size))
  return (
    <section className="rounded-md border border-blue-100 bg-white p-5 shadow-enterprise">
      <h2 className="mb-4 text-lg font-bold text-ink-900">Danh sách ứng viên tiềm năng</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-blue-50 text-ink-700">
            <tr>{['Ứng viên', 'Sale phụ trách', 'Trạng thái', 'Nguồn', 'Ngày tạo'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr>
          </thead>
          <tbody>
            {leads.items.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-100">
                <td className="p-3 font-semibold">{lead.name}</td>
                <td className="p-3">{lead.sale.name}</td>
                <td className="p-3">{lead.status}</td>
                <td className="p-3">{lead.source || '—'}</td>
                <td className="p-3">{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
            {!leads.items.length ? <tr><td colSpan={5} className="p-6 text-center text-ink-500">Chưa có ứng viên tiềm năng.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span>{leads.total.toLocaleString('vi-VN')} ứng viên · Trang {page}/{pageCount}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Trước</button>
          <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Sau</button>
        </div>
      </div>
    </section>
  )
}

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState(null)
  const [sales, setSales] = useState([])
  const [saleUserId, setSaleUserId] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setDashboard(null)
    getCrmDashboard({ page, size: 20, ...(saleUserId ? { saleUserId } : {}) })
      .then((result) => {
        if (!result?.summary || !Array.isArray(result.leadChartPeriods) || !Array.isArray(result.leadStatusData) || !Array.isArray(result.leads?.items)) {
          throw new Error('Dữ liệu Dashboard trả về không đúng định dạng')
        }
        if (!cancelled) {
          setDashboard(result)
          if (!saleUserId) setSales(result.sales || [])
        }
      })
      .catch((cause) => {
        if (!cancelled) setError(cause.message || 'Không thể tải Dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [requestVersion, page, saleUserId])

  const stats = dashboard ? [
    { label: 'Tổng Lead', value: dashboard.summary.totalLeads.toLocaleString('vi-VN'), trend: `${dashboard.summary.newLeadsThisWeek.toLocaleString('vi-VN')} ứng viên mới trong tuần`, icon: ClipboardList, color: 'blue' },
    { label: 'Lead mới hôm nay', value: dashboard.summary.newLeadsToday.toLocaleString('vi-VN'), icon: UserPlus, color: 'emerald' },
  ] : []

  return (
    <div className="space-y-5">
      <CrmDashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {sales.length > 1 ? (
        <label className="flex items-center gap-3 text-sm font-semibold">
          Sale phụ trách
          <select value={saleUserId} onChange={(event) => { setSaleUserId(event.target.value); setPage(1) }} className="rounded-md border border-slate-200 bg-white p-2">
            <option value="">Tất cả Sale</option>
            {sales.map((sale) => <option key={sale.userId} value={sale.userId}>{sale.name}</option>)}
          </select>
        </label>
      ) : null}
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
                <LeadTrendChart periods={dashboard.leadChartPeriods} />
                {dashboard.leadStatusData.length ? <LeadStatusChart data={dashboard.leadStatusData.map((item, index) => ({ ...item, fill: chartColors[index % chartColors.length] }))} /> : <UnavailablePanel title="Tỷ trọng trong pipeline">Chưa có ứng viên tiềm năng.</UnavailablePanel>}
              </section>
              <LeadList leads={dashboard.leads} page={page} onPageChange={setPage} />
            </>
          ) : null}
          {activeTab === 'leads' ? <LeadList leads={dashboard.leads} page={page} onPageChange={setPage} /> : null}
          {activeTab === 'customers' ? <UnavailablePanel title="Khách hàng">Chưa có dữ liệu danh sách khách hàng.</UnavailablePanel> : null}
          {activeTab === 'care' ? <UnavailablePanel title="Lịch chăm sóc">Chưa có dữ liệu lịch chăm sóc.</UnavailablePanel> : null}
        </>
      ) : null}
    </div>
  )
}

export default DashboardPage
