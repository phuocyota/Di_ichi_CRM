import React, { useState } from 'react'
import { toast } from 'sonner'
import apiClient from '../../services/apiClient.js'
import { createResource, updateResource } from '../../services/crmApi.js'
import {
  useWorkspace,
  money,
  date,
  nameOf,
  exportRows
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

const methods = [
  ['cash', 'Tiền mặt'],
  ['transfer', 'Chuyển khoản'],
  ['card', 'Thẻ'],
  ['qr', 'QR']
]
export default function FinancePage() {
  const workspace = useWorkspace('finance')
  const [tab, setTab] = useState('tuition'),
    [keyword, setKeyword] = useState(''),
    [selectedId, setSelectedId] = useState(''),
    [collecting, setCollecting] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const d = workspace.data?.data
  const transactions = (d?.financeTransaction || []).map((t) => ({
    ...t,
    name: nameOf(d.student, t.studentId),
    className: nameOf(d.class, t.classId),
    branch: nameOf(d.branch, t.branchId)
  }))
  const payments = (d?.payment || []).map((p) => {
    const t = transactions.find((t) => t.id === p.transactionId)
    return {
      ...p,
      name: t?.name || '—',
      className: t?.className || '—',
      receipt:
        d.receipt.find((r) => r.paymentId === p.id)?.code || 'Chưa phát hành',
      collector: nameOf(d.staff, p.collectorId)
    }
  })
  const selected = transactions.find((t) => t.id === selectedId)
  const rows = (
    tab === 'payments'
      ? payments
      : tab === 'debt'
        ? transactions.filter(
            (t) => t.status !== 'cancelled' && Number(t.debtAmount) > 0
          )
        : transactions
  ).filter(
    (r) =>
      !keyword ||
      `${r.code || ''} ${r.name} ${r.className} ${r.branch || ''}`
        .toLowerCase()
        .includes(keyword.toLowerCase())
  )
  async function refreshAfterSave() {
    try {
      await workspace.reload()
    } catch {
      toast.warning('Đã lưu thay đổi. Vui lòng tải lại dữ liệu.')
    }
  }
  async function collect(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const form = Object.fromEntries(new FormData(event.currentTarget)),
        amount = Number(form.amount)
      if (!(amount > 0) || amount > Number(collecting.debtAmount))
        throw new Error('Số tiền phải lớn hơn 0 và không vượt công nợ')
      await createResource('payment', {
        transactionId: collecting.id,
        amount,
        method: form.method,
        paidAt: form.paidAt,
        status: 'successful',
        ...(form.collectorId ? { collectorId: form.collectorId } : {}),
        ...(form.reference ? { externalReference: form.reference } : {}),
        note: form.note || ''
      })
      setCollecting(null)
      toast.success('Đã ghi nhận thanh toán')
      await refreshAfterSave()
    } catch (cause) {
      setError(cause.message)
    } finally {
      setBusy(false)
    }
  }
  async function cancel(row) {
    if (!window.confirm(`Hủy thanh toán ${money(row.amount)} của ${row.name}?`))
      return
    setBusy(true)
    try {
      await updateResource('payment', row.id, { status: 'cancelled' })
      toast.success('Đã hủy thanh toán')
      await refreshAfterSave()
    } catch (cause) {
      toast.error(cause.message)
    } finally {
      setBusy(false)
    }
  }
  async function remind(row) {
    setBusy(true)
    try {
      await apiClient.post('/workspace/notify', {
        studentId: row.studentId,
        title: 'Nhắc thanh toán học phí',
        content: `Khoản học phí ${row.code}: còn ${money(row.debtAmount)}, hạn thanh toán ${date(row.dueDate)}.`
      })
      toast.success('Đã tạo thông báo trong tài khoản học viên')
    } catch (cause) {
      toast.error(cause.message)
    } finally {
      setBusy(false)
    }
  }
  const columns =
    tab === 'payments'
      ? [
          ['name', 'Học viên'],
          ['receipt', 'Phiếu thu'],
          ['amount', 'Số tiền', (r) => money(r.amount)],
          [
            'method',
            'Phương thức',
            (r) => methods.find(([v]) => v === r.method)?.[1] || r.method
          ],
          ['paidAt', 'Ngày thu', (r) => date(r.paidAt)],
          ['collector', 'Người thu'],
          ['status', 'Trạng thái'],
          [
            'action',
            'Thao tác',
            (r) => (
              <button
                className={button}
                disabled={busy || r.status !== 'successful'}
                onClick={() => cancel(r)}
              >
                Hủy thanh toán
              </button>
            )
          ]
        ]
      : [
          ['code', 'Mã khoản thu'],
          ['name', 'Học viên'],
          ['className', 'Lớp học'],
          ['payableAmount', 'Phải thu', (r) => money(r.payableAmount)],
          ['paidAmount', 'Đã thu', (r) => money(r.paidAmount)],
          ['refundedAmount', 'Đã hoàn', (r) => money(r.refundedAmount)],
          ['debtAmount', 'Còn nợ', (r) => money(r.debtAmount)],
          ['dueDate', 'Hạn thanh toán', (r) => date(r.dueDate)],
          ['status', 'Trạng thái'],
          [
            'action',
            'Thao tác',
            (r) => (
              <div className="flex gap-2">
                <button className={button} onClick={() => setSelectedId(r.id)}>
                  Chi tiết
                </button>
                <button
                  className={button}
                  disabled={
                    busy ||
                    Number(r.debtAmount) <= 0 ||
                    r.status === 'cancelled'
                  }
                  onClick={() => {
                    setError('')
                    setCollecting(r)
                  }}
                >
                  Thu tiền
                </button>
                {tab === 'debt' && (
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => remind(r)}
                  >
                    Nhắc học phí
                  </button>
                )}
              </div>
            )
          ]
        ]
  const s = workspace.data?.statistics,
    charts = workspace.data?.charts
  return (
    <div className="min-w-0 space-y-5">
      <WorkspaceHeader
        title="Quản lý tài chính"
        tabs={[
          ['tuition', 'Học phí'],
          ['payments', 'Lịch sử thu tiền'],
          ['debt', 'Công nợ'],
          ['revenue', 'Doanh thu']
        ]}
        activeTab={tab}
        onTabChange={setTab}
        reload={workspace.reload}
      >
        <button
          className={button}
          disabled={!d}
          onClick={() =>
            exportRows(
              tab === 'revenue' ? charts.monthlyRevenue : rows,
              'tai-chinh'
            )
          }
        >
          Xuất Excel
        </button>
        <button className={button} onClick={() => window.print()}>
          In / lưu PDF
        </button>
      </WorkspaceHeader>
      <WorkspaceState {...workspace} />
      {d && (
        <>
          <WorkspaceStats
            items={[
              ['Tổng phải thu', money(s.payable)],
              ['Thanh toán thành công', money(s.revenue)],
              ['Công nợ hiện tại', money(s.debt)],
              ['Số giao dịch thành công', s.payments]
            ]}
          />
          {tab === 'revenue' ? (
            <div className="grid gap-5 xl:grid-cols-2">
              <WorkspaceChart
                title="Tiền thu thành công theo tháng"
                rows={charts.monthlyRevenue}
                currency
              />
              <WorkspaceChart
                title="Tiền thu theo cơ sở"
                rows={charts.branchRevenue}
                currency
              />
              <WorkspaceChart
                title="Phương thức thanh toán"
                rows={charts.paymentMethods}
                currency
              />
            </div>
          ) : (
            <>
              <input
                className={input}
                placeholder="Tìm mã khoản thu, học viên, lớp học…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <WorkspaceTable rows={rows} columns={columns} />
            </>
          )}
        </>
      )}
      {selected && (
        <section className="space-y-4 rounded-2xl border border-blue-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">
              Lịch sử thanh toán · {selected.name} · {selected.code}
            </h2>
            <button className={button} onClick={() => setSelectedId('')}>
              Đóng
            </button>
          </div>
          <WorkspaceTable
            rows={payments.filter((p) => p.transactionId === selected.id)}
            columns={[
              ['receipt', 'Phiếu thu'],
              ['amount', 'Số tiền', (r) => money(r.amount)],
              ['paidAt', 'Ngày thu', (r) => date(r.paidAt)],
              ['status', 'Trạng thái'],
              ['externalReference', 'Mã tham chiếu'],
              ['note', 'Ghi chú']
            ]}
          />
        </section>
      )}
      {collecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form
            onSubmit={collect}
            role="dialog"
            aria-modal="true"
            aria-label="Ghi nhận thanh toán"
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6"
          >
            <h2 className="text-xl font-black">
              Thu học phí · {collecting.name}
            </h2>
            <p className="text-sm text-slate-500">
              Còn phải thu: {money(collecting.debtAmount)}
            </p>
            <label className="block text-sm font-semibold">
              Số tiền
              <input
                name="amount"
                type="number"
                min="1"
                max={Number(collecting.debtAmount)}
                required
                className={input}
                defaultValue={Number(collecting.debtAmount)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Phương thức
              <select name="method" required className={input}>
                {methods.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Ngày thu
              <input
                name="paidAt"
                type="date"
                required
                className={input}
                defaultValue={new Date().toLocaleDateString('en-CA')}
              />
            </label>
            <label className="block text-sm font-semibold">
              Người thu
              <select name="collectorId" className={input}>
                <option value="">Chưa chọn</option>
                {d.staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Mã tham chiếu
              <input name="reference" className={input} />
            </label>
            <label className="block text-sm font-semibold">
              Ghi chú
              <textarea name="note" className={input} />
            </label>
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
                onClick={() => setCollecting(null)}
              >
                Hủy
              </button>
              <button className={button} disabled={busy}>
                {busy ? 'Đang lưu…' : 'Ghi nhận thanh toán'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}
