import { useResourceUpdates } from '../../services/realtime.js'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import EmployeesPanel from '../../components/SystemSettings/EmployeesPanel.jsx'
import PermissionsPanel from '../../components/SystemSettings/PermissionsPanel.jsx'
import SystemSettingsHeader from '../../components/SystemSettings/SystemSettingsHeader.jsx'
import { assignRoles, deleteEmployee, deleteRole, isBusinessEmployee, loadSettings, lockAccount, resetPassword, saveEmployee, savePermissions, saveRole, settingsView, settingTabs } from '../../services/systemSettingsApi.js'

export default function SystemSettingsPage({ employeesOnly = false }) {
  const [activeTab, setActiveTab] = useState('employees'), [keyword, setKeyword] = useState('')
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false)
  const requestId = useRef(0), lock = useRef(false)
  const reload = useCallback(async (signal, { silent = false } = {}) => {
    const id = ++requestId.current; if (!silent) setLoading(true); setError('')
    try { const next = await loadSettings(signal); if (id === requestId.current) setData(next); return next }
    catch (cause) { if (!signal?.aborted && id === requestId.current) setError(cause.message); throw cause }
    finally { if (!signal?.aborted && id === requestId.current) setLoading(false) }
  }, [])
  useEffect(() => { const controller = new AbortController(); reload(controller.signal).catch(() => {}); return () => controller.abort() }, [reload])
  useResourceUpdates(() => reload(undefined, { silent: true }), ['system-settings','staff','user-account','role','user-role','role-permission','branch'], !busy)
  async function mutate(action, message) {
    if (lock.current || loading) throw new Error('Đang xử lý dữ liệu, vui lòng chờ')
    lock.current = true; setBusy(true)
    try {
      const result = await action(); toast.success(message)
      try { await reload() } catch { toast.warning('Đã lưu thay đổi nhưng chưa tải lại được dữ liệu. Vui lòng thử lại.') }
      return result
    } finally { lock.current = false; setBusy(false) }
  }
  const refresh = () => { setKeyword(''); reload().then(() => toast.success('Đã tải lại dữ liệu từ máy chủ')).catch(() => {}) }
  const view = useMemo(() => data ? settingsView(data) : null, [data])
  const employeeRows = useMemo(() => employeesOnly ? view?.employeeRows.filter(isBusinessEmployee) : view?.employeeRows, [view, employeesOnly])
  return <div className="space-y-6">
    <SystemSettingsHeader employeesOnly={employeesOnly} activeTab={employeesOnly ? 'employees' : activeTab} tabs={employeesOnly ? null : settingTabs} keyword={keyword} onKeywordChange={setKeyword} onTabChange={tab => { setActiveTab(tab); setKeyword('') }} />
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error} {data && 'Dữ liệu đang hiển thị là lần tải thành công gần nhất.'}<button type="button" onClick={refresh} className="ml-3 underline">Thử lại</button></div>}
    {loading && <p role="status" className="rounded-xl bg-white p-4 text-slate-600">{employeesOnly ? 'Đang tải danh sách nhân viên…' : 'Đang tải cài đặt hệ thống…'}</p>}
    {data && view && (employeesOnly || activeTab === 'employees' ? <EmployeesPanel employeesOnly={employeesOnly} sectionLabel={employeesOnly ? 'Quản lý nhân viên' : 'Cài đặt hệ thống'} rows={employeeRows} roles={data.roles} directories={data} currentUserId={data.currentUserId} keyword={keyword} busy={busy || loading} onRefresh={refresh}
      onSave={(row, payload) => mutate(() => saveEmployee(row, employeesOnly ? { ...payload, type: 'KINH_DOANH' } : payload), 'Đã lưu nhân viên')}
      onDelete={row => mutate(() => deleteEmployee(row.id), 'Đã xóa nhân viên và vô hiệu hóa tài khoản liên kết')}
      onRoles={(row, ids) => mutate(() => assignRoles(row.accountId, ids), 'Đã lưu vai trò')}
      onLock={(row, locked) => mutate(() => lockAccount(row.accountId, locked), locked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')}
      onReset={(row, password) => mutate(() => resetPassword(row.accountId, password), 'Đã đặt lại mật khẩu; tài khoản cần đăng nhập lại')} />
      : <PermissionsPanel rows={view.roleRows} permissions={data.permissions} modules={data.modules} employees={view.employeeRows} auditLogs={view.auditLogs} keyword={keyword} busy={busy || loading} onRefresh={refresh}
        onSave={(id, payload) => mutate(() => saveRole(id, payload), 'Đã lưu vai trò')}
        onPermissions={(id, ids) => mutate(() => savePermissions(id, ids), 'Đã lưu quyền truy cập')}
        onDelete={id => mutate(() => deleteRole(id), 'Đã xóa vai trò')}
        onAssign={(row, ids) => mutate(() => assignRoles(row.accountId, ids), 'Đã gán vai trò cho nhân viên')} />)}
  </div>
}
