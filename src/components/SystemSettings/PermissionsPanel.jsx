import { ConfirmDialog } from '../common/ui.jsx'
import React, { useEffect, useState } from 'react'
import {
  Copy,
  Download,
  Edit,
  Plus,
  RefreshCcw,
  Trash2,
  UserPlus
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { actionLabels } from '../../services/systemSettingsApi.js'

const button = 'ui-button'
const primaryButton = 'ui-button ui-button-primary'
const input =
  'mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500'
export default function PermissionsPanel({
  rows,
  permissions,
  modules,
  employees,
  auditLogs,
  keyword,
  busy,
  onRefresh,
  onSave,
  onPermissions,
  onDelete,
  onAssign
}) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedId, setSelectedId] = useState(rows[0]?.id || '')
  const [kind, setKind] = useState(''),
    [page, setPage] = useState(1),
    [size, setSize] = useState(10),
    [modal, setModal] = useState(null),
    [error] = useState('')
  const selected = rows.find((r) => r.id === selectedId) || rows[0]
  const filtered = rows.filter(
    (r) =>
      (!kind || (kind === 'system' ? r.protected : !r.protected)) &&
      (!keyword.trim() ||
        `${r.code} ${r.name} ${r.staffNames}`
          .toLowerCase()
          .includes(keyword.trim().toLowerCase()))
  )
  const pages = Math.max(1, Math.ceil(filtered.length / size)),
    safePage = Math.min(page, pages)
  function exportExcel() {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        filtered.map((r) => ({
          'Vai trò': r.name,
          Mã: r.code,
          'Số tài khoản': r.staffCount,
          'Tài khoản': r.staffNames,
          'Số quyền': r.permissionIds.length,
          Quyền: permissions
            .filter((p) => r.permissionIds.includes(p.id))
            .map((p) => p.code)
            .join(', ')
        }))
      ),
      'Phan quyen'
    )
    XLSX.writeFile(workbook, 'phan-quyen-he-thong.xlsx')
  }
  function remove(row) {
    setDeleteTarget(row)
  }
  return (
    <section className="space-y-5">
      <div className="ui-card">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">
              Cài đặt hệ thống
            </p>
            <h2 className="mt-2 text-xl font-semibold">Phân quyền</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={primaryButton}
              disabled={busy}
              onClick={() => setModal({ type: 'role' })}
            >
              <Plus className="mr-1 inline" size={16} />
              Thêm vai trò
            </button>
            <button className={button} onClick={onRefresh}>
              <RefreshCcw className="mr-1 inline" size={16} />
              Làm mới
            </button>
            <button className={button} onClick={exportExcel}>
              <Download className="mr-1 inline" size={16} />
              Xuất Excel
            </button>
          </div>
        </header>
        <label className="mt-6 block max-w-xs text-sm font-semibold">
          Loại vai trò
          <select
            className={input}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Tất cả</option>
            <option value="system">Vai trò hệ thống</option>
            <option value="custom">Vai trò tùy chỉnh</option>
          </select>
        </label>
        <div className="mt-6 overflow-x-auto rounded-xl border border-blue-100">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-blue-600 text-xs uppercase text-white">
              <tr>
                {[
                  'Vai trò',
                  'Quyền truy cập',
                  'Số tài khoản',
                  'Loại',
                  'Thao tác'
                ].map((label) => (
                  <th key={label} className="px-4 py-4">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered
                .slice((safePage - 1) * size, safePage * size)
                .map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.id === selected?.id
                        ? 'bg-blue-50'
                        : 'hover:bg-blue-50/50'
                    }
                  >
                    <td className="px-4 py-4">
                      <button
                        className="font-semibold text-blue-700"
                        onClick={() => setSelectedId(row.id)}
                      >
                        {row.name}
                      </button>
                      <p className="text-xs text-slate-500">{row.code}</p>
                    </td>
                    <td className="px-4 py-4">
                      {row.permissionIds.length} quyền
                    </td>
                    <td className="px-4 py-4" title={row.staffNames}>
                      {row.staffCount}
                    </td>
                    <td className="px-4 py-4">
                      {row.protected ? 'Hệ thống' : 'Tùy chỉnh'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <Icon
                          label="Chỉnh sửa"
                          disabled={busy || row.protected}
                          onClick={() => setModal({ type: 'role', row })}
                        >
                          <Edit size={16} />
                        </Icon>
                        <Icon
                          label="Xóa vai trò"
                          disabled={busy || row.protected || row.staffCount > 0}
                          onClick={() => remove(row)}
                        >
                          <Trash2 size={16} />
                        </Icon>
                        <Icon
                          label="Sao chép vai trò"
                          disabled={busy}
                          onClick={() =>
                            setModal({ type: 'role', source: row })
                          }
                        >
                          <Copy size={16} />
                        </Icon>
                        <Icon
                          label="Gán nhân viên"
                          disabled={busy || row.code === 'student'}
                          onClick={() => setModal({ type: 'assign', row })}
                        >
                          <UserPlus size={16} />
                        </Icon>
                      </div>
                    </td>
                  </tr>
                ))}
              {!filtered.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Chưa có vai trò phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            {filtered.length} vai trò · Trang {safePage}/{pages}
          </span>
          <div className="flex gap-2">
            <select
              className={button}
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value))
                setPage(1)
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}/trang
                </option>
              ))}
            </select>
            <button
              className={button}
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              Trước
            </button>
            <button
              className={button}
              disabled={safePage >= pages}
              onClick={() => setPage(safePage + 1)}
            >
              Sau
            </button>
          </div>
        </footer>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {selected ? (
          <PermissionEditor
            key={selected.id}
            role={selected}
            permissions={permissions}
            modules={modules}
            busy={busy}
            onSave={onPermissions}
          />
        ) : (
          <p className="rounded-xl bg-white p-6 text-slate-500">
            Thêm vai trò để thiết lập quyền.
          </p>
        )}
        <aside className="rounded-xl border border-gray-300 bg-white p-6">
          <h3 className="text-lg font-semibold">Lịch sử thay đổi</h3>
          <div className="mt-4 max-h-[650px] space-y-3 overflow-auto">
            {auditLogs.map((log) => (
              <article key={log.id} className="rounded-lg border p-3 text-sm">
                <p className="font-semibold">{log.actionLabel}</p>
                <p>{log.actor}</p>
                <p className="text-xs text-slate-500">{log.changedAt}</p>
              </article>
            ))}
            {!auditLogs.length && (
              <p className="text-sm text-slate-500">
                Chưa có lịch sử thay đổi.
              </p>
            )}
          </div>
        </aside>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa vai trò"
        description={`Xóa vai trò ${deleteTarget?.name || ''}? Vai trò chỉ được xóa khi chưa gán cho tài khoản.`}
        confirmLabel="Xóa vai trò"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await onDelete(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
      {modal && (
        <RoleModal
          key={`${modal.type}-${modal.row?.id || modal.source?.id || 'new'}`}
          modal={modal}
          employees={employees}
          onClose={() => setModal(null)}
          onSave={async (id, payload) => {
            const result = await onSave(id, payload)
            setSelectedId(result.id)
            return result
          }}
          onAssign={onAssign}
        />
      )}
    </section>
  )
}
function Icon({ label, children, disabled, onClick }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
function PermissionEditor({ role, permissions, modules, busy, onSave }) {
  const [confirming, setConfirming] = useState(false)
  const [ids, setIds] = useState(role.permissionIds),
    [error, setError] = useState('')
  useEffect(() => {
    setIds(role.permissionIds)
  }, [role.permissionIds])
  const parsed = permissions.map((p) => {
    const index = p.code.lastIndexOf('.')
    return {
      ...p,
      module: index < 0 ? 'other' : p.code.slice(0, index),
      action: index < 0 ? p.code : p.code.slice(index + 1)
    }
  })
  const moduleKeys = [...new Set(parsed.map((p) => p.module))]
  const actions = [...new Set(parsed.map((p) => p.action))].sort(
    (a, b) =>
      (['read', 'create', 'update', 'delete'].indexOf(a) + 1 || 99) -
      (['read', 'create', 'update', 'delete'].indexOf(b) + 1 || 99)
  )
  const disabled = busy || role.protected
  function save() {
    setConfirming(true)
  }
  async function persist() {
    setError('')
    try {
      await onSave(role.id, ids)
      setConfirming(false)
    } catch (cause) {
      setError(cause.message)
      throw cause
    }
  }
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-6">
      <h3 className="text-lg font-semibold">Thiết lập quyền: {role.name}</h3>
      <p className="mt-1 text-sm text-slate-500">
        Quyền truy cập được lấy từ danh sách quyền của hệ thống.
      </p>
      {role.protected && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Vai trò hệ thống được bảo vệ. Tạo hoặc sao chép vai trò tùy chỉnh để
          thiết lập quyền riêng.
        </p>
      )}
      <div className="my-4 flex flex-wrap gap-2">
        <button
          className={button}
          disabled={disabled}
          onClick={() => setIds(permissions.map((p) => p.id))}
        >
          Chọn tất cả
        </button>
        <button
          className={button}
          disabled={disabled}
          onClick={() => setIds([])}
        >
          Bỏ chọn tất cả
        </button>
        <button className={primaryButton} disabled={disabled} onClick={save}>
          Lưu quyền
        </button>
      </div>
      <div className="max-h-[650px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="p-3">Chức năng</th>
              {actions.map((a) => (
                <th key={a} className="p-3 text-center">
                  {actionLabels[a] || a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {moduleKeys.map((key) => (
              <tr key={key} className="border-t">
                <td className="p-3 font-semibold">
                  {modules.find((m) => m.key === key)?.label ||
                    (key === 'other' ? 'Quyền khác' : key)}
                </td>
                {actions.map((action) => {
                  const permission = parsed.find(
                    (p) => p.module === key && p.action === action
                  )
                  return (
                    <td className="p-3 text-center" key={action}>
                      {permission ? (
                        <input
                          type="checkbox"
                          aria-label={`${role.name}: ${permission.code}`}
                          disabled={disabled}
                          checked={ids.includes(permission.id)}
                          onChange={(e) =>
                            setIds(
                              e.target.checked
                                ? [...ids, permission.id]
                                : ids.filter((id) => id !== permission.id)
                            )
                          }
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!permissions.length && (
          <p className="py-5 text-slate-500">Chưa có quyền được khai báo.</p>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirming}
        title="Lưu thay đổi phân quyền"
        description={`Cập nhật quyền truy cập của vai trò ${role.name}? Thay đổi sẽ áp dụng cho các tài khoản được gán vai trò này.`}
        confirmLabel="Lưu quyền"
        onClose={() => setConfirming(false)}
        onConfirm={persist}
        busy={busy}
      />
    </div>
  )
}
function RoleModal({ modal, employees, onClose, onSave, onAssign }) {
  const [confirmAssign, setConfirmAssign] = useState(false)
  const source = modal.row || modal.source
  const [code, setCode] = useState(modal.row?.code || ''),
    [name, setName] = useState(
      modal.row?.name || (source ? `${source.name} (bản sao)` : '')
    )
  const [employeeId, setEmployeeId] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const assigning = modal.type === 'assign'
  const eligible = employees.filter(
    (e) =>
      e.accountId &&
      !e.roleIds.includes(source?.id) &&
      (source?.code !== 'super_admin' || e.typeValue === 'ADMIN')
  )
  async function submit(event, approved = false) {
    event?.preventDefault()
    if (assigning && !approved) {
      setConfirmAssign(true)
      return
    }
    setBusy(true)
    setError('')
    try {
      if (assigning) {
        const employee = eligible.find((e) => e.id === employeeId)
        if (!employee) throw new Error('Vui lòng chọn nhân viên')
        await onAssign(employee, [...employee.roleIds, source.id])
      } else
        await onSave(modal.row?.id, {
          code: code.trim(),
          name: name.trim(),
          permissionIds: source?.permissionIds || []
        })
      onClose()
    } catch (cause) {
      setError(cause.message)
      if (approved) throw cause
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6"
      >
        <h2 id="role-modal-title" className="text-xl font-semibold">
          {assigning
            ? `Gán vai trò: ${source.name}`
            : modal.row
              ? 'Sửa vai trò'
              : modal.source
                ? 'Sao chép vai trò'
                : 'Thêm vai trò'}
        </h2>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {assigning ? (
            <label className="block text-sm font-semibold">
              Nhân viên
              <select
                required
                className={input}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={busy}
              >
                <option value="">Chọn nhân viên</option>
                {eligible.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} · {e.username}
                  </option>
                ))}
              </select>
              {!eligible.length && (
                <p className="mt-2 text-slate-500">
                  Không có nhân viên phù hợp chưa được gán vai trò này.
                </p>
              )}
            </label>
          ) : (
            <>
              <label className="block text-sm font-semibold">
                Mã vai trò
                <input
                  required
                  pattern="[a-zA-Z0-9_-]{2,64}"
                  maxLength={64}
                  className={input}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label className="block text-sm font-semibold">
                Tên vai trò
                <input
                  required
                  maxLength={200}
                  className={input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
                />
              </label>
              {modal.source && (
                <p className="text-sm text-slate-500">
                  Sao chép {source.permissionIds.length} quyền từ {source.name}.
                </p>
              )}
            </>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <footer className="flex justify-end gap-2">
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className={primaryButton} disabled={busy}>
              {busy ? 'Đang lưu…' : 'Lưu'}
            </button>
          </footer>
        </form>
        <ConfirmDialog
          open={confirmAssign}
          title="Gán vai trò"
          description={`Xác nhận gán vai trò ${source?.name || ''} cho nhân viên đã chọn?`}
          confirmLabel="Xác nhận gán"
          onClose={() => setConfirmAssign(false)}
          onConfirm={() => submit(null, true)}
          busy={busy}
        />
      </section>
    </div>
  )
}
