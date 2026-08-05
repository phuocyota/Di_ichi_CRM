import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Eye, Search, TrendingDown, TrendingUp } from 'lucide-react'

function formatValue(value, key) {
  if (typeof value === 'number' && ['revenue', 'cost', 'profit', 'debt', 'collected', 'uncollected'].includes(key)) return `${Math.round(value / 1000000)}M`
  if (typeof value === 'number' && /rate|conversion|progress|kpi|completion/i.test(key)) return `${value}%`
  return value
}

const columnLabels = {
  id: 'Mã',
  branch: 'Cơ sở',
  course: 'Khóa học',
  className: 'Lớp học',
  teacher: 'Giáo viên',
  staff: 'NV tuyển sinh',
  source: 'Nguồn lead',
  status: 'Trạng thái',
  revenue: 'Doanh thu',
  conversion: 'Chuyển đổi',
  averageScore: 'Điểm TB',
  homeworkRate: 'Homework',
  attendanceRate: 'Chuyên cần',
  kpi: 'KPI',
  hours: 'Giờ dạy',
  profit: 'Lợi nhuận',
  debt: 'Công nợ',
  fillRate: 'Đầy lớp',
  absenceRate: 'Nghỉ học',
  completionRate: 'Hoàn thành',
  previous: 'Kỳ trước',
  date: 'Ngày',
}

function getMainMetric(row) {
  return row.revenue || row.conversion || row.progress || row.kpi || row.completionRate || row.averageScore || 0
}

function ReportDetail({ report, rows, keyword, onKeywordChange, onOpenDetail }) {
  const [sorting, setSorting] = useState([])

  const columns = useMemo(() => {
    const keys = ['id', 'branch', 'course', 'className', 'teacher', 'staff', 'source', 'status', 'revenue', 'conversion', 'averageScore', 'attendanceRate', 'kpi', 'profit', 'debt', 'fillRate', 'absenceRate', 'completionRate', 'previous', 'date']
      .filter((key) => rows.some((row) => row[key] !== undefined))

    return [
      ...keys.map((key) => ({
        accessorKey: key,
        header: columnLabels[key] || key,
        cell: ({ getValue }) => <span className={key === 'id' ? 'font-black text-blue-700' : ''}>{formatValue(getValue(), key)}</span>,
      })),
      {
        id: 'trend',
        header: 'Xu hướng',
        cell: ({ row }) => {
          const metric = Number(getMainMetric(row.original))
          const previous = Number(row.original.previous || 0)
          const isUp = metric >= previous
          return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {isUp ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
              {isUp ? 'Tăng' : 'Giảm'}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Chi tiết',
        cell: ({ row }) => (
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700" aria-label={`Xem ${row.original.id}`} onClick={() => onOpenDetail(row.original)}>
            <Eye size={17} aria-hidden="true" />
          </button>
        ),
      },
    ]
  }, [onOpenDetail, rows])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter: keyword },
    onSortingChange: setSorting,
    onGlobalFilterChange: onKeywordChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  const totals = useMemo(() => {
    const count = rows.length || 1
    const revenue = rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0)
    const avgMetric = rows.reduce((sum, row) => sum + Number(getMainMetric(row) || 0), 0) / count
    const avgPrevious = rows.reduce((sum, row) => sum + Number(row.previous || 0), 0) / count
    return { revenue, avgMetric, avgPrevious, delta: avgMetric - avgPrevious }
  }, [rows])

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">Chi tiết {report.label.toLowerCase()}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Bảng dữ liệu chi tiết có search, sort, pagination và so sánh với kỳ trước.</p>
        </div>
        <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3 xl:w-96">
          <Search size={18} className="text-slate-500" aria-hidden="true" />
          <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder="Tìm trong bảng chi tiết" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500">Tổng bản ghi</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500">Tổng doanh thu liên quan</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{Math.round(totals.revenue / 1000000)}M</p>
        </div>
        <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500">Xu hướng so với kỳ trước</p>
          <p className={`mt-2 text-2xl font-black ${totals.delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{totals.delta >= 0 ? '+' : ''}{totals.delta.toFixed(1)}</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-300">
        <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : (
                      <button type="button" className="inline-flex items-center gap-1" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? (header.column.getIsSorted() ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronsUpDown size={14} aria-hidden="true" />) : null}
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
        <p className="text-sm font-semibold text-slate-500">Trang {table.getState().pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}</p>
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

export default ReportDetail
