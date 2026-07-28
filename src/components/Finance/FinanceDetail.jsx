import { useState } from 'react'
import dayjs from 'dayjs'
import { Mail, Printer, ReceiptText, Send, TicketPercent } from 'lucide-react'

const formatCurrency = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} đ`

function FinanceDetail({ transaction, tabs, receipts, debts, promotions, vouchers, scholarships, onOpenModal }) {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const transactionReceipts = receipts.filter((item) => item.transactionId === transaction.id)
  const transactionDebt = debts.find((item) => item.transactionId === transaction.id)

  const renderCards = (rows) => (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, value, tone]) => (
        <div key={label} className={`rounded-xl border p-4 ${tone || 'border-gray-300 bg-slate-50 text-slate-950'}`}>
          <p className="text-xs font-black uppercase opacity-70">{label}</p>
          <p className="mt-2 text-sm font-bold">{value || 'Chưa cập nhật'}</p>
        </div>
      ))}
    </div>
  )

  const renderTable = (columns, rows, emptyText) => (
    <div className="mt-5 overflow-x-auto rounded-xl border border-gray-300">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
          <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3">{column.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length ? rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 font-semibold text-slate-700">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td className="px-4 py-6 text-center text-sm font-semibold text-slate-500" colSpan={columns.length}>{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-700">{transaction.code}</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{transaction.student}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{transaction.course} / {transaction.className}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('collectTuition', transaction)}>
            <ReceiptText size={16} /> Thu học phí
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('applyVoucher', transaction)}>
            <TicketPercent size={16} /> Voucher
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('printReceipt', transaction)}>
            <Printer size={16} /> In phiếu thu
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('emailReceipt', transaction)}>
            <Mail size={16} /> Email biên lai
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('notifyPayment', transaction)}>
            <Send size={16} /> Thông báo
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab} type="button" className={['shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition', activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'].join(' ')} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Thông tin học phí' ? renderCards([
        ['Học viên', transaction.student],
        ['Khóa học', transaction.course],
        ['Lớp học', transaction.className],
        ['Tổng học phí', formatCurrency(transaction.tuitionFee)],
        ['Đã thanh toán', formatCurrency(transaction.paid), 'border-emerald-200 bg-emerald-50 text-emerald-700'],
        ['Còn nợ', formatCurrency(transaction.debt), transaction.debt > 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'],
        ['Hạn thanh toán', dayjs(transaction.dueDate).format('DD/MM/YYYY')],
        ['Phương thức', transaction.method],
        ['Trạng thái', transaction.status],
      ]) : null}

      {activeTab === 'Lịch sử thanh toán' ? renderTable(
        [
          { key: 'code', label: 'Phiếu thu' },
          { key: 'paidAt', label: 'Ngày thanh toán', render: (row) => dayjs(row.paidAt).format('DD/MM/YYYY') },
          { key: 'amount', label: 'Số tiền', render: (row) => formatCurrency(row.amount) },
          { key: 'method', label: 'Phương thức' },
          { key: 'collector', label: 'Người thu' },
          { key: 'note', label: 'Ghi chú' },
        ],
        transactionReceipts,
        'Chưa có lịch sử thanh toán.',
      ) : null}

      {activeTab === 'Công nợ' ? (
        <>
          {renderCards([
            ['Số tiền còn thiếu', formatCurrency(transactionDebt?.amount || transaction.debt), 'border-red-200 bg-red-50 text-red-700'],
            ['Hạn thanh toán', transactionDebt?.dueDate ? dayjs(transactionDebt.dueDate).format('DD/MM/YYYY') : dayjs(transaction.dueDate).format('DD/MM/YYYY')],
            ['Trạng thái', transactionDebt?.status || transaction.status],
          ])}
          <div className="mt-5 rounded-xl border border-gray-300 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Lịch sử nhắc nợ</p>
            <div className="mt-3 space-y-2">
              {(transactionDebt?.reminders || ['Chưa có lịch sử nhắc nợ.']).map((item) => (
                <p key={item} className="rounded-xl border border-gray-300 bg-white p-3 text-sm font-semibold text-slate-600">{item}</p>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {activeTab === 'Khuyến mãi' ? (
        <>
          {renderCards([
            ['Voucher', formatCurrency(transaction.voucher)],
            ['Mã giảm giá', promotions[0]?.code],
            ['Học bổng', formatCurrency(transaction.scholarship)],
            ['Giảm học phí', formatCurrency(transaction.discount)],
            ['Chính sách ưu đãi', `${promotions[0]?.name}, ${vouchers[0]?.code}, ${scholarships[0]?.name}`],
          ])}
        </>
      ) : null}
    </section>
  )
}

export default FinanceDetail
