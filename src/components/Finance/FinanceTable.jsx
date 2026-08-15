import { useMemo, useState } from 'react'
import { Bell, ChevronLeft, ChevronRight, Eye, FileText, History, MoreVertical, Printer, ReceiptText, RotateCcw, Search } from 'lucide-react'

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value || 0)
const PAGE_SIZE = 5

function Badge({ value, statuses }) {
  const status = statuses.find((item) => item.value === value)
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${status?.badgeClass || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
      {status?.label || value}
    </span>
  )
}

function Pagination({ page, totalPages, totalItems, start, end, onPageChange }) {
  if (!totalItems) return null

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-500">
        Hiển thị {start}-{end} / {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Trước
        </button>
        <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Sau
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function TuitionStats({ stats }) {
  const cards = [
    { label: 'Tổng học phí', value: stats.totalPayable, color: 'text-slate-950' },
    { label: 'Đã thu', value: stats.totalPaid, color: 'text-emerald-700' },
    { label: 'Còn nợ', value: stats.totalRemaining, color: 'text-amber-700' },
    { label: 'Quá hạn', value: stats.totalOverdue, color: 'text-red-700' },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
          <p className={`mt-2 text-xl font-black ${card.color}`}>{formatCurrency(card.value)}</p>
        </div>
      ))}
    </div>
  )
}

