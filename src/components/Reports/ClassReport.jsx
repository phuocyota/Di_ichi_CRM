import { useMemo, useState } from 'react'
import { Download, RefreshCcw, Search } from 'lucide-react'
import * as XLSX from 'xlsx'

const defaultFilters = {
  fromDate: '',
  toDate: '',
  branch: '',
  courseId: '',
  classId: '',
  teacherId: '',
  status: '',
  keyword: '',
}

function uniqueOptions(rows, valueKey, labelKey = valueKey) {
  const map = new Map()
  rows.forEach((row) => {
    if (row[valueKey]) map.set(row[valueKey], row[labelKey] || row[valueKey])
  })
  return [...map.entries()].map(([value, label]) => ({ value, label }))
}

function formatNumber(value, maximumFractionDigits = 0) {
  return Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits })
}

function ClassReport({ report, onRefresh }) {
  const rows = useMemo(() => report?.details || [], [report])
  const [filters, setFilters] = useState(defaultFilters)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const options = useMemo(() => ({
    branches: uniqueOptions(rows, 'branch'),
    courses: uniqueOptions(rows, 'courseId', 'course'),
    classes: uniqueOptions(rows.filter((row) => !filters.courseId || row.courseId === filters.courseId), 'classId', 'className'),
    teachers: uniqueOptions(rows, 'teacherId', 'teacher'),
    statuses: uniqueOptions(rows, 'status'),
  }), [filters.courseId, rows])

  const filteredRows = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesFrom = !filters.fromDate || row.date >= filters.fromDate
      const matchesTo = !filters.toDate || row.date <= filters.toDate
      const matchesBranch = !filters.branch || row.branch === filters.branch
      const matchesCourse = !filters.courseId || row.courseId === filters.courseId
      const matchesClass = !filters.classId || row.classId === filters.classId
      const matchesTeacher = !filters.teacherId || row.teacherId === filters.teacherId
      const matchesStatus = !filters.status || row.status === filters.status
      const matchesKeyword = !keyword || [row.id, row.classCode, row.className, row.course, row.teacher].some((value) => String(value || '').toLowerCase().includes(keyword))

      return matchesFrom && matchesTo && matchesBranch && matchesCourse && matchesClass && matchesTeacher && matchesStatus && matchesKeyword
    })
  }, [filters, rows])

  const totals = useMemo(() => {
    const count = filteredRows.length || 1
    const highestSize = filteredRows.reduce((max, row) => (Number(row.currentStudents || 0) > Number(max.currentStudents || 0) ? row : max), filteredRows[0] || {})
    const highestAbsence = filteredRows.reduce((max, row) => (Number(row.absenceRate || 0) > Number(max.absenceRate || 0) ? row : max), filteredRows[0] || {})

    return {
      rows: filteredRows.length,
      totalClasses: filteredRows.reduce((sum, row) => sum + Number(row.totalClasses || 0), 0),
      currentStudents: filteredRows.reduce((sum, row) => sum + Number(row.currentStudents || 0), 0),
      maxStudents: filteredRows.reduce((sum, row) => sum + Number(row.maxStudents || 0), 0),
      averageSize: filteredRows.reduce((sum, row) => sum + Number(row.averageSize || 0), 0) / count,
      fillRate: filteredRows.reduce((sum, row) => sum + Number(row.fillRate || 0), 0) / count,
      absenceRate: filteredRows.reduce((sum, row) => sum + Number(row.absenceRate || 0), 0) / count,
      completionRate: filteredRows.reduce((sum, row) => sum + Number(row.completionRate || 0), 0) / count,
      highestSizeClass: highestSize.className || '-',
      highestAbsenceClass: highestAbsence.className || '-',
    }
  }, [filteredRows])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'courseId' ? { classId: '' } : {}),
    }))
    setPage(1)
  }

  const refresh = () => {
    setFilters(defaultFilters)
    setPage(1)
    onRefresh()
  }

  const exportExcel = () => {
    const exportRows = filteredRows.map((row, index) => ({
      STT: index + 1,
      'Mã báo cáo': row.id,
      'Lớp học ID': row.classId,
      'Mã lớp': row.classCode,
      'Lớp học': row.className,
      'Cơ sở': row.branch,
      'Khóa học ID': row.courseId,
      'Khóa học': row.course,
      'Giáo viên ID': row.teacherId,
      'Giáo viên': row.teacher,
      'Trạng thái': row.status,
      'Tổng số lớp': row.totalClasses,
      'Sĩ số hiện tại': row.currentStudents,
      'Sĩ số tối đa': row.maxStudents,
      'Sĩ số trung bình': row.averageSize,
      'Tỷ lệ đầy lớp (%)': row.fillRate,
      'Tỷ lệ nghỉ học (%)': row.absenceRate,
      'Hoàn thành khóa (%)': row.completionRate,
      'Kỳ trước': row.previous,
      'Ngày cập nhật': row.date,
    }))

    exportRows.push({
      STT: '',
      'Mã báo cáo': '',
      'Lớp học ID': '',
      'Mã lớp': '',
      'Lớp học': 'Tổng kết',
      'Cơ sở': '',
      'Khóa học ID': '',
      'Khóa học': '',
      'Giáo viên ID': '',
      'Giáo viên': '',
      'Trạng thái': `${totals.rows} bản ghi`,
      'Tổng số lớp': totals.totalClasses,
      'Sĩ số hiện tại': totals.currentStudents,
      'Sĩ số tối đa': totals.maxStudents,
      'Sĩ số trung bình': Number(totals.averageSize.toFixed(1)),
      'Tỷ lệ đầy lớp (%)': Number(totals.fillRate.toFixed(1)),
      'Tỷ lệ nghỉ học (%)': Number(totals.absenceRate.toFixed(1)),
      'Hoàn thành khóa (%)': Number(totals.completionRate.toFixed(1)),
      'Kỳ trước': '',
      'Ngày cập nhật': '',
    })

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao cao lop hoc')
    XLSX.writeFile(workbook, 'bao-cao-lop-hoc.xlsx')
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Báo cáo lớp học</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">Chi tiết báo cáo lớp học</h2>
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
          <SelectFilter label="Khóa học" value={filters.courseId} options={options.courses} onChange={(value) => updateFilter('courseId', value)} />
          <SelectFilter label="Lớp học" value={filters.classId} options={options.classes} onChange={(value) => updateFilter('classId', value)} />
          <SelectFilter label="Giáo viên" value={filters.teacherId} options={options.teachers} onChange={(value) => updateFilter('teacherId', value)} />
          <SelectFilter label="Trạng thái" value={filters.status} options={options.statuses} onChange={(value) => updateFilter('status', value)} />
          <label className="block md:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Tìm kiếm</span>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Tên lớp / Mã lớp / Mã báo cáo / Giáo viên"
                value={filters.keyword}
                onChange={(event) => updateFilter('keyword', event.target.value)}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[1820px] text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-4 py-4">STT</th>
              <th className="px-4 py-4">Mã BC</th>
              <th className="px-4 py-4">Mã lớp</th>
              <th className="px-4 py-4">Lớp học</th>
              <th className="px-4 py-4">Cơ sở</th>
              <th className="px-4 py-4">Khóa học</th>
              <th className="px-4 py-4">Giáo viên</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-4 py-4">Tổng số lớp</th>
              <th className="px-4 py-4">Sĩ số hiện tại</th>
              <th className="px-4 py-4">Sĩ số tối đa</th>
              <th className="px-4 py-4">Sĩ số TB</th>
              <th className="px-4 py-4">Đầy lớp</th>
              <th className="px-4 py-4">Nghỉ học</th>
              <th className="px-4 py-4">Hoàn thành khóa</th>
              <th className="px-4 py-4">Ngày cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pagedRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50/50">
                <td className="px-4 py-4 font-bold text-slate-700">{(safePage - 1) * pageSize + index + 1}</td>
                <td className="px-4 py-4 font-black text-blue-700">{row.id}</td>
                <td className="px-4 py-4 font-black text-blue-700">{row.classCode}</td>
                <td className="px-4 py-4 font-black text-slate-950">{row.className}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.branch}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.course}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.teacher}</td>
                <td className="px-4 py-4"><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{row.status}</span></td>
                <td className="px-4 py-4 font-black text-slate-950">{formatNumber(row.totalClasses)}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{formatNumber(row.currentStudents)}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{formatNumber(row.maxStudents)}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{formatNumber(row.averageSize, 1)}</td>
                <td className="px-4 py-4 font-semibold text-emerald-700">{row.fillRate}%</td>
                <td className="px-4 py-4 font-semibold text-rose-700">{row.absenceRate}%</td>
                <td className="px-4 py-4 font-semibold text-emerald-700">{row.completionRate}%</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.date}</td>
              </tr>
            ))}
            {!pagedRows.length ? (
              <tr>
                <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={16}>Không tìm thấy báo cáo lớp học phù hợp.</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot className="bg-slate-50 text-sm font-black text-slate-900">
            <tr>
              <td className="px-4 py-4" colSpan={8}>Tổng kết</td>
              <td className="px-4 py-4">{formatNumber(totals.totalClasses)}</td>
              <td className="px-4 py-4">{formatNumber(totals.currentStudents)}</td>
              <td className="px-4 py-4">{formatNumber(totals.maxStudents)}</td>
              <td className="px-4 py-4">{totals.averageSize.toFixed(1)}</td>
              <td className="px-4 py-4">{totals.fillRate.toFixed(1)}%</td>
              <td className="px-4 py-4">{totals.absenceRate.toFixed(1)}%</td>
              <td className="px-4 py-4" colSpan={2}>{totals.completionRate.toFixed(1)}% · Sĩ số cao nhất: {totals.highestSizeClass} · Nghỉ nhiều nhất: {totals.highestAbsenceClass}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Hiển thị {pagedRows.length ? (safePage - 1) * pageSize + 1 : 0}-{Math.min(safePage * pageSize, filteredRows.length)} / {filteredRows.length} bản ghi
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm font-bold text-slate-700" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>
            {[10, 20, 50, 100].map((value) => <option key={value} value={value}>{value}/trang</option>)}
          </select>
          <button type="button" className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-700 disabled:opacity-50" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Trước</button>
          <span className="text-sm font-black text-slate-700">Trang {safePage}/{pageCount}</span>
          <button type="button" className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-700 disabled:opacity-50" disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Sau</button>
        </div>
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

export default ClassReport
