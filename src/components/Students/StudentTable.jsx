/** @typedef {{id:string,name:string,code:string,avatar?:string,phone?:string,parentPhone?:string,parent?:string,course?:string,className?:string,teacher?:string,branch?:string,status?:string,statusValue?:string,hasAccount?:boolean,enrollments?:Array<{status:string}>}} StudentRow */
import React, { useEffect, useMemo, useState } from 'react'
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
  Columns3,
  Eye,
  FileDown,
  FileSpreadsheet,
  Pencil,
  Trash2,
  UserPlus
} from 'lucide-react'
import StudentActionsMenu from './StudentActionsMenu.jsx'
import {
  EmptyState,
  FilterBar,
  Pagination,
  SearchInput,
  StatusBadge
} from '../common/ui.jsx'

const defaults = {
  branch: false,
  code: false,
  avatar: false,
  gender: false,
  birthDate: false,
  parent: false,
  course: false,
  teacher: false,
  enrollmentDate: false
}
const widths = {
  select: 'w-12',
  name: 'min-w-[240px]',
  code: 'min-w-[170px]',
  phone: 'min-w-[135px]',
  parent: 'min-w-[160px]',
  className: 'min-w-[160px]',
  course: 'min-w-[140px]',
  teacher: 'min-w-[150px]',
  statusValue: 'min-w-[130px]',
  actions: 'w-px whitespace-nowrap',
  gender: 'min-w-[90px]',
  birthDate: 'min-w-[120px]',
  enrollmentDate: 'min-w-[130px]'
}
const date = (value) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—'
export default function StudentTable({
  students,
  filters,
  keyword,
  onKeywordChange,
  onSelectStudent,
  onOpenModal,
  canManage,
  onExportRowsChange,
  onExport,
  exportBusy
}) {
  const [sorting, setSorting] = useState([]),
    [rowSelection, setRowSelection] = useState({}),
    [columnFilters, setColumnFilters] = useState([])
  const [visibility, setVisibility] = useState(() => {
    try {
      return {
        ...defaults,
        ...JSON.parse(localStorage.getItem('diichi-student-columns-v2') || '{}')
      }
    } catch {
      return defaults
    }
  })
  const [filterValues, setFilterValues] = useState({
    course: '',
    className: '',
    teacher: '',
    branch: '',
    statusValue: ''
  })
  useEffect(() => {
    try {
      localStorage.setItem(
        'diichi-student-columns-v2',
        JSON.stringify(visibility)
      )
    } catch {}
  }, [visibility])
  const updateFilter = (id, value) => {
    setFilterValues((current) => ({ ...current, [id]: value }))
    setColumnFilters((current) => {
      const next = current.filter((item) => item.id !== id)
      return value ? [...next, { id, value }] : next
    })
  }
  const columns = useMemo(
    /** @returns {import('@tanstack/react-table').ColumnDef<StudentRow, any>[]} */ () => [
      {
        id: 'select',
        enableHiding: false,
        enableSorting: false,
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
      { accessorKey: 'code', header: 'Mã học viên' },
      {
        accessorKey: 'avatar',
        header: 'Ảnh đại diện',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="ui-identity-avatar">{row.original.avatar}</span>
        )
      },
      {
        accessorKey: 'name',
        header: 'Học viên',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="ui-identity">
            <span className="ui-identity-avatar">{row.original.avatar}</span>
            <div>
              <button
                type="button"
                className="ui-identity-name text-left hover:underline"
                onClick={() => onSelectStudent(row.original)}
              >
                {row.original.name}
              </button>
              <button type="button" className="ui-record-link block" onClick={() => onSelectStudent(row.original)}>{row.original.code}</button>
            </div>
          </div>
        )
      },
      { accessorKey: 'gender', header: 'Giới tính' },
      {
        accessorKey: 'birthDate',
        header: 'Ngày sinh',
        cell: ({ getValue }) => date(getValue())
      },
      {
        accessorKey: 'phone',
        header: 'Liên hệ',
        cell: ({ row }) => (
          <div>
            <span>{row.original.phone || '—'}</span>
            {row.original.parentPhone && (
              <span className="ui-identity-code">
                PH: {row.original.parentPhone}
              </span>
            )}
          </div>
        )
      },
      { accessorKey: 'parent', header: 'Phụ huynh' },
      { accessorKey: 'course', header: 'Khóa học' },
      {
        accessorKey: 'className',
        header: 'Lớp / khóa học',
        cell: ({ row }) => (
          <div>
            <span>{row.original.className || '—'}</span>
            {row.original.course && row.original.course !== '—' && (
              <span className="ui-identity-code">{row.original.course}</span>
            )}
          </div>
        )
      },
      { accessorKey: 'teacher', header: 'Giáo viên' },
      { accessorKey: 'branch', header: 'Cơ sở' },
      {
        accessorKey: 'statusValue',
        header: 'Trạng thái',
        filterFn: 'equalsString',
        cell: ({ row }) => (
          <StatusBadge value={row.original.statusValue} context="student" />
        )
      },
      {
        accessorKey: 'enrollmentDate',
        header: 'Ngày nhập học',
        cell: ({ getValue }) => date(getValue())
      },
      {
        id: 'actions',
        header: 'Thao tác',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            {canManage && row.original.hasAccount === false && (
              <button
                type="button"
                className="ui-button ui-icon-button"
                title="Tạo tài khoản đăng nhập"
                aria-label={`Tạo tài khoản cho ${row.original.name}`}
                onClick={() => onOpenModal('create-account', row.original)}
              >
                <UserPlus size={16} />
              </button>
            )}
            <button
              type="button"
              className="ui-button ui-icon-button"
              title="Xem hồ sơ"
              aria-label={`Xem ${row.original.name}`}
              onClick={() => onSelectStudent(row.original)}
            >
              <Eye size={16} />
            </button>
            {canManage && (
              <StudentActionsMenu
                student={row.original}
                onSelect={onOpenModal}
                extraItems={[
                  {
                    key: 'edit',
                    label: 'Cập nhật hồ sơ',
                    icon: Pencil,
                    onClick: () => onOpenModal('edit', row.original)
                  },
                  {
                    key: 'delete',
                    label: 'Xóa học viên',
                    icon: Trash2,
                    danger: true,
                    onClick: () => onOpenModal('delete', row.original)
                  }
                ]}
              />
            )}
          </div>
        )
      }
    ],
    [onOpenModal, onSelectStudent, canManage]
  )
  const table = useReactTable({
    data: students,
    columns,
    getRowId: (row) => row.id,
    defaultColumn: { cell: ({ getValue }) => getValue() ?? '—' },
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility: visibility,
      globalFilter: keyword
    },
    onColumnVisibilityChange: setVisibility,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: onKeywordChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
      columnVisibility: { branch: false }
    }
  })
  const selected = table.getSelectedRowModel().rows,
    visible = table.getPrePaginationRowModel().rows
  useEffect(() => {
    const chosen = table.getSelectedRowModel().rows
    const all = table.getPrePaginationRowModel().rows
    onExportRowsChange?.(
      (chosen.length ? chosen : all).map((row) => row.original)
    )
  }, [
    students,
    sorting,
    columnFilters,
    keyword,
    rowSelection,
    onExportRowsChange,
    table
  ])
  const clear = () => {
    setFilterValues({
      course: '',
      className: '',
      teacher: '',
      branch: '',
      statusValue: ''
    })
    setColumnFilters([])
    onKeywordChange('')
    table.setPageIndex(0)
  }
  return (
    <section className="ui-card space-y-4">
      <header className="ui-section-heading">
        <div>
          <h2 className="ui-section-title">Danh sách học viên</h2>
          <p className="ui-caption">
            {visible.length} hồ sơ phù hợp · Chọn học viên để xem chi tiết.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <SearchInput
            value={keyword}
            onChange={onKeywordChange}
            placeholder="Lọc theo mã, tên, số điện thoại"
          />
          <details className="ui-columns">
            <summary className="ui-button">
              <Columns3 size={16} />
              Cột hiển thị
            </summary>
            <div className="ui-columns-panel">
              {table
                .getAllLeafColumns()
                .filter((c) => c.getCanHide())
                .map((column) => (
                  <label key={column.id}>
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                    />
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </label>
                ))}
              <button
                type="button"
                className="ui-button ui-button-small"
                onClick={() => setVisibility({ ...defaults, branch: false })}
              >
                Khôi phục mặc định
              </button>
            </div>
          </details>
        </div>
      </header>
      <FilterBar
        active={!!keyword || Object.values(filterValues).some(Boolean)}
        onClear={clear}
      >
        {[
          ['course', 'Khóa học', filters.courses],
          ['className', 'Lớp học', filters.classes],
          ['teacher', 'Giáo viên', filters.teachers],
          ['branch', 'Cơ sở', filters.branches]
        ].map(([id, label, options]) => (
          <label key={id}>
            {label}
            <select
              className="ui-input mt-2"
              value={filterValues[id]}
              onChange={(e) => updateFilter(id, e.target.value)}
            >
              <option value="">Tất cả</option>
              {options.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Trạng thái
          <select
            className="ui-input mt-2"
            value={filterValues.statusValue}
            onChange={(e) => updateFilter('statusValue', e.target.value)}
          >
            <option value="">Tất cả</option>
            {filters.statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </FilterBar>
      {selected.length > 0 && (
        <div className="ui-bulk-bar">
          <span className="font-semibold">
            Đã chọn {selected.length} học viên
          </span>
          {onExport && (
            <>
              <button
                type="button"
                className="ui-button ui-button-small"
                disabled={exportBusy}
                onClick={() => onExport('excel')}
              >
                <FileSpreadsheet size={14} />
                Xuất Excel
              </button>
              <button
                type="button"
                className="ui-button ui-button-small"
                disabled={exportBusy}
                onClick={() => onExport('pdf')}
              >
                <FileDown size={14} />
                Xuất PDF
              </button>
            </>
          )}
          <button
            type="button"
            className="ui-button ui-button-small ui-button-quiet"
            onClick={() => table.resetRowSelection()}
          >
            Bỏ chọn
          </button>
        </div>
      )}
      <div
        className="ui-table-wrap"
        role="region"
        aria-label="Danh sách học viên"
        tabIndex={0}
      >
        <table className="min-w-[980px] w-full text-left">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={widths[header.column.id] || ''}
                    aria-sort={
                      header.column.getIsSorted() === false
                        ? undefined
                        : header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : 'descending'
                    }
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (
                          <ChevronDown
                            size={12}
                            className={
                              header.column.getIsSorted() === 'asc'
                                ? 'rotate-180'
                                : ''
                            }
                          />
                        ) : (
                          <ChevronsUpDown
                            size={12}
                            className="text-slate-300"
                          />
                        )}
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
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className={row.getIsSelected() ? 'bg-red-50/40' : ''}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={widths[cell.column.id] || 'whitespace-nowrap'}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {!table.getRowModel().rows.length && (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length}>
                  <EmptyState
                    compact
                    title="Không có học viên phù hợp"
                    description="Thử thay đổi từ khóa hoặc xóa bộ lọc để xem danh sách."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={table.getState().pagination.pageIndex + 1}
        pages={table.getPageCount()}
        total={visible.length}
        size={table.getState().pagination.pageSize}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onSizeChange={(size) => table.setPageSize(size)}
        label="học viên"
      />
    </section>
  )
}
