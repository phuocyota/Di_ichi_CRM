import dayjs from 'dayjs'
import { EmptyState, FilterBar, Pagination, StatusBadge } from '../common/ui.jsx'
import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronsUpDown,
  Eye,
  Pencil,
  Search,
  Trash2
} from 'lucide-react'

function StaffTable({
  staffs,
  filters,
  keyword,
  onKeywordChange,
  onSelectStaff,
  onOpenModal
}) {
  const safeFilters = {
    positions: [],
    departments: [],
    specialties: [],
    statuses: [],
    dateRanges: [],
    ...(filters || {})
  }
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState([])
  const [filterValues, setFilterValues] = useState({
    position: '',
    department: '',
    specialty: '',
    statusValue: '',
    dateRange: ''
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
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Chọn tất cả"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Chọn ${row.original.name}`}
          />
        )
      },
      {
        accessorKey: 'avatar',
        header: 'Ảnh đại diện',
        cell: ({ row }) => (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {row.original.avatar}
          </span>
        )
      },
      { accessorKey: 'code', header: 'Mã giáo viên' },
      {
        accessorKey: 'name',
        header: 'Giáo viên',
        cell: ({ row }) => (
          <div className="ui-identity">
            <span className="ui-identity-avatar">{row.original.avatar}</span>
            <div>
              <button
                type="button"
                className="ui-identity-name hover:underline"
                onClick={() => onSelectStaff(row.original)}
              >
                {row.original.name}
              </button>
              <button type="button" className="ui-record-link block" onClick={() => onSelectStaff(row.original)}>{row.original.code}</button>
            </div>
          </div>
        )
      },
      { accessorKey: 'position', header: 'Chức vụ', filterFn: 'equalsString' },
      {
        accessorKey: 'specialty',
        header: 'Chuyên môn',
        filterFn: 'equalsString'
      },
      {
        accessorKey: 'department',
        header: 'Bộ phận',
        filterFn: 'equalsString'
      },
      { accessorKey: 'phone', header: 'Số điện thoại' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'statusValue',
        header: 'Trạng thái',
        filterFn: 'equalsString',
        cell: ({ row }) => {
          return (
            <StatusBadge value={row.original.statusValue} context="staff" />
          )
        }
      },
      {
        accessorKey: 'startDate',
        header: 'Ngày vào làm',
        cell: ({ getValue }) =>
          getValue() ? dayjs(getValue()).format('DD/MM/YYYY') : '—',
        filterFn: (row, id, value) => {
          const date = dayjs(row.getValue(id)),
            today = dayjs()
          if (!value) return true
          if (!date.isValid()) return false
          return value === 'Hôm nay'
            ? date.isSame(today, 'day')
            : value === '7 ngày tới'
              ? date.isAfter(today.startOf('day').subtract(1, 'millisecond')) &&
                date.isBefore(today.add(8, 'day').startOf('day'))
              : date.isSame(today, 'month')
        }
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-blue-700 shadow-sm"
              title="Xem chi tiết"
              aria-label={`Xem ${row.original.name}`}
              onClick={() => onSelectStaff(row.original)}
            >
              <Eye size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100"
              title="Cập nhật giáo viên"
              aria-label={`Sửa ${row.original.name}`}
              onClick={() => onOpenModal('edit', row.original)}
            >
              <Pencil size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
              title="Xóa giáo viên"
              aria-label={`Xóa ${row.original.name}`}
              onClick={() => onOpenModal('delete', row.original)}
            >
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </div>
        )
      }
    ],
    [onOpenModal, onSelectStaff]
  )

  const table = useReactTable({
    data: staffs,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter: keyword,
      columnFilters
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: onKeywordChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
      columnVisibility: { avatar: false, code: false }
    }
  })

  return (
    <section className="ui-card">
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Danh sách giáo viên
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Đã chọn {Object.keys(rowSelection).length} dòng.
            </p>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3 xl:w-96">
            <Search size={18} className="text-slate-500" aria-hidden="true" />
            <input
              className="w-full bg-transparent text-sm font-medium outline-none"
              placeholder="Từ khóa, mã, họ tên, email"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
            />
          </div>
        </div>

        <FilterBar active={!!keyword || Object.values(filterValues).some(Boolean)} onClear={() => { setFilterValues({ position: '', department: '', specialty: '', statusValue: '', dateRange: '' }); setColumnFilters([]); onKeywordChange('') }}>
          {[
            ['position', 'Chức vụ', safeFilters.positions],
            ['department', 'Bộ phận', safeFilters.departments],
            ['specialty', 'Chuyên môn', safeFilters.specialties]
          ].map(([id, label, options]) => (
            <label key={id} className="block">
              <span className="text-xs font-semibold text-slate-500">
                {label}
              </span>
              <select
                className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none"
                value={filterValues[id]}
                onChange={(event) => updateFilter(id, event.target.value)}
              >
                <option value="">Tất cả</option>
                {(options || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">
              Trạng thái
            </span>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none"
              value={filterValues.statusValue}
              onChange={(event) =>
                updateFilter('statusValue', event.target.value)
              }
            >
              <option value="">Tất cả</option>
              {safeFilters.statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">
              Ngày vào làm
            </span>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none"
              value={filterValues.dateRange}
              onChange={(event) => {
                setFilterValues((current) => ({
                  ...current,
                  dateRange: event.target.value
                }))
                setColumnFilters((current) => [
                  ...current.filter((item) => item.id !== 'startDate'),
                  ...(event.target.value
                    ? [{ id: 'startDate', value: event.target.value }]
                    : [])
                ])
              }}
            >
              <option value="">Tất cả</option>
              {safeFilters.dateRanges.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </FilterBar>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-300">
        <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() ? (
                          header.column.getIsSorted() ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} />
                          )
                        ) : null}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!table.getRowModel().rows.length && (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    compact
                    title="Không có giáo viên phù hợp"
                    description="Thử thay đổi từ khóa hoặc bộ lọc."
                  />
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 font-medium text-slate-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={table.getState().pagination.pageIndex + 1}
        pages={table.getPageCount()}
        total={table.getFilteredRowModel().rows.length}
        size={table.getState().pagination.pageSize}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onSizeChange={(size) => table.setPageSize(size)}
        label="giáo viên"
      />
    </section>
  )
}

export default StaffTable
