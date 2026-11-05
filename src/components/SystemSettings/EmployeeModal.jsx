import { ConfirmDialog } from '../common/ui.jsx'
import React, { useState } from 'react'
import { staffTypes } from '../../services/systemSettingsApi.js'
import { Plus } from 'lucide-react'
import EmployeeDirectoryCreate from './EmployeeDirectoryCreate.jsx'

const fieldClass =
  'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100'
export default function EmployeeModal({
  employeesOnly = false,
  modal,
  roles,
  directories,
  currentUserId,
  onClose,
  onSave,
  onRoles,
  onLock,
  onReset
}) {
  const row = modal.row || {},
    detail = modal.type === 'detail',
    roleOnly = modal.type === 'role',
    passwordOnly = modal.type === 'password',
    locking = modal.type === 'lock'
  const [form, setForm] = useState({
    code: row.code || '',
    name: row.name || '',
    type: employeesOnly ? 'KINH_DOANH' : row.typeValue || 'KINH_DOANH',
    branchId: row.branchId || '',
    departmentId: row.departmentId || '',
    positionId: row.positionId || '',
    specialtyId: row.specialtyId || '',
    phone: row.phone || '',
    email: row.loginEmail || row.email || '',
    status: row.statusValue || 'active',
    birthDate: row.birthDate?.slice(0, 10) || '',
    startDate: row.startDate?.slice(0, 10) || '',
    gender: row.gender || '',
    citizenId: row.citizenId || '',
    address: row.address || '',
    roleIds: row.roleIds || [],
    accountStatus: row.accountStatusValue || 'ACTIVE',
    password: ''
  })
  const [confirmAction, setConfirmAction] = useState(false)
  const [credentials, setCredentials] = useState(null)
  const [creatingDirectory, setCreatingDirectory] = useState(null)
  const [createdDirectories, setCreatedDirectories] = useState({ departments: [], positions: [] })
  const directoryRows = key => [...new Map([...createdDirectories[key], ...directories[key]].map(item => [item.id, item])).values()]
  const [confirm, setConfirm] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const own = row.accountId === currentUserId
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }))
  const text = (key, label, type = 'text', required = false) => (
    <label className="block text-sm font-semibold">
      {label}
      {required && ' *'}
      <input
        className={fieldClass}
        type={type}
        required={required}
        disabled={detail || busy}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        autoComplete={type === 'password' ? 'new-password' : undefined}
      />
    </label>
  )
  const select = (key, label, options, required = false, disabled = false, createResource = null) => (
    <div className="block text-sm font-semibold">
      <div className="flex min-h-6 items-center justify-between gap-2"><label htmlFor={`employee-${key}`}>{label}{required && ' *'}</label>
      {createResource && !detail && <button type="button" disabled={busy} className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50" aria-label={`Thêm ${label.toLowerCase()}`} title={`Thêm ${label.toLowerCase()}`} onClick={() => setCreatingDirectory(createResource)}><Plus size={15} aria-hidden="true" /></button>}</div>
      <select
        id={`employee-${key}`}
        className={fieldClass}
        required={required}
        disabled={detail || busy || disabled}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {form[key] && !options.some((o) => o.value === form[key]) && (
          <option value={form[key]}>{form[key]}</option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
  const roleFields = (
    <div className="space-y-2">
      {roles
        .filter((r) => r.code !== 'student')
        .map((r) => (
          <label
            className="flex items-center gap-2 rounded-lg border p-2 text-sm"
            key={r.id}
          >
            <input
              type="checkbox"
              disabled={
                busy ||
                detail ||
                (r.code === 'super_admin' &&
                  form.type !== 'ADMIN' &&
                  !form.roleIds.includes(r.id))
              }
              checked={form.roleIds.includes(r.id)}
              onChange={(e) =>
                set(
                  'roleIds',
                  e.target.checked
                    ? [...form.roleIds, r.id]
                    : form.roleIds.filter((id) => id !== r.id)
                )
              }
            />
            {r.name}
          </label>
        ))}
      {!roles.length && (
        <p className="text-sm text-slate-500">Chưa có vai trò.</p>
      )}
    </div>
  )
  async function submit(event, approved = false) {
    event?.preventDefault()
    setError('')
    if (
      !roleOnly &&
      !locking &&
      !detail &&
      (passwordOnly || ((row.accountId || form.email.trim()) && form.password))
    ) {
      if (form.password !== confirm) {
        setError('Mật khẩu xác nhận không khớp')
        return
      }
      if (
        Array.from(form.password).length < 8 ||
        new TextEncoder().encode(form.password).length > 72
      ) {
        setError('Mật khẩu cần ít nhất 8 ký tự và không quá dài')
        return
      }
    }
    const sensitive =
      row.accountId &&
      (passwordOnly ||
        roleOnly ||
        !!form.password ||
        form.type !== row.typeValue ||
        form.accountStatus !== row.accountStatusValue ||
        JSON.stringify([...form.roleIds].sort()) !==
          JSON.stringify([...(row.roleIds || [])].sort()))
    if (!locking && sensitive && !approved) {
      setConfirmAction(true)
      return
    }
    setBusy(true)
    try {
      if (roleOnly) await onRoles(row, form.roleIds)
      else if (passwordOnly) await onReset(row, form.password)
      else if (locking) await onLock(row, !row.lockedAt)
      else {
        if (!staffTypes.some((t) => t.value === form.type))
          throw new Error('Vui lòng chọn loại tài khoản được hỗ trợ')
        const payload = {
          ...form,
          email: form.email.trim().toLowerCase(),
          roleIds: row.accountId || form.email.trim() ? form.roleIds : [],
          code: form.code.trim(),
          name: form.name.trim()
        }
        for (const key of [
          'departmentId',
          'positionId',
          'specialtyId',
          'phone',
          'birthDate',
          'startDate',
          'gender',
          'citizenId',
          'address'
        ])
          payload[key] = payload[key] || null
        if (!payload.password) delete payload.password
        if (!payload.email) { delete payload.email; delete payload.password }
        const result = await onSave(row, payload)
        if (result?.credentials) { setCredentials(result.credentials); return }
      }
      onClose()
    } catch (cause) {
      setError(cause.message || 'Không lưu được thay đổi')
      if (approved) throw cause
    } finally {
      setBusy(false)
    }
  }
  if (credentials) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><section role="dialog" aria-modal="true" aria-label="Tài khoản nhân viên vừa tạo" className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-semibold">Đã tạo tài khoản nhân viên</h2><p className="text-sm text-slate-600">Lưu lại thông tin đăng nhập trước khi đóng. Mật khẩu tự sinh chỉ hiển thị tại đây sau khi tạo.</p><label className="block text-sm font-semibold">Email<input className={fieldClass} readOnly value={credentials.email} /></label><label className="block text-sm font-semibold">Mật khẩu khởi tạo<input className={fieldClass} readOnly autoComplete="off" value={credentials.password} /></label><button type="button" className="ui-button ui-button-primary" onClick={onClose}>Đã lưu thông tin · Đóng</button></section></div>
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section
        className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-modal-title"
      >
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">
              {detail
                ? 'Chi tiết nhân viên'
                : roleOnly
                  ? 'Gán vai trò'
                  : passwordOnly
                    ? 'Đặt lại mật khẩu'
                    : locking
                      ? row.lockedAt
                        ? 'Mở khóa tài khoản'
                        : 'Khóa tài khoản'
                      : row.id
                        ? 'Sửa nhân viên'
                        : 'Thêm nhân viên'}
            </p>
            <h2
              id="employee-modal-title"
              className="mt-2 text-xl font-semibold"
            >
              {row.name || 'Nhân viên mới'}
            </h2>
          </div>
          <button
            disabled={busy}
            type="button"
            className="rounded-lg border px-3 py-2"
            onClick={onClose}
          >
            Đóng
          </button>
        </header>
        <form onSubmit={submit} className="mt-6 space-y-5">
          {locking ? (
            <p>
              Bạn muốn {row.lockedAt ? 'mở khóa' : 'khóa'} tài khoản{' '}
              {row.username}?
            </p>
          ) : roleOnly ? (
            roleFields
          ) : passwordOnly ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {text('password', 'Mật khẩu mới', 'password', true)}
              <label className="block text-sm font-semibold">
                Nhập lại mật khẩu mới *
                <input
                  required
                  disabled={busy}
                  type="password"
                  autoComplete="new-password"
                  className={fieldClass}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </label>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {text('code', 'Mã nhân viên', 'text', true)}
                {text('name', 'Họ và tên', 'text', true)}
                {!employeesOnly && select(
                  'type',
                  'Loại nhân viên',
                  staffTypes,
                  true,
                  own && form.type === 'ADMIN'
                )}
                {select(
                  'branchId',
                  'Chi nhánh',
                  directories.branches.map((b) => ({
                    value: b.id,
                    label: b.name
                  })),
                  true
                )}
                {select(
                  'departmentId',
                  'Phòng ban',
                  directoryRows('departments').map((b) => ({
                    value: b.id,
                    label: b.name
                  })), false, false, 'department'
                )}
                {select(
                  'positionId',
                  'Chức vụ',
                  directoryRows('positions').map((b) => ({
                    value: b.id,
                    label: b.name
                  })), false, false, 'position'
                )}
                {select(
                  'specialtyId',
                  'Chuyên môn',
                  directories.specialties.map((b) => ({
                    value: b.id,
                    label: b.name
                  }))
                )}
                {text('email', 'Email đăng nhập', 'email', form.type === 'TEACHER' || Boolean(row.accountId))}
                {text('phone', 'Số điện thoại')}
                {text('gender', 'Giới tính')}
                {text('birthDate', 'Ngày sinh', 'date')}
                {text('citizenId', 'CCCD')}
                {text('address', 'Địa chỉ')}
                {text('startDate', 'Ngày vào làm', 'date')}
                {select(
                  'status',
                  'Trạng thái nhân viên',
                  [
                    { value: 'active', label: 'Đang làm việc' },
                    { value: 'inactive', label: 'Ngừng làm việc' }
                  ],
                  true,
                  own
                )}
                {select(
                  'accountStatus',
                  'Trạng thái tài khoản',
                  [
                    { value: 'ACTIVE', label: 'Hoạt động' },
                    { value: 'INACTIVE', label: 'Ngừng hoạt động' }
                  ],
                  true,
                  own
                )}
              </div>
              {!detail && (row.accountId || form.email.trim()) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {text(
                    'password',
                    row.accountId
                      ? 'Mật khẩu mới (để trống nếu giữ nguyên)'
                      : 'Mật khẩu đăng nhập (để trống để tự sinh)',
                    'password',
                    false
                  )}
                  <label className="block text-sm font-semibold">
                    Nhập lại mật khẩu
                    <input
                      type="password"
                      autoComplete="new-password"
                      className={fieldClass}
                      value={confirm}
                      disabled={busy}
                      required={!!form.password}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </label>
                </div>
              )}
              {row.accountId || form.email.trim() ? <><h3 className="font-semibold">Vai trò</h3>{roleFields}<p className="text-sm text-slate-600">Có email: tài khoản đăng nhập được tạo cùng nhân viên. Có thể nhập mật khẩu hoặc để hệ thống tự sinh.</p></> : <p className="text-sm text-slate-600">Chưa nhập email: chỉ lưu hồ sơ nhân viên, chưa tạo tài khoản đăng nhập.</p>}
              {detail && (
                <p className="text-sm text-slate-600">
                  {row.accountStatus} · Đăng nhập gần nhất: {row.lastLogin}
                </p>
              )}
            </>
          )}
          {form.type === 'ADMIN' && !locking && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Tài khoản quản trị viên có toàn quyền. Giới hạn theo vai trò áp
              dụng cho tài khoản thuộc loại khác.
            </p>
          )}
          {(passwordOnly || form.password) && (
            <p className="text-sm text-slate-600">
              Đặt lại mật khẩu sẽ yêu cầu tài khoản đăng nhập lại.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          {!detail && (
            <footer className="flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="rounded-xl border px-4 py-2 font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {busy ? 'Đang lưu…' : 'Lưu'}
              </button>
            </footer>
          )}
        </form>
        {creatingDirectory && <EmployeeDirectoryCreate resource={creatingDirectory} onClose={() => setCreatingDirectory(null)} onCreated={created => {
          const key = creatingDirectory === 'department' ? 'departments' : 'positions'
          setCreatedDirectories(previous => ({ ...previous, [key]: [...previous[key], created] }))
          set(creatingDirectory === 'department' ? 'departmentId' : 'positionId', created.id)
          setCreatingDirectory(null)
        }} />}
        <ConfirmDialog
          open={confirmAction}
          title={passwordOnly ? 'Đặt lại mật khẩu' : 'Thay đổi quyền truy cập'}
          description={`Xác nhận cập nhật tài khoản của ${row.name || 'nhân viên'}? Tài khoản có thể cần đăng nhập lại.`}
          confirmLabel="Xác nhận cập nhật"
          onClose={() => setConfirmAction(false)}
          onConfirm={() => submit(null, true)}
          busy={busy}
        />
      </section>
    </div>
  )
}
