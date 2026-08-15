import { useMemo, useState } from 'react'
import { Download, RefreshCcw, Search } from 'lucide-react'
import * as XLSX from 'xlsx'

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value || 0)

const defaultFilters = {
  fromDate: '',
  toDate: '',
  branch: '',
  course: '',
  className: '',
  staff: '',
  source: '',
  status: '',
  keyword: '',
}

function uniqueOptions(rows, key) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].map((value) => ({ value, label: value }))
}

function AdmissionReport({ report, onRefresh }) {
  const [filters, setFilters] = useState(defaultFilters)
  const rows = useMemo(() => report?.details || [], [report])

  const options = useMemo(() => ({
    branches: uniqueOptions(rows, 'branch'),
    courses: uniqueOptions(rows, 'course'),
    classes: uniqueOptions(rows, 'className'),
    staffs: uniqueOptions(rows, 'staff'),
    sources: uniqueOptions(rows, 'source'),
    statuses: uniqueOptions(rows, 'status'),
  }), [rows])

  const filteredRows = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesFrom = !filters.fromDate || row.date >= filters.fromDate
      const matchesTo = !filters.toDate || row.date <= filters.toDate
      const matchesBranch = !filters.branch || row.branch === filters.branch
      const matchesCourse = !filters.course || row.course === filters.course
      const matchesClass = !filters.className || row.className === filters.className
      const matchesStaff = !filters.staff || row.staff === filters.staff
      const matchesSource = !filters.source || row.source === filters.source
      const matchesStatus = !filters.status || row.status === filters.status
      const matchesKeyword = !keyword || [row.id, row.branch, row.course, row.className, row.staff, row.source, row.status].some((value) => String(value || '').toLowerCase().includes(keyword))

      return matchesFrom && matchesTo && matchesBranch && matchesCourse && matchesClass && matchesStaff && matchesSource && matchesStatus && matchesKeyword
    })
  }, [filters, rows])

  const totals = useMemo(() => filteredRows.reduce((sum, row) => {
    sum.leads += row.leads || 0
    sum.trials += row.trials || 0
    sum.enrollments += row.enrollments || 0
    sum.revenue += row.revenue || 0
    return sum
  }, { leads: 0, trials: 0, enrollments: 0, revenue: 0 }), [filteredRows])

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const refresh = () => {
    setFilters(defaultFilters)
    onRefresh()
  }

  const exportExcel = () => {
    const exportRows = filteredRows.map((row, index) => ({
      STT: index + 1,
      'Mã báo cáo': row.id,
      Ngày: row.date,
      'Cơ sở': row.branch,
      'Khóa học': row.course,
      'Lớp học': row.className,
      'Tư vấn viên': row.staff,
      'Nguồn lead': row.source,
      'Trạng thái': row.status,
      Lead: row.leads,
      'Học thử': row.trials,
      'Đăng ký': row.enrollments,
      'Doanh thu': row.revenue,
      'Tỷ lệ chuyển đổi (%)': row.conversion,
      'Kỳ trước': row.previous,
    }))

    exportRows.push({
      STT: '',
      'Mã báo cáo': '',
      Ngày: '',
      'Cơ sở': 'Tổng kết',
      'Khóa học': '',
      'Lớp học': '',
      'Tư vấn viên': '',
      'Nguồn lead': '',
      'Trạng thái': '',
      Lead: totals.leads,
      'Học thử': totals.trials,
      'Đăng ký': totals.enrollments,
      'Doanh thu': totals.revenue,
      'Tỷ lệ chuyển đổi (%)': '',
      'Kỳ trước': '',
    })

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao cao tuyen sinh')
    XLSX.writeFile(workbook, 'bao-cao-tuyen-sinh.xlsx')
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Báo cáo tuyển sinh</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">Chi tiết báo cáo tuyển sinh</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={refresh}>
            <RefreshCcw size={16} aria-hidden="true" /> Làm mới
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700" onClick={exportExcel}>
            <Download size={16} aria-hidden="true" /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-200/70 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm shadow-blue-100/60">
        <p className="text-sm font-black text-slate-950">Bộ lọc</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Từ ngày</span>
            <input type="date" className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={filters.fromDate} onChange={(event) => updateFilter('fromDate', event.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Đến ngày</span>
            <input type="date" className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={filters.toDate} onChange={(event) => updateFilter('toDate', event.target.value)} />
          </label>
          <SelectFilter label="Cơ sở" value={filters.branch} options={options.branches} onChange={(value) => updateFilter('branch', value)} />
          <SelectFilter label="Khóa học" value={filters.course} options={options.courses} onChange={(value) => updateFilter('course', value)} />
          <SelectFilter label="Lớp học" value={filters.className} options={options.classes} onChange={(value) => updateFilter('className', value)} />
          <SelectFilter label="Tư vấn viên" value={filters.staff} options={options.staffs} onChange={(value) => updateFilter('staff', value)} />
          <SelectFilter label="Nguồn lead" value={filters.source} options={options.sources} onChange={(value) => updateFilter('source', value)} />
          <SelectFilter label="Trạng thái" value={filters.status} options={options.statuses} onChange={(value) => updateFilter('status', value)} />
          <label className="block md:col-span-2 xl:col-span-4">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Tìm kiếm</span>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Mã báo cáo, cơ sở, khóa học, lớp học, tư vấn viên, nguồn lead"
                value={filters.keyword}
                onChange={(event) => updateFilter('keyword', event.target.value)}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[1460px] text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-4 py-4">STT</th>
              <th className="px-4 py-4">Ngày</th>
              <th className="px-4 py-4">Mã BC</th>
              <th className="px-4 py-4">Cơ sở</th>
              <th className="px-4 py-4">Khóa học</th>
              <th className="px-4 py-4">Lớp học</th>
              <th className="px-4 py-4">Tư vấn viên</th>
              <th className="px-4 py-4">Nguồn lead</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-4 py-4">Lead</th>
              <th className="px-4 py-4">Học thử</th>
              <th className="px-4 py-4">Đăng ký</th>
              <th className="px-4 py-4">Doanh thu</th>
              <th className="px-4 py-4">Chuyển đổi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50/50">
                <td className="px-4 py-4 font-bold text-slate-700">{index + 1}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.date}</td>
                <td className="px-4 py-4 font-black text-blue-700">{row.id}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.branch}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.course}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.className}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.staff}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.source}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{row.status}</span>
                </td>
                <td className="px-4 py-4 font-black text-slate-950">{row.leads}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.trials}</td>
                <td className="px-4 py-4 font-semibold text-emerald-700">{row.enrollments}</td>
                <td className="px-4 py-4 font-black text-emerald-700">{formatCurrency(row.revenue)}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.conversion}%</td>
              </tr>
            ))}
            {!filteredRows.length ? (
              <tr>
                <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={14}>Không tìm thấy báo cáo tuyển sinh phù hợp.</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot className="bg-slate-50 text-sm font-black text-slate-900">
            <tr>
              <td className="px-4 py-4" colSpan={9}>Tổng kết</td>
              <td className="px-4 py-4">{totals.leads}</td>
              <td className="px-4 py-4">{totals.trials}</td>
              <td className="px-4 py-4 text-emerald-700">{totals.enrollments}</td>
              <td className="px-4 py-4 text-emerald-700">{formatCurrency(totals.revenue)}</td>
              <td className="px-4 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">{label}</span>
      <select className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Tất cả</option>
        {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
  )
}

export default AdmissionReport
