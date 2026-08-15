import { useMemo, useState } from 'react'
import { Download, Edit, Eye, KeyRound, Lock, Plus, RefreshCcw, ShieldCheck, Unlock } from 'lucide-react'
import * as XLSX from 'xlsx'

const pageSizeOptions = [10, 20, 50, 100]

function uniqueOptions(rows, key) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].map((value) => ({ value, label: value }))
}

function EmployeesPanel({ rows, keyword, onRefresh }) {
  const [filters, setFilters] = useState({ position: '', department: '', status: '' })
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)

  const options = useMemo(() => ({
    positions: uniqueOptions(rows, 'position'),
    departments: uniqueOptions(rows, 'department'),
    statuses: uniqueOptions(rows, 'status'),
    roles: uniqueOptions(rows, 'roleName'),
  }), [rows])

  const filteredRows = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesSearch = !search || [row.name, row.email, row.phone, row.code].some((value) => String(value || '').toLowerCase().includes(search))
      const matchesPosition = !filters.position || row.position === filters.position
      const matchesDepartment = !filters.department || row.department === filters.department
      const matchesStatus = !filters.status || row.status === filters.status
      return matchesSearch && matchesPosition && matchesDepartment && matchesStatus
    })
  }, [filters, keyword, rows])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)

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
      'SĐT': row.phone,
      'Trạng thái': row.status,
      'Vai trò': row.roleName,
      'Tài khoản': row.username,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhan vien')
    XLSX.writeFile(workbook, 'nhan-vien-he-thong.xlsx')
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Cài đặt hệ thống</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">Nhân viên</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Quản lý quản trị viên, kế toán, sale, giáo vụ, giáo viên, thu ngân và lễ tân sử dụng hệ thống.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700" onClick={() => setModal({ type: 'form' })}>
            <Plus size={16} aria-hidden="true" /> Thêm nhân viên
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={refresh}>
            <RefreshCcw size={16} aria-hidden="true" /> Làm mới
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-700 hover:bg-blue-100" onClick={exportExcel}>
            <Download size={16} aria-hidden="true" /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-200/70 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm shadow-blue-100/60">
        <p className="text-sm font-black text-slate-950">Bộ lọc</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SelectFilter label="Chức vụ" value={filters.position} options={options.positions} onChange={(value) => updateFilter('position', value)} />
          <SelectFilter label="Phòng ban" value={filters.department} options={options.departments} onChange={(value) => updateFilter('department', value)} />
          <SelectFilter label="Trạng thái" value={filters.status} options={options.statuses} onChange={(value) => updateFilter('status', value)} />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[1380px] text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
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
            {pagedRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50/50">
                <td className="px-4 py-4 font-bold text-slate-700">{(safePage - 1) * pageSize + index + 1}</td>
                <td className="px-4 py-4 font-black text-blue-700">{row.code}</td>
                <td className="px-4 py-4 font-black text-slate-950">{row.name}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.position}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.department}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.email}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.phone}</td>
                <td className="px-4 py-4"><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{row.status}</span></td>
                <td className="px-4 py-4 font-semibold text-slate-700">{row.roleName}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <IconButton label="Xem chi tiết" onClick={() => setModal({ type: 'detail', row })}><Eye size={16} /></IconButton>
                    <IconButton label="Chỉnh sửa" onClick={() => setModal({ type: 'form', row })}><Edit size={16} /></IconButton>
                    <IconButton label={row.accountStatus === 'Tạm khóa' ? 'Mở khóa' : 'Khóa'}><>{row.accountStatus === 'Tạm khóa' ? <Unlock size={16} /> : <Lock size={16} />}</></IconButton>
                    <IconButton label="Đặt lại mật khẩu"><KeyRound size={16} /></IconButton>
                    <IconButton label="Gán vai trò" onClick={() => setModal({ type: 'role', row })}><ShieldCheck size={16} /></IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination pageSize={pageSize} setPageSize={setPageSize} safePage={safePage} pageCount={pageCount} setPage={setPage} total={filteredRows.length} shown={pagedRows.length} />

      {modal ? <EmployeeModal modal={modal} roles={options.roles} onClose={() => setModal(null)} /> : null}
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

