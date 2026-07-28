import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Eye, Printer, ReceiptText, Search, XCircle } from 'lucide-react'

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value)

function FinanceTable({ transactions, filters, keyword, onKeywordChange, onSelectTransaction, onOpenModal }) {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState([])
  const [filterValues, setFilterValues] = useState({
    student: '',
    course: '',
    className: '',
    branch: '',
    methodValue: '',
    statusValue: '',
    dateRange: '',
    revenueRange: '',
    dueRange: '',
  })

  const updateFilter = (id, value) => {
    setFilterValues((current) => ({ ...current, [id]: value }))
    setColumnFilters((current) => {
      const next = current.filter((item) => item.id !== id)
      return value ? [...next, { id, value }] : next
    })
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input type="checkbox" checked={table.getIsAllPageRowsSelected()} onChange={table.getToggleAllPageRowsSelectedHandler()} aria-label="Chọn tất cả" />
        ),
        cell: ({ row }) => (
          <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} aria-label={`Chọn ${row.original.code}`} />
        ),
      },
      { accessorKey: 'code', header: 'Mã giao dịch' },
      { accessorKey: 'student', header: 'Học viên', filterFn: 'equalsString' },
      { accessorKey: 'course', header: 'Khóa học', filterFn: 'equalsString' },
      { accessorKey: 'className', header: 'Lớp học', filterFn: 'equalsString' },
      { accessorKey: 'tuitionFee', header: 'Học phí', cell: ({ row }) => formatCurrency(row.original.tuitionFee) },
      { accessorKey: 'promotion', header: 'Khuyến mãi', cell: ({ row }) => formatCurrency(row.original.promotion) },
      { accessorKey: 'voucher', header: 'Voucher', cell: ({ row }) => formatCurrency(row.original.voucher) },
      { accessorKey: 'discount', header: 'Giảm học phí', cell: ({ row }) => formatCurrency(row.original.discount) },
      { accessorKey: 'scholarship', header: 'Học bổng', cell: ({ row }) => formatCurrency(row.original.scholarship) },
      { accessorKey: 'payable', header: 'Số tiền phải thu', cell: ({ row }) => formatCurrency(row.original.payable) },
      { accessorKey: 'paid', header: 'Đã đóng', cell: ({ row }) => formatCurrency(row.original.paid) },
      { accessorKey: 'debt', header: 'Còn thiếu', cell: ({ row }) => formatCurrency(row.original.debt) },
      { accessorKey: 'methodValue', header: 'Phương thức', filterFn: 'equalsString', cell: ({ row }) => row.original.method },
      {
        accessorKey: 'statusValue',
        header: 'Trạng thái',
        filterFn: 'equalsString',
        cell: ({ row }) => {
          const status = filters.statuses.find((item) => item.value === row.original.statusValue)
          return (
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status?.badgeClass || ''}`}>
              {row.original.status}
            </span>
          )
        },
      },
      { accessorKey: 'paidAt', header: 'Ngày thanh toán' },
      { accessorKey: 'dueDate', header: 'Ngày đến hạn' },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-blue-700 shadow-sm" title="Xem chi tiết" aria-label={`Xem ${row.original.code}`} onClick={() => onSelectTransaction(row.original)}>
              <Eye size={17} aria-hidden="true" />
            </button>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm" title="Thu học phí" aria-label={`Thu ${row.original.code}`} onClick={() => onOpenModal('collectTuition', row.original)}>
              <ReceiptText size={17} aria-hidden="true" />
            </button>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-slate-700 shadow-sm" title="In phiếu thu" aria-label={`In ${row.original.code}`} onClick={() => onOpenModal('printReceipt', row.original)}>
              <Printer size={17} aria-hidden="true" />
            </button>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 shadow-sm" title="Hủy phiếu thu" aria-label={`Hủy ${row.original.code}`} onClick={() => onOpenModal('cancelReceipt', row.original)}>
              <XCircle size={17} aria-hidden="true" />
            </button>
          </div>
        ),
      },
    ],
    [filters.statuses, onOpenModal, onSelectTransaction],
  )

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting, rowSelection, globalFilter: keyword, columnFilters },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: onKeywordChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  })

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">Danh sách giao dịch</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Đã chọn {Object.keys(rowSelection).length} dòng.</p>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3 xl:w-96">
            <Search size={18} className="text-slate-500" aria-hidden="true" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder="Từ khóa, mã giao dịch, học viên" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['student', 'Học viên', filters.students],
            ['course', 'Khóa học', filters.courses],
            ['className', 'Lớp học', filters.classes],
            ['branch', 'Cơ sở', filters.branches],
            ['dateRange', 'Khoảng thời gian', filters.dateRanges],
            ['revenueRange', 'Khoảng doanh thu', filters.revenueRanges],
            ['dueRange', 'Hạn thanh toán', filters.dueRanges],
          ].map(([id, label, options]) => (
            <label key={id} className="block">
              <span className="text-xs font-bold text-slate-500">{label}</span>
              <select className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none" value={filterValues[id]} onChange={(event) => id.endsWith('Range') ? setFilterValues((current) => ({ ...current, [id]: event.target.value })) : updateFilter(id, event.target.value)}>
                <option value="">Tất cả</option>
                {options.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          ))}
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Phương thức</span>
            <select className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none" value={filterValues.methodValue} onChange={(event) => updateFilter('methodValue', event.target.value)}>
              <option value="">Tất cả</option>
              {filters.paymentMethods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Trạng thái</span>
            <select className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none" value={filterValues.statusValue} onChange={(event) => updateFilter('statusValue', event.target.value)}>
              <option value="">Tất cả</option>
              {filters.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-300">
        <table className="min-w-[1780px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : (
                      <button type="button" className="inline-flex items-center gap-1" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? (header.column.getIsSorted() ? <ChevronDown size={14} /> : <ChevronsUpDown size={14} />) : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 font-medium text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-500">Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</p>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft size={16} aria-hidden="true" /> Trước
          </button>
          <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Sau <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default FinanceTable
