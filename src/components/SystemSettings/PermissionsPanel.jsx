import { useMemo, useState } from 'react'
import { Copy, Download, Edit, Plus, RefreshCcw, Trash2, UserPlus } from 'lucide-react'
import * as XLSX from 'xlsx'

const pageSizeOptions = [10, 20, 50, 100]

function PermissionsPanel({ rows, modules, matrix, actions, actionLabels, auditLogs, keyword, onRefresh }) {
  const [status, setStatus] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState(rows[0]?.id || '')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [showRoleForm, setShowRoleForm] = useState(false)

  const filteredRows = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesSearch = !search || [row.name, row.code, row.description, row.staffNames].some((value) => String(value || '').toLowerCase().includes(search))
      const matchesStatus = !status || row.status === status
      return matchesSearch && matchesStatus
    })
  }, [keyword, rows, status])

  const selectedRole = rows.find((row) => row.id === selectedRoleId) || rows[0]
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRows.map((row, index) => ({
      STT: index + 1,
      'Vai trò': row.name,
      'Mã vai trò': row.code,
      'Mô tả': row.description,
      'Số người': row.staffCount,
      'Nhân viên': row.staffNames,
      'Trạng thái': row.status,
      'Quyền truy cập': row.permissionLabels,
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Phan quyen')
    XLSX.writeFile(workbook, 'phan-quyen-he-thong.xlsx')
  }

  const refresh = () => {
    setStatus('')
    setPage(1)
    onRefresh()
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Cài đặt hệ thống</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Phân quyền</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Quản lý quyền truy cập của từng nhóm người dùng vào các chức năng trong hệ thống.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700" onClick={() => setShowRoleForm(true)}><Plus size={16} /> Thêm vai trò</button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={refresh}><RefreshCcw size={16} /> Làm mới</button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-700 hover:bg-blue-100" onClick={exportExcel}><Download size={16} /> Xuất Excel</button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-blue-200/70 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm shadow-blue-100/60">
          <p className="text-sm font-black text-slate-950">Bộ lọc</p>
          <label className="mt-4 block max-w-xs">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Trạng thái</span>
            <select className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {[...new Set(rows.map((row) => row.status))].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-blue-100">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-blue-600 text-xs font-black uppercase text-white">
              <tr>
                <th className="px-4 py-4">STT</th>
                <th className="px-4 py-4">Vai trò</th>
                <th className="px-4 py-4">Mô tả</th>
                <th className="px-4 py-4">Số người</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pagedRows.map((row, index) => (
                <tr key={row.id} className={selectedRole?.id === row.id ? 'bg-blue-50/70' : 'hover:bg-blue-50/50'}>
                  <td className="px-4 py-4 font-bold text-slate-700">{(safePage - 1) * pageSize + index + 1}</td>
                  <td className="px-4 py-4">
                    <button type="button" className="text-left font-black text-blue-700" onClick={() => setSelectedRoleId(row.id)}>{row.name}</button>
                    <p className="mt-1 text-xs font-bold text-slate-500">{row.code}</p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{row.description}</td>
                  <td className="px-4 py-4 font-black text-slate-950">{row.staffCount}</td>
                  <td className="px-4 py-4"><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{row.status}</span></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <IconButton label="Chỉnh sửa"><Edit size={16} /></IconButton>
                      <IconButton label="Xóa vai trò"><Trash2 size={16} /></IconButton>
                      <IconButton label="Sao chép vai trò"><Copy size={16} /></IconButton>
                      <IconButton label="Gán nhân viên"><UserPlus size={16} /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination pageSize={pageSize} setPageSize={setPageSize} safePage={safePage} pageCount={pageCount} setPage={setPage} total={filteredRows.length} shown={pagedRows.length} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PermissionTree role={selectedRole} modules={modules} matrix={matrix} actions={actions} actionLabels={actionLabels} showRoleForm={showRoleForm} setShowRoleForm={setShowRoleForm} rows={rows} />
        <AuditLog logs={auditLogs} />
      </div>
    </section>
  )
}

function PermissionTree({ role, modules, matrix, actions, actionLabels, showRoleForm, setShowRoleForm, rows }) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-950">Thiết lập quyền: {role?.name}</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Tree view quyền theo từng module, có chọn tất cả, bỏ chọn tất cả và kế thừa quyền.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-black text-slate-700">Chọn tất cả</button>
          <button type="button" className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-black text-slate-700">Bỏ chọn tất cả</button>
        </div>
      </div>

      {showRoleForm ? (
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput label="Tên vai trò" value="" placeholder="VD: Thu ngân" />
            <TextInput label="Mã vai trò" value="" placeholder="VD: CASHIER" />
            <TextInput label="Mô tả" value="" placeholder="Mô tả phạm vi quyền" />
            <TextInput label="Trạng thái" value="Đang hoạt động" />
            <label className="block md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Kế thừa quyền từ vai trò khác</span>
              <select className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700">
                <option value="">Không kế thừa</option>
                {rows.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-black text-slate-700" onClick={() => setShowRoleForm(false)}>Hủy</button>
            <button type="button" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white" onClick={() => setShowRoleForm(false)}>Lưu vai trò</button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="px-4 py-4">Chức năng</th>
              {actions.map((action) => <th key={action} className="px-4 py-4 text-center">{actionLabels[action]}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {matrix.map((item) => {
              const module = modules.find((moduleItem) => moduleItem.key === item.moduleKey)
              return (
                <tr key={item.moduleKey}>
                  <td className="px-4 py-4 font-black text-slate-950">{module?.label || item.moduleKey}</td>
                  {actions.map((action) => (
                    <td key={action} className="px-4 py-4 text-center">
                      <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={item.permissions.includes(action)} readOnly />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AuditLog({ logs }) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">Audit Log</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">Ghi nhật ký thay đổi quyền để theo dõi người thay đổi và thời điểm.</p>
      <div className="mt-5 space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <p className="font-black text-slate-950">{log.action}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">{log.actor} · {log.changedAt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function IconButton({ label, children }) {
  return (
    <button type="button" title={label} aria-label={label} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
      {children}
    </button>
  )
}

function TextInput({ label, value, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <input className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none" value={value} placeholder={placeholder} readOnly />
    </label>
  )
}

function Pagination({ pageSize, setPageSize, safePage, pageCount, setPage, total, shown }) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-slate-500">Hiển thị {shown} / {total} vai trò</p>
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

export default PermissionsPanel