function IconButton({ label, children, onClick }) {
  return (
    <button type="button" title={label} aria-label={label} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={onClick}>
      {children}
    </button>
  )
}

function Pagination({ pageSize, setPageSize, safePage, pageCount, setPage, total, shown }) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-slate-500">Hiển thị {shown} / {total} nhân viên</p>
      <div className="flex flex-wrap items-center gap-2">
        <select className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm font-bold text-slate-700" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>
          {pageSizeOptions.map((value) => <option key={value} value={value}>{value}/trang</option>)}
        </select>
        <button type="button" className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-700 disabled:opacity-50" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Trước</button>
        <span className="text-sm font-black text-slate-700">Trang {safePage}/{pageCount}</span>
        <button type="button" className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-700 disabled:opacity-50" disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Sau</button>
      </div>
    </div>
  )
}

function EmployeeModal({ modal, roles, onClose }) {
  const row = modal.row || {}
  const isDetail = modal.type === 'detail'
  const isRole = modal.type === 'role'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{isRole ? 'Gán vai trò' : isDetail ? 'Xem chi tiết' : row.id ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">{row.name || 'Nhân viên mới'}</h3>
          </div>
          <button type="button" className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-black text-slate-700" onClick={onClose}>Đóng</button>
        </div>

        {isRole ? (
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <SelectFilter label="Vai trò" value={row.roleName || ''} options={roles} onChange={() => {}} />
          </div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <FormSection title="Thông tin cơ bản">
              <TextInput label="Mã nhân viên" value={row.code || 'Tự sinh'} disabled={isDetail} />
              <TextInput label="Họ và tên" value={row.name || ''} disabled={isDetail} />
              <TextInput label="Giới tính" value={row.gender || ''} disabled={isDetail} />
              <TextInput label="Ngày sinh" value={row.birthDate || ''} disabled={isDetail} />
              <TextInput label="CCCD" value={row.citizenId || ''} disabled={isDetail} />
              <TextInput label="Số điện thoại" value={row.phone || ''} disabled={isDetail} />
              <TextInput label="Email" value={row.email || ''} disabled={isDetail} />
              <TextInput label="Địa chỉ" value={row.address || ''} disabled={isDetail} />
              <TextInput label="Ảnh đại diện" value={row.avatar || ''} disabled={isDetail} />
            </FormSection>
            <FormSection title="Thông tin công việc">
              <TextInput label="Chức vụ" value={row.position || ''} disabled={isDetail} />
              <TextInput label="Phòng ban" value={row.department || ''} disabled={isDetail} />
              <TextInput label="Chi nhánh" value={row.branch || ''} disabled={isDetail} />
              <TextInput label="Ngày vào làm" value={row.startDate || ''} disabled={isDetail} />
              <TextInput label="Quản lý trực tiếp" value={row.manager || ''} disabled={isDetail} />
            </FormSection>
            <FormSection title="Thông tin đăng nhập">
              <TextInput label="Tên đăng nhập" value={row.username || ''} disabled={isDetail} />
              <TextInput label="Mật khẩu" value="" placeholder="Nhập mật khẩu" type="password" disabled={isDetail} />
              <TextInput label="Xác nhận mật khẩu" value="" placeholder="Nhập lại mật khẩu" type="password" disabled={isDetail} />
              <TextInput label="Vai trò" value={row.roleName || ''} disabled={isDetail} />
              <TextInput label="Trạng thái tài khoản" value={row.accountStatus || ''} disabled={isDetail} />
            </FormSection>
          </div>
        )}

        {!isDetail ? (
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-black text-slate-700" onClick={onClose}>Hủy</button>
            <button type="button" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white" onClick={onClose}>Lưu</button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-slate-50 p-4">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  )
}

function TextInput({ label, value, placeholder, type = 'text', disabled }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <input className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none disabled:bg-slate-100" value={value} placeholder={placeholder} type={type} disabled={disabled} readOnly />
    </label>
  )
}

export default EmployeesPanel
