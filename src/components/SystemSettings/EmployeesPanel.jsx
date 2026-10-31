import {
  ActionDropdown,
  Pagination as SharedPagination,
  StatusBadge
} from '../common/ui.jsx'
import React, { useMemo, useState } from 'react'
import EmployeeModal from './EmployeeModal.jsx'
import {
  Download,
  Edit,
  Eye,
  KeyRound,
  Lock,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Unlock
} from 'lucide-react'
import * as XLSX from 'xlsx'

function uniqueOptions(rows, key) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].map(
    (value) => ({ value, label: value })
  )
}

function EmployeesPanel({
  rows,
  roles,
  directories,
  currentUserId,
  keyword,
  onRefresh,
  onSave,
  onRoles,
  onLock,
  onReset,
  busy
}) {
  const [filters, setFilters] = useState({
    position: '',
    department: '',
    status: ''
  })
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)

  const options = useMemo(
    () => ({
      positions: uniqueOptions(rows, 'position'),
      departments: uniqueOptions(rows, 'department'),
      statuses: uniqueOptions(rows, 'status'),
      roles: uniqueOptions(rows, 'roleName')
    }),
    [rows]
  )

  const filteredRows = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesSearch =
        !search ||
        [row.name, row.email, row.phone, row.code].some((value) =>
          String(value || '')
            .toLowerCase()
            .includes(search)
        )
      const matchesPosition =
        !filters.position || row.position === filters.position
      const matchesDepartment =
        !filters.department || row.department === filters.department
      const matchesStatus = !filters.status || row.status === filters.status
      return (
        matchesSearch && matchesPosition && matchesDepartment && matchesStatus
      )
    })
  }, [filters, keyword, rows])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pagedRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  )

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const refresh = () => {
    setFilters({ position: '', department: '', status: '' })
    setPage(1)
    onRefresh()
  }

  const exportExcel = () => {
    const exportRows = filteredRows.map((row, index) => ({
      STT: index + 1,
      'Mã NV': row.code,
      'Họ tên': row.name,
      'Giới tính': row.gender,
      'Ngày sinh': row.birthDate,
      CCCD: row.citizenId,
      'Chức vụ': row.position,
      'Phòng ban': row.department,
      'Chi nhánh': row.branch,
      Email: row.email,
      SĐT: row.phone,
      'Trạng thái': row.status,
      'Vai trò': row.roleName,
      'Tài khoản': row.username
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhan vien')
    XLSX.writeFile(workbook, 'nhan-vien-he-thong.xlsx')
  }

  return (
    <section className="ui-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Cài đặt hệ thống
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Nhân viên
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Quản lý quản trị viên, kế toán, sale, giáo vụ, giáo viên, thu ngân
            và lễ tân sử dụng hệ thống.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="ui-button ui-button-primary"
            onClick={() => setModal({ type: 'form' })}
          >
            <Plus size={16} aria-hidden="true" /> Thêm nhân viên
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={refresh}
          >
            <RefreshCcw size={16} aria-hidden="true" /> Làm mới
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            onClick={exportExcel}
          >
            <Download size={16} aria-hidden="true" /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-blue-200/70 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm shadow-blue-100/60">
        <p className="text-sm font-semibold text-slate-950">Bộ lọc</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SelectFilter
            label="Chức vụ"
            value={filters.position}
            options={options.positions}
            onChange={(value) => updateFilter('position', value)}
          />
          <SelectFilter
            label="Phòng ban"
            value={filters.department}
            options={options.departments}
            onChange={(value) => updateFilter('department', value)}
          />
          <SelectFilter
            label="Trạng thái"
            value={filters.status}
            options={options.statuses}
            onChange={(value) => updateFilter('status', value)}
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[1380px] text-left text-sm">
          <thead className="bg-blue-600 text-xs font-semibold uppercase text-white">
            <tr>
              <th className="px-4 py-4">STT</th>
              <th className="px-4 py-4">Mã NV</th>
              <th className="px-4 py-4">Họ tên</th>
              <th className="px-4 py-4">Chức vụ</th>
              <th className="px-4 py-4">Phòng ban</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">SĐT</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-4 py-4">Vai trò</th>
              <th className="px-4 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {!pagedRows.length && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Chưa có nhân viên phù hợp.
                </td>
              </tr>
            )}
            {pagedRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50/50">
                <td className="px-4 py-4 font-semibold text-slate-700">
                  {(safePage - 1) * pageSize + index + 1}
                </td>
                <td className="px-4 py-4 font-semibold text-blue-700">
                  {row.code}
                </td>
                <td className="px-4 py-4 font-semibold text-slate-950">
                  {row.name}
                </td>
                <td className="px-4 py-4 font-semibold text-slate-700">
                  {row.position}
                </td>
                <td className="px-4 py-4 font-semibold text-slate-700">
                  {row.department}
                </td>
                <td className="px-4 py-4 font-semibold text-slate-700">
                  {row.email}
                </td>
                <td className="px-4 py-4 font-semibold text-slate-700">
                  {row.phone}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge value={row.statusValue} context="staff" />
                </td>
                <td className="px-4 py-4 font-semibold text-slate-700">
                  {row.roleName}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <IconButton
                      label="Xem chi tiết"
                      onClick={() => setModal({ type: 'detail', row })}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <ActionDropdown
                      compact
                      label={`Thao tác nhân viên ${row.name}`}
                      items={[
                        {
                          label: 'Chỉnh sửa',
                          icon: Edit,
                          disabled: busy,
                          onClick: () => setModal({ type: 'form', row })
                        },
                        {
                          label: row.lockedAt ? 'Mở khóa' : 'Khóa tài khoản',
                          icon: row.lockedAt ? Unlock : Lock,
                          danger: !row.lockedAt,
                          disabled:
                            busy ||
                            !row.accountId ||
                            row.accountId === currentUserId,
                          onClick: () => setModal({ type: 'lock', row })
                        },
                        {
                          label: 'Đặt lại mật khẩu',
                          icon: KeyRound,
                          disabled: busy || !row.accountId,
                          onClick: () => setModal({ type: 'password', row })
                        },
                        {
                          label: 'Gán vai trò',
                          icon: ShieldCheck,
                          disabled: busy || !row.accountId,
                          onClick: () => setModal({ type: 'role', row })
                        }
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        pageSize={pageSize}
        setPageSize={setPageSize}
        safePage={safePage}
        pageCount={pageCount}
        setPage={setPage}
        total={filteredRows.length}
        shown={pagedRows.length}
      />

      {modal ? (
        <EmployeeModal
          key={`${modal.type}-${modal.row?.id || 'new'}`}
          modal={modal}
          roles={roles}
          directories={directories}
          currentUserId={currentUserId}
          onSave={onSave}
          onRoles={onRoles}
          onLock={onLock}
          onReset={onReset}
          onClose={() => setModal(null)}
        />
      ) : null}
    </section>
  )
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </span>
      <select
        className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Tất cả</option>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function IconButton({ label, children, onClick, disabled }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      className="ui-button ui-icon-button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Pagination({
  pageSize,
  setPageSize,
  safePage,
  pageCount,
  setPage,
  total
}) {
  return (
    <SharedPagination
      page={safePage}
      pages={pageCount}
      total={total}
      size={pageSize}
      onPageChange={setPage}
      onSizeChange={(size) => {
        setPageSize(size)
        setPage(1)
      }}
      label="nhân viên"
    />
  )
}

export default EmployeesPanel
