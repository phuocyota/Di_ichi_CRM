import {
  EmptyState,
  SearchInput,
  ChartCard,
  StatusBadge
} from '../../components/common/ui.jsx'
import React, { useState } from 'react'
import { toast } from 'sonner'
import {
  createResource,
  updateResource,
  deleteResource
} from '../../services/crmApi.js'
import {
  useWorkspace,
  saveWorkspaceRecord,
  money,
  nameOf,
  exportRows,
  date
} from '../../services/workspaceApi.js'
import {
  WorkspaceChart,
  WorkspaceHeader,
  WorkspaceState,
  WorkspaceStats,
  WorkspaceTable,
  input,
  button
} from '../../components/common/WorkspaceView.jsx'

export default function ParentPage() {
  const workspace = useWorkspace('parents')
  const [tab, setTab] = useState('dashboard'),
    [keyword, setKeyword] = useState(''),
    [editing, setEditing] = useState(null),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const d = workspace.data?.data
  const rows = (d?.studentGuardian || []).map((g) => {
    const student = d.student.find((s) => s.id === g.studentId)
    const enrollments = d.enrollment.filter(
      (e) => e.studentId === g.studentId && e.isCurrent
    )
    return {
      ...g,
      student: student?.name || '—',
      branch: nameOf(d.branch, student?.branchId),
      classes:
        enrollments.map((e) => nameOf(d.class, e.classId)).join(', ') || '—',
      debt: d.financeTransaction
        .filter((t) => t.studentId === g.studentId && t.status !== 'cancelled')
        .reduce((n, t) => n + Number(t.debtAmount), 0)
    }
  })
  const filtered = rows.filter(
    (r) =>
      !keyword ||
      `${r.name} ${r.student} ${r.phone} ${r.branch}`
        .toLowerCase()
        .includes(keyword.toLowerCase())
  )
  const activities = (workspace.data?.records || []).filter(
    (r) => r.kind === 'care'
  )
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const form = Object.fromEntries(new FormData(event.currentTarget))
    try {
      if (editing.care)
        await saveWorkspaceRecord(null, {
          kind: 'care',
          name: form.name.trim(),
          status: 'completed',
          content: {
            guardianId: editing.id,
            studentId: editing.studentId,
            note: form.note,
            date: new Date().toISOString()
          }
        })
      else {
        const payload = {
          name: form.name.trim(),
          phone: form.phone.trim(),
          relationship: form.relationship.trim(),
          studentId: form.studentId,
          isPrimary: form.isPrimary === 'on'
        }
        if (editing.id)
          await updateResource('student-guardian', editing.id, payload)
        else await createResource('student-guardian', payload)
      }
      toast.success('Đã lưu dữ liệu phụ huynh')
      setEditing(null)
      try {
        await workspace.reload()
      } catch {
        toast.warning('Đã lưu, vui lòng tải lại dữ liệu')
      }
    } catch (cause) {
      setError(cause.message)
    } finally {
      setBusy(false)
    }
  }
  async function remove(row) {
    if (!window.confirm(`Xóa liên hệ phụ huynh ${row.name}?`)) return
    setBusy(true)
    try {
      await deleteResource('student-guardian', row.id)
      setSelected(null)
      await workspace.reload()
      toast.success('Đã xóa liên hệ')
    } catch (cause) {
      toast.error(cause.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        title="Quản lý phụ huynh"
        tabs={[
          ['dashboard', 'Tổng quan'],
          ['list', 'Danh sách phụ huynh']
        ]}
        activeTab={tab}
        onTabChange={setTab}
        reload={workspace.reload}
      >
        <button
          className={`${button} ui-button-primary`}
          disabled={!d}
          onClick={() => {
            setError('')
            setEditing({})
          }}
        >
          Thêm phụ huynh
        </button>
        <button
          className={button}
          disabled={!d}
          onClick={() => exportRows(filtered, 'phu-huynh')}
        >
          Xuất Excel
        </button>
        <button className={button} onClick={() => window.print()}>
          In / lưu PDF
        </button>
      </WorkspaceHeader>
      <WorkspaceState {...workspace} />
      {d &&
        (tab === 'dashboard' ? (
          <>
            <WorkspaceStats
              items={[
                ['Liên hệ phụ huynh', rows.length],
                ['Liên hệ chính', rows.filter((g) => g.isPrimary).length],
                [
                  'Học viên có liên hệ',
                  new Set(rows.map((g) => g.studentId)).size
                ],
                ['Hoạt động chăm sóc đã ghi nhận', activities.length]
              ]}
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <WorkspaceChart
                title="Trạng thái học viên"
                rows={workspace.data.charts.studentStatus}
                statusContext="student"
              />
              <ChartCard
                title="Chăm sóc gần đây"
                description="Những liên hệ đã được ghi nhận gần nhất."
              >
                {activities.slice(0, 10).map((a) => (
                  <article key={a.id} className="ui-care-activity">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{a.name}</p>
                      <StatusBadge value={a.status} />
                    </div>
                    <p className="mt-1 text-slate-500">
                      {rows.find((g) => g.id === a.content.guardianId)?.name ||
                        'Liên hệ đã xóa'}{' '}
                      · {date(a.createdAt)}
                    </p>
                    <p className="mt-1">{a.content.note}</p>
                  </article>
                ))}
                {!activities.length && (
                  <EmptyState
                    compact
                    title="Chưa có hoạt động chăm sóc"
                    description="Mở danh sách phụ huynh để ghi nhận lần liên hệ đầu tiên."
                  />
                )}
              </ChartCard>
            </div>
          </>
        ) : (
          <>
            <SearchInput
              value={keyword}
              onChange={setKeyword}
              placeholder="Tên phụ huynh, học viên, số điện thoại"
            />
            <WorkspaceTable
              rows={filtered}
              onSelect={setSelected}
              columns={[
                ['name', 'Phụ huynh'],
                [
                  'phone',
                  'Số điện thoại',
                  (r) => (
                    <a className="text-blue-600" href={`tel:${r.phone}`}>
                      {r.phone}
                    </a>
                  )
                ],
                ['relationship', 'Quan hệ'],
                ['student', 'Học viên'],
                ['classes', 'Lớp hiện tại'],
                ['branch', 'Cơ sở'],
                ['debt', 'Công nợ học viên', (r) => money(r.debt)],
                [
                  'actions',
                  'Thao tác',
                  (r) => (
                    <div className="flex gap-2">
                      <button
                        className={button}
                        onClick={() => {
                          setError('')
                          setEditing(r)
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className={button}
                        onClick={() => {
                          setError('')
                          setEditing({ ...r, care: true })
                        }}
                      >
                        Ghi nhận chăm sóc
                      </button>
                      <button
                        disabled={busy}
                        className={button}
                        onClick={() => remove(r)}
                      >
                        Xóa
                      </button>
                    </div>
                  )
                ]
              ]}
            />
          </>
        ))}
      {selected && (
        <section className="rounded-2xl border border-blue-100 bg-white p-5">
          <div className="flex justify-between">
            <h2 className="font-bold">Liên hệ: {selected.name}</h2>
            <button className={button} onClick={() => setSelected(null)}>
              Đóng
            </button>
          </div>
          <p className="mt-3 text-sm">
            {selected.relationship} của {selected.student} · {selected.phone}
          </p>
          <WorkspaceTable
            rows={activities.filter(
              (a) => a.content.guardianId === selected.id
            )}
            columns={[
              ['name', 'Nội dung chăm sóc'],
              ['createdAt', 'Ngày', (r) => date(r.createdAt)],
              ['note', 'Ghi chú', (r) => r.content.note]
            ]}
          />
        </section>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-label="Thông tin phụ huynh"
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6"
          >
            <h2 className="text-xl font-black">
              {editing.care
                ? 'Ghi nhận chăm sóc'
                : editing.id
                  ? 'Sửa phụ huynh'
                  : 'Thêm phụ huynh'}
            </h2>
            <label className="block text-sm font-semibold">
              {editing.care ? 'Nội dung' : 'Họ và tên'}
              <input
                name="name"
                required
                className={input}
                defaultValue={editing.care ? '' : editing.name || ''}
              />
            </label>
            {editing.care ? (
              <label className="block text-sm font-semibold">
                Ghi chú
                <textarea name="note" className={input} />
              </label>
            ) : (
              <>
                <label className="block text-sm font-semibold">
                  Số điện thoại
                  <input
                    name="phone"
                    type="tel"
                    required
                    className={input}
                    defaultValue={editing.phone || ''}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Quan hệ
                  <input
                    name="relationship"
                    required
                    className={input}
                    defaultValue={editing.relationship || ''}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Học viên
                  <select
                    name="studentId"
                    required
                    defaultValue={editing.studentId || ''}
                    className={input}
                  >
                    <option value="">Chọn học viên</option>
                    {d.student.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} · {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    name="isPrimary"
                    type="checkbox"
                    defaultChecked={editing.isPrimary || false}
                  />
                  Liên hệ chính
                </label>
              </>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <footer className="flex justify-end gap-2">
              <button
                className={button}
                type="button"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                Hủy
              </button>
              <button className={button} disabled={busy}>
                {busy ? 'Đang lưu…' : 'Lưu'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}