function FinanceTable({
  activeTab,
  items,
  tuitionStatuses,
  debtStatuses,
  paymentMethods,
  tuitionStats,
  tuitionFilters,
  courseOptions,
  classOptions,
  timeFilters,
  onTuitionFilterChange,
  onCollectPayment,
  onPrintReceipt,
  onPrintTuitionReceipt,
  onExportInvoice,
  onCancelPayment,
  onRemindDebt,
  onShowTuitionDetail,
  onShowPaymentHistory,
}) {
  const [receiptStudentKeyword, setReceiptStudentKeyword] = useState('')
  const [debtStudentKeyword, setDebtStudentKeyword] = useState('')
  const [debtStatusFilter, setDebtStatusFilter] = useState('')
  const [pageByTab, setPageByTab] = useState({})

  const getPagedData = (sourceItems, key) => {
    const totalPages = Math.max(1, Math.ceil(sourceItems.length / PAGE_SIZE))
    const page = Math.min(pageByTab[key] || 1, totalPages)
    const startIndex = (page - 1) * PAGE_SIZE

    return {
      page,
      totalPages,
      totalItems: sourceItems.length,
      start: sourceItems.length ? startIndex + 1 : 0,
      end: Math.min(startIndex + PAGE_SIZE, sourceItems.length),
      rows: sourceItems.slice(startIndex, startIndex + PAGE_SIZE),
    }
  }

  const updatePage = (key, page) => {
    setPageByTab((current) => ({ ...current, [key]: page }))
  }

  const receiptRows = useMemo(() => {
    const search = receiptStudentKeyword.trim().toLowerCase()
    if (!search) return items
    return items.filter((item) => String(item.studentName || '').toLowerCase().includes(search))
  }, [items, receiptStudentKeyword])

  const debtRows = useMemo(() => {
    const search = debtStudentKeyword.trim().toLowerCase()
    return items.filter((item) => {
      const matchesStudent = !search || String(item.studentName || '').toLowerCase().includes(search)
      const matchesStatus = !debtStatusFilter || item.status === debtStatusFilter
      return matchesStudent && matchesStatus
    })
  }, [debtStatusFilter, debtStudentKeyword, items])

  const receiptPage = getPagedData(receiptRows, 'receiptHistory')
  const tuitionPage = getPagedData(items, 'tuition')
  const debtFilters = (
    <div className="mb-4 grid gap-3 rounded-xl border border-blue-200/70 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm shadow-blue-100/60 md:grid-cols-2">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Tìm học viên</span>
        <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
          <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
          <input
            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Nhập tên học viên"
            value={debtStudentKeyword}
            onChange={(event) => setDebtStudentKeyword(event.target.value)}
          />
        </div>
      </label>
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Trạng thái</span>
        <select
          className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          value={debtStatusFilter}
          onChange={(event) => setDebtStatusFilter(event.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {debtStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
    </div>
  )

  if (activeTab === 'Lịch sử thu tiền') {
    return (
      <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Lịch sử thu tiền</p>
          <h2 className="mt-2 text-lg font-black text-slate-950">Lịch sử phiếu thu học phí</h2>
        </div>
        <label className="mb-4 block max-w-md">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Tìm học viên</span>
          <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3">
            <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
            <input
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Nhập tên học viên"
              value={receiptStudentKeyword}
              onChange={(event) => {
                setReceiptStudentKeyword(event.target.value)
                updatePage('receiptHistory', 1)
              }}
            />
          </div>
        </label>
        <div className="overflow-x-auto rounded-xl border border-blue-100">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-blue-600 text-xs font-black uppercase text-white">
              <tr>
                <th className="px-6 py-4">Số phiếu</th>
                <th className="px-4 py-4">Học viên</th>
                <th className="px-4 py-4">Số tiền</th>
                <th className="px-4 py-4">Phương thức</th>
                <th className="px-4 py-4">Ngày thu</th>
                <th className="px-4 py-4">Người nộp</th>
                <th className="px-4 py-4">Thu ngân</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {receiptPage.rows.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4 font-black text-blue-700">{item.receiptNo}</td>
                  <td className="px-4 py-4 font-bold text-slate-900">{item.studentName}</td>
                  <td className="px-4 py-4 font-black text-slate-900">{formatCurrency(item.amount)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.methodName}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.paidAt}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.payer || '-'}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.collectorName}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700" onClick={() => onPrintReceipt(item)} title="In phiếu thu"><Printer size={17} /></button>
                      <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700" onClick={() => onExportInvoice(item)} title="Xuất hóa đơn"><FileText size={17} /></button>
                      <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700" onClick={() => onCancelPayment(item)} title="Hủy phiếu thu"><RotateCcw size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!receiptPage.rows.length ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={8}>Không tìm thấy phiếu thu phù hợp.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination
          page={receiptPage.page}
          totalPages={receiptPage.totalPages}
          totalItems={receiptPage.totalItems}
          start={receiptPage.start}
          end={receiptPage.end}
          onPageChange={(page) => updatePage('receiptHistory', page)}
        />
      </section>
    )
  }

  if (activeTab === 'Công nợ') {
    return (
      <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Công nợ</p>
          <h2 className="mt-2 text-lg font-black text-slate-950">Học viên còn nợ học phí</h2>
        </div>
        {debtFilters}
        <div className="overflow-x-auto rounded-xl border border-blue-100">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-blue-600 text-xs font-black uppercase text-white">
              <tr>
                <th className="px-6 py-4">Học viên</th>
                <th className="px-4 py-4">Khóa học</th>
                <th className="px-4 py-4">Tổng học phí</th>
                <th className="px-4 py-4">Đã đóng</th>
                <th className="px-4 py-4">Còn nợ</th>
                <th className="px-4 py-4">Hạn thanh toán</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {debtRows.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4 font-black text-slate-900">{item.studentName}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.courseName}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{formatCurrency(item.totalFee)}</td>
                  <td className="px-4 py-4 font-semibold text-emerald-700">{formatCurrency(item.paid)}</td>
                  <td className="px-4 py-4 font-black text-red-700">{formatCurrency(item.remaining)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.dueDate}</td>
                  <td className="px-4 py-4"><Badge value={item.status} statuses={debtStatuses} /></td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-black text-emerald-700" onClick={() => onCollectPayment(item)}>
                        <ReceiptText size={16} /> Thu bổ sung
                      </button>
                      <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-black text-amber-700" onClick={() => onRemindDebt(item)}>
                        <Bell size={16} /> Nhắc đóng
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!debtRows.length ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={8}>Không tìm thấy công nợ phù hợp.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Học phí</p>
        <h2 className="mt-2 text-lg font-black text-slate-950">Khoản học phí phải thu của học viên</h2>
      </div>

      <TuitionStats stats={tuitionStats} />

      <div className="mt-4 grid gap-3 rounded-xl border border-blue-200/70 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm shadow-blue-100/60 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Trạng thái</span>
          <select className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={tuitionFilters.status} onChange={(event) => onTuitionFilterChange('status', event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {tuitionStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Khóa học</span>
          <select className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={tuitionFilters.courseId} onChange={(event) => onTuitionFilterChange('courseId', event.target.value)}>
            <option value="">Tất cả khóa học</option>
            {courseOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Lớp học</span>
          <select className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={tuitionFilters.classId} onChange={(event) => onTuitionFilterChange('classId', event.target.value)}>
            <option value="">Tất cả lớp học</option>
            {classOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Thời gian</span>
          <select className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={tuitionFilters.time} onChange={(event) => onTuitionFilterChange('time', event.target.value)}>
            {timeFilters.map((item) => <option key={item.value || 'all'} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[1480px] text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-6 py-4">Mã HP</th>
              <th className="px-4 py-4">Học viên</th>
              <th className="px-4 py-4">Khóa học</th>
              <th className="px-4 py-4">Lớp học</th>
              <th className="px-4 py-4">Tổng học phí</th>
              <th className="px-4 py-4">Giảm giá/khuyến mãi</th>
              <th className="px-4 py-4">Đã thu</th>
              <th className="px-4 py-4">Còn lại</th>
              <th className="px-4 py-4">Hạn thanh toán</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tuitionPage.rows.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50">
                <td className="px-6 py-4 font-black text-blue-700">{item.code}</td>
                <td className="px-4 py-4 font-bold text-slate-900">{item.studentName}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{item.courseName}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{item.className}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{formatCurrency(item.totalFee)}</td>
                <td className="px-4 py-4">
                  <div className="font-black text-amber-700">{formatCurrency(item.discountTotal)}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">Phải thu: {formatCurrency(item.payable)}</div>
                </td>
                <td className="px-4 py-4 font-semibold text-emerald-700">{formatCurrency(item.paid)}</td>
                <td className="px-4 py-4 font-black text-red-700">{formatCurrency(item.remaining)}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{item.dueDate}</td>
                <td className="px-4 py-4"><Badge value={item.status} statuses={tuitionStatuses} /></td>
                <td className="px-6 py-4 text-right">
                  <details className="relative inline-block">
                    <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
                      <MoreVertical size={16} /> Menu
                    </summary>
                    <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 text-left shadow-xl">
                      <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50" onClick={() => onShowTuitionDetail(item)}>
                        <Eye size={16} /> Chi tiết
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50" onClick={() => onCollectPayment(item)}>
                        <ReceiptText size={16} /> Thu tiền
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50" onClick={() => onPrintTuitionReceipt(item)}>
                        <Printer size={16} /> In phiếu thu
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50" onClick={() => onShowPaymentHistory(item)}>
                        <History size={16} /> Lịch sử thanh toán
                      </button>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {!tuitionPage.rows.length ? (
              <tr>
                <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={11}>Không tìm thấy khoản học phí phù hợp.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination
        page={tuitionPage.page}
        totalPages={tuitionPage.totalPages}
        totalItems={tuitionPage.totalItems}
        start={tuitionPage.start}
        end={tuitionPage.end}
        onPageChange={(page) => updatePage('tuition', page)}
      />
      <p className="mt-4 text-sm font-semibold text-slate-500">Phương thức hỗ trợ: {paymentMethods.map((item) => item.label).join(', ')}.</p>
    </section>
  )
}

export default FinanceTable
