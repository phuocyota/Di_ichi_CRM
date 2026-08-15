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

function StudentReport({ report, onRefresh }) {
  const rows = useMemo(() => report?.details || [], [report])
  const [filters, setFilters] = useState(defaultFilters)

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
      const matchesKeyword = !keyword || [row.studentCode, row.studentName, row.id, row.course, row.className].some((value) => String(value || '').toLowerCase().includes(keyword))

      return matchesFrom && matchesTo && matchesBranch && matchesCourse && matchesClass && matchesTeacher && matchesStatus && matchesKeyword
    })
  }, [filters, rows])

  const totals = useMemo(() => {
    const count = filteredRows.length || 1
    return {
      students: filteredRows.length,
      averageScore: filteredRows.reduce((sum, row) => sum + Number(row.averageScore || 0), 0) / count,
      attendanceRate: filteredRows.reduce((sum, row) => sum + Number(row.attendanceRate || 0), 0) / count,
      homeworkRate: filteredRows.reduce((sum, row) => sum + Number(row.homeworkRate || 0), 0) / count,
    }
  }, [filteredRows])

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'courseId' ? { classId: '' } : {}),
    }))
  }

  const refresh = () => {
    setFilters(defaultFilters)
    onRefresh()
  }

  const exportExcel = () => {
    const exportRows = filteredRows.map((row, index) => ({
      STT: index + 1,
      'Mã báo cáo': row.id,
      'Mã học viên': row.studentCode,
      'Tên học viên': row.studentName,
      'Cơ sở': row.branch,
      'Khóa học ID': row.courseId,
      'Khóa học': row.course,
      'Lớp học ID': row.classId,
      'Lớp học': row.className,
      'Giáo viên ID': row.teacherId,
      'Giáo viên': row.teacher,
      'Trạng thái': row.status,
      'Điểm TB': row.averageScore,
      'Homework (%)': row.homeworkRate,
      'Chuyên cần (%)': row.attendanceRate,
      'Tiến độ (%)': row.progress,
      'Kỳ trước': row.previous,
      'Ngày cập nhật': row.date,
    }))

    exportRows.push({
      STT: '',
      'Mã báo cáo': '',
      'Mã học viên': '',
      'Tên học viên': 'Tổng kết',
      'Cơ sở': '',
      'Khóa học ID': '',
      'Khóa học': '',
      'Lớp học ID': '',
      'Lớp học': '',
      'Giáo viên ID': '',
      'Giáo viên': '',
      'Trạng thái': '',
      'Điểm TB': Number(totals.averageScore.toFixed(1)),
      'Homework (%)': Number(totals.homeworkRate.toFixed(1)),
      'Chuyên cần (%)': Number(totals.attendanceRate.toFixed(1)),
      'Tiến độ (%)': '',
      'Kỳ trước': '',
      'Ngày cập nhật': '',
    })

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao cao hoc vien')
    XLSX.writeFile(workbook, 'bao-cao-hoc-vien.xlsx')
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Báo cáo học viên</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">Chi tiết báo cáo học viên</h2>
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
                placeholder="Tên học viên / Mã học viên / Mã báo cáo"
                value={filters.keyword}
                onChange={(event) => updateFilter('keyword', event.target.value)}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[1500px] text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-4 py-4">STT</th>
              <th className="px-4 py-4">Mã HV</th>
              <th className="px-4 py-4">Học viên</th>
              <th className="px-4 py-4">Cơ sở</th>
              <th className="px-4 py-4">Khóa học</th>
              <th className="px-4 py-4">Lớp học</th>
              <th className="px-4 py-4">Giáo viên</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-4 py-4">Điểm TB</th>
              <th className="px-4 py-4">Homework</th>
              <th className="px-4 py-4">Chuyên cần</th>
              <th className="px-4 py-4">Tiến độ</th>
              <th className="px-4 py-4">Ngày cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50/50">
                <td className="px-4 py-4 font-bold text-slate-700">{index + 1}</td>
                <td className="px-4 py-4 font-black text-blue-700">{row.studentCode}</td>
                <td className="px-4 py-4 font-black text-slate-950">{row.studentName}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.branch}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.course}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.className}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.teacher}</td>
                <td className="px-4 py-4"><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{row.status}</span></td>
                <td className="px-4 py-4 font-black text-slate-950">{row.averageScore}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.homeworkRate}%</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.attendanceRate}%</td>
                <td className="px-4 py-4 font-semibold text-emerald-700">{row.progress}%</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.date}</td>
              </tr>
            ))}
            {!filteredRows.length ? (
              <tr>
                <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={13}>Không tìm thấy báo cáo học viên phù hợp.</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot className="bg-slate-50 text-sm font-black text-slate-900">
            <tr>
              <td className="px-4 py-4" colSpan={8}>Tổng kết</td>
              <td className="px-4 py-4">{totals.averageScore.toFixed(1)}</td>
              <td className="px-4 py-4">{totals.homeworkRate.toFixed(1)}%</td>
              <td className="px-4 py-4">{totals.attendanceRate.toFixed(1)}%</td>
              <td className="px-4 py-4" colSpan={2}>{totals.students} học viên</td>
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

export default StudentReport
