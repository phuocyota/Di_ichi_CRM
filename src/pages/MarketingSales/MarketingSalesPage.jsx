import React, { useState } from 'react'
import { toast } from 'sonner'
import { updateResource } from '../../services/crmApi.js'
import {
  useWorkspace,
  saveWorkspaceRecord,
  deleteWorkspaceRecord,
  money,
  nameOf,
  exportRows
} from '../../services/workspaceApi.js'
import {
  WorkspaceHeader,
  WorkspaceState,
  WorkspaceStats,
  WorkspaceTable,
  input,
  button
} from '../../components/common/WorkspaceView.jsx'

const metadata = (note) => {
  try {
    const value = JSON.parse(note)
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : { note }
  } catch {
    return { note: note || '' }
  }
}
export default function MarketingSalesPage() {
  const workspace = useWorkspace('marketing')
  const [tab, setTab] = useState('source'),
    [keyword, setKeyword] = useState(''),
    [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const d = workspace.data?.data,
    records = workspace.data?.records || []
  const students = (d?.student || []).map((s) => ({
    ...s,
    meta: metadata(s.note)
  }))
  const rows =
    tab === 'sales'
      ? (d?.staff || [])
          .filter((s) => s.type.toLowerCase() === 'kinh_doanh')
          .map((s) => {
            const userIds = workspace.data.users
              .filter((u) => u.staffId === s.id)
              .map((u) => u.id)
            const assigned = students.filter((c) =>
              userIds.includes(c.assignedSaleUserId)
            )
            return {
              ...s,
              leads: assigned.length,
              active: assigned.filter((c) => c.status === 'active').length
            }
          })
      : tab === 'leads'
        ? students.map((s) => ({
            ...s,
            source:
              records.find((r) => r.id === s.meta.sourceId)?.name ||
              'Chưa cập nhật',
            campaign:
              records.find((r) => r.id === s.meta.campaignId)?.name ||
              'Chưa cập nhật',
            sale: nameOf(
              d.staff,
              workspace.data.users.find((u) => u.id === s.assignedSaleUserId)
                ?.staffId
            )
          }))
        : records
            .filter((r) => r.kind === tab)
            .map((r) => ({
              ...r,
              cost: money(r.content.cost ?? r.content.budget),
              leads: students.filter(
                (s) =>
                  s.meta[tab === 'source' ? 'sourceId' : 'campaignId'] === r.id
              ).length
            }))
  const filtered = rows.filter(
    (r) =>
      !keyword ||
      `${r.name} ${r.code || ''} ${r.status}`
        .toLowerCase()
        .includes(keyword.toLowerCase())
  )
  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const form = Object.fromEntries(new FormData(event.currentTarget))
      if (editing.lead)
        await updateResource('student', editing.id, {
          note: JSON.stringify({
            ...editing.meta,
            sourceId: form.sourceId || null,
            campaignId: form.campaignId || null
          })
        })
      else
        await saveWorkspaceRecord(editing.id, {
          kind: tab,
          name: form.name.trim(),
          status: form.status,
          content: {
            ...editing.content,
            cost: Number(form.cost || 0),
            note: form.note || ''
          }
        })
      toast.success('Đã lưu dữ liệu')
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
    if (!window.confirm(`Xóa ${row.name}?`)) return
    setBusy(true)
    try {
      await deleteWorkspaceRecord(row.id)
      toast.success('Đã xóa')
      await workspace.reload()
    } catch (cause) {
      toast.error(cause.message)
    } finally {
      setBusy(false)
    }
  }
  const columns =
    tab === 'sales'
      ? [
          ['name', 'Nhân viên'],
          ['leads', 'Hồ sơ được giao'],
          ['active', 'Đang học']
        ]
      : tab === 'leads'
        ? [
            ['name', 'Học viên / ứng viên'],
            ['source', 'Nguồn'],
            ['campaign', 'Chiến dịch'],
            ['sale', 'Sale phụ trách'],
            ['status', 'Trạng thái'],
            [
              'action',
              'Thao tác',
              (r) => (
                <button
                  className={button}
                  onClick={() => {
                    setError('')
                    setEditing({ ...r, lead: true })
                  }}
                >
                  Gán nguồn / chiến dịch
                </button>
              )
            ]
          ]
        : [
            ['name', tab === 'source' ? 'Nguồn khách hàng' : 'Chiến dịch'],
            ['status', 'Trạng thái'],
            ['cost', 'Chi phí đã nhập'],
            ['leads', 'Hồ sơ liên kết'],
            [
              'action',
              'Thao tác',
              (r) => (
                <div className="flex gap-2">
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => {
                      setError('')
                      setEditing(r)
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => remove(r)}
                  >
                    Xóa
                  </button>
                </div>
              )
            ]
          ]
  return (
    <div className="space-y-5">
      <WorkspaceHeader
        title="Marketing & Sale"
        tabs={[
          ['source', 'Nguồn khách hàng'],
          ['campaign', 'Chiến dịch'],
          ['leads', 'Hồ sơ liên kết'],
          ['sales', 'Sale phụ trách']
        ]}
        activeTab={tab}
        onTabChange={setTab}
        reload={workspace.reload}
      >
        {['source', 'campaign'].includes(tab) && (
          <button
            className={button}
            disabled={workspace.loading}
            onClick={() => {
              setError('')
              setEditing({})
            }}
          >
            Thêm {tab === 'source' ? 'nguồn' : 'chiến dịch'}
          </button>
        )}
        <button
          className={button}
          disabled={!d}
          onClick={() => exportRows(filtered, 'marketing-sale')}
        >
          Xuất Excel
        </button>
      </WorkspaceHeader>
      <WorkspaceState {...workspace} />
      {d && (
        <>
          <WorkspaceStats
            items={[
              [
                'Nguồn khách hàng',
                records.filter((r) => r.kind === 'source').length
              ],
              [
                'Chiến dịch',
                records.filter((r) => r.kind === 'campaign').length
              ],
              ['Ứng viên hiện tại', workspace.data.statistics.candidates],
              [
                'Hồ sơ chưa có nguồn',
                students.filter((s) => !s.meta.sourceId).length
              ]
            ]}
          />
          <input
            className={input}
            placeholder="Tìm kiếm…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <WorkspaceTable rows={filtered} columns={columns} />
        </>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-label="Cập nhật Marketing"
            onSubmit={save}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6"
          >
            <h2 className="text-xl font-black">
              {editing.lead
                ? editing.name
                : editing.id
                  ? 'Chỉnh sửa'
                  : 'Thêm mới'}
            </h2>
            {editing.lead ? (
              <>
                {[
                  ['source', 'Nguồn khách hàng'],
                  ['campaign', 'Chiến dịch']
                ].map(([kind, label]) => (
                  <label key={kind} className="block text-sm font-semibold">
                    {label}
                    <select
                      className={input}
                      name={`${kind}Id`}
                      defaultValue={editing.meta[`${kind}Id`] || ''}
                    >
                      <option value="">Chưa cập nhật</option>
                      {records
                        .filter((r) => r.kind === kind)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                    </select>
                  </label>
                ))}
              </>
            ) : (
              <>
                <label className="block text-sm font-semibold">
                  Tên
                  <input
                    name="name"
                    required
                    maxLength={200}
                    className={input}
                    defaultValue={editing.name || ''}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Trạng thái
                  <select
                    className={input}
                    name="status"
                    defaultValue={editing.status || 'active'}
                  >
                    {[
                      ['active', 'Hoạt động'],
                      ['inactive', 'Tạm dừng'],
                      ['completed', 'Hoàn thành'],
                      ['cancelled', 'Đã hủy']
                    ].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Chi phí thực tế (đ)
                  <input
                    name="cost"
                    type="number"
                    min="0"
                    className={input}
                    defaultValue={editing.content?.cost || 0}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Ghi chú
                  <textarea
                    name="note"
                    className={input}
                    defaultValue={editing.content?.note || ''}
                  />
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
                type="button"
                disabled={busy}
                className={button}
                onClick={() => setEditing(null)}
              >
                Hủy
              </button>
              <button disabled={busy} className={button}>
                {busy ? 'Đang lưu…' : 'Lưu'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}
