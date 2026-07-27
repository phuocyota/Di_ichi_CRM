import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Eye, Pencil, Search, Trash2 } from 'lucide-react'

function formatDisplayDate(value) {
  if (!value) return ''
  if (value.includes('/')) return value

  const parts = value.split('-')
  if (parts.length !== 3) return value

  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

function ClassTable({ classes, filters, keyword, onKeywordChange, onSelectClass, onOpenModal }) {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState([])
  const [filterValues, setFilterValues] = useState({ course: '', teacher: '', room: '', branch: '', statusValue: '' })

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
          <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} aria-label={`Chọn ${row.original.name}`} />
        ),
      },
      { accessorKey: 'code', header: 'Mã lớp' },
      { accessorKey: 'name', header: 'Tên lớp' },
      { accessorKey: 'course', header: 'Khóa học' },
      { accessorKey: 'teacher', header: 'Giáo viên' },
      { accessorKey: 'room', header: 'Phòng học' },
      { accessorKey: 'currentSize', header: 'Sĩ số hiện tại' },
      { accessorKey: 'maxSize', header: 'Sĩ số tối đa' },
      { accessorKey: 'schedule', header: 'Lịch học' },
      {
        accessorKey: 'startDate',
        header: 'Ngày khai giảng',
        cell: ({ getValue }) => formatDisplayDate(getValue()),
      },
      {
        accessorKey: 'endDate',
        header: 'Ngày kết thúc',
        cell: ({ getValue }) => formatDisplayDate(getValue()),
      },
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
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700" aria-label={`Xem ${row.original.name}`} onClick={() => onSelectClass(row.original)}>
              <Eye size={17} />
            </button>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700" aria-label={`Sửa ${row.original.name}`} onClick={() => onOpenModal('edit', row.original)}>
              <Pencil size={17} />
            </button>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700" aria-label={`Xóa ${row.original.name}`} onClick={() => onOpenModal('delete', row.original)}>
              <Trash2 size={17} />
            </button>
          </div>
        ),
      },
    ],
    [filters.statuses, onOpenModal, onSelectClass],
  )

  const table = useReactTable({
    data: classes,
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
    initialState: { pagination: { pageSize: 5 } },
  })

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">Danh sách lớp</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Đã chọn {Object.keys(rowSelection).length} dòng.</p>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3 xl:w-96">
            <Search size={18} className="text-slate-500" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder="Từ khóa, tên lớp, giáo viên" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['course', 'Khóa học', filters.courses],
            ['teacher', 'Giáo viên', filters.teachers],
            ['room', 'Phòng học', filters.rooms],
            ['branch', 'Cơ sở', filters.branches],
          ].map(([id, label, options]) => (
            <label key={id} className="block">
              <span className="text-xs font-bold text-slate-500">{label}</span>
              <select className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none" value={filterValues[id]} onChange={(event) => updateFilter(id, event.target.value)}>
                <option value="">Tất cả</option>
                {options.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          ))}
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
        <table className="min-w-[1280px] w-full border-collapse text-left text-sm">
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
            <ChevronLeft size={16} /> Trước
          </button>
          <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Sau <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default ClassTable
