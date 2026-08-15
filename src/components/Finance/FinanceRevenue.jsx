import { useMemo, useState } from 'react'
import { Download, RefreshCcw, Search } from 'lucide-react'
import * as XLSX from 'xlsx'
import { courseClasses, courses, teachers } from '../../datas/courses.js'

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value || 0)

const paymentStatusOptions = [
  { value: 'paid', label: 'Đã thu' },
  { value: 'partial', label: 'Thu một phần' },
  { value: 'debt', label: 'Còn nợ' },
]

const pageSizeOptions = [10, 20, 50, 100]
const branchOptions = ['Cơ sở Quận 1', 'Cơ sở Bình Thạnh', 'Cơ sở Thủ Đức']
const saleOptions = ['Lan', 'Hùng', 'Minh Châu']

const courseMap = Object.fromEntries(courses.map((item) => [item.id, item]))
const classMap = Object.fromEntries(courseClasses.map((item) => [item.id, item]))
const teacherMap = Object.fromEntries(teachers.map((item) => [item.id, item]))

const defaultFilters = {
  fromDate: '',
  toDate: '',
  branch: '',
  courseId: '',
  classId: '',
  teacherId: '',
  sale: '',
  paymentMethod: '',
  paymentStatus: '',
  keyword: '',
}

function getStableIndex(value, length) {
  const total = String(value || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return total % length
}

function getPaymentStatus(row) {
  if (row.actualPaid <= 0 && row.debt > 0) return 'debt'
  if (row.debt > 0) return 'partial'
  return 'paid'
}

function sortRows(rows, sort) {
  return [...rows].sort((a, b) => {
    const direction = sort.direction === 'asc' ? 1 : -1
    if (sort.field === 'actualPaid') return (a.actualPaid - b.actualPaid) * direction
    return String(a.paidAt || '').localeCompare(String(b.paidAt || '')) * direction
  })
}

function FinanceRevenue({ tuitions, payments, paymentMethods }) {
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ field: 'paidAt', direction: 'desc' })
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const tuitionMap = useMemo(() => Object.fromEntries(tuitions.map((item) => [item.id, item])), [tuitions])

  const reportRows = useMemo(() => {
    const paymentRows = payments
      .filter((payment) => payment.status !== 'cancelled')
      .map((payment) => {
        const tuition = tuitionMap[payment.tuitionId]
        const classItem = classMap[tuition?.classId]
        const teacher = teacherMap[classItem?.teacherId]
        const discount = tuition?.discountTotal || 0
        const debt = tuition?.remaining || 0
        const sale = saleOptions[getStableIndex(payment.studentId, saleOptions.length)]
        const branch = branchOptions[getStableIndex(classItem?.roomId || tuition?.classId, branchOptions.length)]

        return {
          id: payment.id,
          paidAt: payment.paidAt,
          receiptNo: payment.receiptNo,
          studentId: payment.studentId,
          studentCode: tuition?.studentCode || payment.studentId,
          studentName: payment.studentName,
          courseId: tuition?.courseId || payment.courseId,
          courseName: tuition?.courseName || courseMap[payment.courseId]?.name || payment.courseName,
          classId: tuition?.classId || payment.classId,
          className: tuition?.className || classItem?.name || payment.className,
          teacherId: classItem?.teacherId || '',
          teacherName: teacher?.name || '-',
          sale,
          branch,
          tuitionFee: tuition?.totalFee || 0,
          discount,
          actualPaid: payment.amount,
          debt,
          method: payment.method,
          methodName: payment.methodName,
          paymentStatus: getPaymentStatus({ actualPaid: payment.amount, debt }),
        }
      })

    const paidTuitionIds = new Set(payments.filter((payment) => payment.status !== 'cancelled').map((payment) => payment.tuitionId))
    const unpaidRows = tuitions
      .filter((tuition) => !paidTuitionIds.has(tuition.id))
      .map((tuition) => {
        const classItem = classMap[tuition.classId]
        const teacher = teacherMap[classItem?.teacherId]
        const sale = saleOptions[getStableIndex(tuition.studentId, saleOptions.length)]
        const branch = branchOptions[getStableIndex(classItem?.roomId || tuition.classId, branchOptions.length)]

        return {
          id: `unpaid-${tuition.id}`,
          paidAt: tuition.dueDate,
          receiptNo: 'Chưa thu',
          studentId: tuition.studentId,
          studentCode: tuition.studentCode,
          studentName: tuition.studentName,
          courseId: tuition.courseId,
          courseName: tuition.courseName,
          classId: tuition.classId,
          className: tuition.className,
          teacherId: classItem?.teacherId || '',
          teacherName: teacher?.name || '-',
          sale,
          branch,
          tuitionFee: tuition.totalFee,
          discount: tuition.discountTotal,
          actualPaid: 0,
          debt: tuition.remaining,
          method: '',
          methodName: '-',
          paymentStatus: 'debt',
        }
      })

    return [...paymentRows, ...unpaidRows]
  }, [payments, tuitionMap, tuitions])

  const filteredRows = useMemo(() => {
    const search = filters.keyword.trim().toLowerCase()

    return reportRows.filter((row) => {
      const matchesFrom = !filters.fromDate || row.paidAt >= filters.fromDate
      const matchesTo = !filters.toDate || row.paidAt <= filters.toDate
      const matchesBranch = !filters.branch || row.branch === filters.branch
      const matchesCourse = !filters.courseId || row.courseId === filters.courseId
      const matchesClass = !filters.classId || row.classId === filters.classId
      const matchesTeacher = !filters.teacherId || row.teacherId === filters.teacherId
      const matchesSale = !filters.sale || row.sale === filters.sale
      const matchesMethod = !filters.paymentMethod || row.method === filters.paymentMethod
      const matchesStatus = !filters.paymentStatus || row.paymentStatus === filters.paymentStatus
      const matchesSearch = !search || [row.studentName, row.studentCode, row.receiptNo].some((value) => String(value || '').toLowerCase().includes(search))

      return matchesFrom && matchesTo && matchesBranch && matchesCourse && matchesClass && matchesTeacher && matchesSale && matchesMethod && matchesStatus && matchesSearch
    })
  }, [filters, reportRows])

  const sortedRows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort])
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const pagedRows = sortedRows.slice(startIndex, startIndex + pageSize)

  const totals = useMemo(() => {
    return filteredRows.reduce((sum, row) => {
      sum.tuitionFee += row.tuitionFee
      sum.discount += row.discount
      sum.actualPaid += row.actualPaid
      sum.debt += row.debt
      return sum
    }, { tuitionFee: 0, discount: 0, actualPaid: 0, debt: 0 })
  }, [filteredRows])

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'courseId' ? { classId: '' } : {}),
    }))
    setPage(1)
  }

  const toggleSort = (field) => {
    setSort((current) => ({
      field,
      direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  const exportExcel = () => {
    const rows = sortedRows.map((row, index) => ({
      STT: index + 1,
      'Ngày thu': row.paidAt,
      'Mã phiếu': row.receiptNo,
      'Học viên': row.studentName,
      'Khóa học': row.courseName,
      'Lớp học': row.className,
      'Giáo viên': row.teacherName,
      Sale: row.sale,
      'Học phí': row.tuitionFee,
      'Giảm giá': row.discount,
      'Thực thu': row.actualPaid,
      'Còn nợ': row.debt,
      'Phương thức': row.methodName,
      'Trạng thái': paymentStatusOptions.find((item) => item.value === row.paymentStatus)?.label || row.paymentStatus,
    }))

    rows.push({
      STT: '',
      'Ngày thu': '',
      'Mã phiếu': '',
      'Học viên': 'Tổng kết',
      'Khóa học': '',
      'Lớp học': '',
      'Giáo viên': '',
      Sale: '',
      'Học phí': totals.tuitionFee,
      'Giảm giá': totals.discount,
      'Thực thu': totals.actualPaid,
      'Còn nợ': totals.debt,
      'Phương thức': '',
      'Trạng thái': '',
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao cao doanh thu')
    XLSX.writeFile(workbook, 'bao-cao-doanh-thu.xlsx')
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Báo cáo doanh thu</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">Bảng dữ liệu thu học phí</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={() => { setFilters(defaultFilters); setPage(1) }}>
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
          <SelectFilter label="Cơ sở" value={filters.branch} onChange={(value) => updateFilter('branch', value)} options={branchOptions.map((item) => ({ value: item, label: item }))} />
          <SelectFilter label="Khóa học" value={filters.courseId} onChange={(value) => updateFilter('courseId', value)} options={courses.map((item) => ({ value: item.id, label: item.name }))} />
          <SelectFilter label="Lớp học" value={filters.classId} onChange={(value) => updateFilter('classId', value)} options={courseClasses.filter((item) => !filters.courseId || item.courseId === filters.courseId).map((item) => ({ value: item.id, label: item.name }))} />
          <SelectFilter label="Giáo viên" value={filters.teacherId} onChange={(value) => updateFilter('teacherId', value)} options={teachers.map((item) => ({ value: item.id, label: item.name }))} />
          <SelectFilter label="Tư vấn viên (Sale)" value={filters.sale} onChange={(value) => updateFilter('sale', value)} options={saleOptions.map((item) => ({ value: item, label: item }))} />
          <SelectFilter label="Phương thức thanh toán" value={filters.paymentMethod} onChange={(value) => updateFilter('paymentMethod', value)} options={paymentMethods.map((item) => ({ value: item.value, label: item.label }))} />
          <SelectFilter label="Trạng thái thanh toán" value={filters.paymentStatus} onChange={(value) => updateFilter('paymentStatus', value)} options={paymentStatusOptions} />
          <label className="block xl:col-span-3">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Ô tìm kiếm</span>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Tên học viên / Mã học viên / Mã phiếu"
                value={filters.keyword}
                onChange={(event) => updateFilter('keyword', event.target.value)}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[1740px] text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-4 py-4">STT</th>
              <SortHeader label="Ngày thu" field="paidAt" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-4">Mã phiếu</th>
              <th className="px-4 py-4">Học viên</th>
              <th className="px-4 py-4">Khóa học</th>
              <th className="px-4 py-4">Lớp học</th>
              <th className="px-4 py-4">Giáo viên</th>
              <th className="px-4 py-4">Sale</th>
              <th className="px-4 py-4">Học phí</th>
              <th className="px-4 py-4">Giảm giá</th>
              <SortHeader label="Thực thu" field="actualPaid" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-4">Còn nợ</th>
              <th className="px-4 py-4">Phương thức</th>
              <th className="px-4 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pagedRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50/50">
                <td className="px-4 py-4 font-bold text-slate-700">{startIndex + index + 1}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.paidAt}</td>
                <td className="px-4 py-4 font-black text-blue-700">{row.receiptNo}</td>
                <td className="px-4 py-4 font-black text-slate-950">{row.studentName}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.courseName}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.className}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.teacherName}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.sale}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{formatCurrency(row.tuitionFee)}</td>
                <td className="px-4 py-4 font-semibold text-amber-700">{formatCurrency(row.discount)}</td>
                <td className="px-4 py-4 font-black text-emerald-700">{formatCurrency(row.actualPaid)}</td>
                <td className="px-4 py-4 font-black text-red-700">{formatCurrency(row.debt)}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.methodName}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {paymentStatusOptions.find((item) => item.value === row.paymentStatus)?.label}
                  </span>
                </td>
              </tr>
            ))}
            {!pagedRows.length ? (
              <tr>
                <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={14}>Không tìm thấy dữ liệu doanh thu phù hợp.</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot className="bg-slate-50 text-sm font-black text-slate-900">
            <tr>
              <td className="px-4 py-4" colSpan={8}>Tổng kết</td>
              <td className="px-4 py-4">{formatCurrency(totals.tuitionFee)}</td>
              <td className="px-4 py-4 text-amber-700">{formatCurrency(totals.discount)}</td>
              <td className="px-4 py-4 text-emerald-700">{formatCurrency(totals.actualPaid)}</td>
              <td className="px-4 py-4 text-red-700">{formatCurrency(totals.debt)}</td>
              <td className="px-4 py-4" colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-blue-200/70 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm shadow-blue-100/60 md:grid-cols-4">
        <SummaryCard label="Tổng học phí" value={totals.tuitionFee} />
        <SummaryCard label="Tổng giảm giá" value={totals.discount} />
        <SummaryCard label="Tổng thực thu" value={totals.actualPaid} />
        <SummaryCard label="Tổng công nợ" value={totals.debt} />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">Số bản ghi/trang</span>
          <select className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>
            {pageSizeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50" onClick={() => setPage((value) => Math.max(value - 1, 1))} disabled={currentPage <= 1}>Trước</button>
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">{currentPage}/{totalPages}</span>
          <button type="button" className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50" onClick={() => setPage((value) => Math.min(value + 1, totalPages))} disabled={currentPage >= totalPages}>Sau</button>
        </div>
      </div>
    </section>
  )
}

function SelectFilter({ label, value, onChange, options }) {
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

function SortHeader({ label, field, sort, onSort }) {
  const icon = sort.field === field ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'
  return (
    <th className="px-4 py-4">
      <button type="button" className="inline-flex items-center gap-1 font-black" onClick={() => onSort(field)}>
        {label} <span>{icon}</span>
      </button>
    </th>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-950">{formatCurrency(value)}</p>
    </div>
  )
}

export default FinanceRevenue
