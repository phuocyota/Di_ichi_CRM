import { History, ReceiptText, X } from 'lucide-react'

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value || 0)

function FinanceTuitionDetailModal({ modal, tuition, payments, tuitionStatuses, onClose, onCollectPayment, onPrintReceipt }) {
  if (!modal || !tuition) return null

  const isHistory = modal === 'paymentHistory'
  const status = tuitionStatuses.find((item) => item.value === tuition.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[1px]">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-300 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              {isHistory ? 'Lịch sử thanh toán' : 'Chi tiết học phí'}
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{tuition.studentName} - {tuition.code}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{tuition.courseName}</p>
          </div>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-78px)] overflow-y-auto bg-slate-50 p-5">
          {!isHistory ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Tổng học phí', tuition.totalFee, 'text-slate-950'],
                  ['Giảm giá/khuyến mãi', tuition.discountTotal, 'text-amber-700'],
                  ['Đã thu', tuition.paid, 'text-emerald-700'],
                  ['Còn phải thu', tuition.remaining, 'text-red-700'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                    <p className={`mt-2 text-xl font-black ${color}`}>{formatCurrency(value)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                <div className="rounded-xl border border-blue-100 bg-white p-4">
                  <h3 className="text-base font-black text-slate-950">Thông tin khoản học phí</h3>
                  <div className="mt-3 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
                    <p>Mã học phí: <span className="font-black text-blue-700">{tuition.code}</span></p>
                    <p>Hạn thanh toán: <span className="font-black text-slate-950">{tuition.dueDate}</span></p>
                    <p>Học phí gốc: <span className="font-black text-slate-950">{formatCurrency(tuition.totalFee)}</span></p>
                    <p>Phải thu: <span className="font-black text-slate-950">{formatCurrency(tuition.payable)}</span></p>
                    <p>Giảm trực tiếp: <span className="font-black text-amber-700">{formatCurrency(tuition.discount)}</span></p>
                    <p>Học bổng: <span className="font-black text-amber-700">{formatCurrency(tuition.scholarship)}</span></p>
                    <p>Voucher: <span className="font-black text-amber-700">{formatCurrency(tuition.voucher)}</span></p>
                    <p>
                      Trạng thái:
                      <span className={`ml-2 rounded-full border px-3 py-1 text-xs font-black ${status?.badgeClass || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                        {status?.label || tuition.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-white p-4">
                  <h3 className="text-base font-black text-slate-950">Thao tác nhanh</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700" onClick={() => onCollectPayment(tuition)}>
                      <ReceiptText size={16} /> Thu tiền
                    </button>
                    <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={() => onPrintReceipt(payments[0])} disabled={!payments.length}>
                      <ReceiptText size={16} /> In phiếu gần nhất
                    </button>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    Khoản học phí hỗ trợ thu nhiều đợt. Mỗi lần thu sẽ tạo một phiếu thu riêng và tự cập nhật số tiền còn lại.
                  </p>
                </div>
              </div>
            </>
          ) : null}

          <div className={isHistory ? '' : 'mt-5'}>
            <div className="mb-3 flex items-center gap-2">
              <History size={18} className="text-blue-600" aria-hidden="true" />
              <h3 className="text-base font-black text-slate-950">Lịch sử thanh toán</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="bg-blue-600 text-xs font-black uppercase text-white">
                  <tr>
                    <th className="px-6 py-4">Số phiếu</th>
                    <th className="px-4 py-4">Số tiền</th>
                    <th className="px-4 py-4">Phương thức</th>
                    <th className="px-4 py-4">Ngày thu</th>
                    <th className="px-4 py-4">Người nộp</th>
                    <th className="px-4 py-4">Mã giao dịch</th>
                    <th className="px-4 py-4">Minh chứng</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.length ? payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-blue-50/50">
                      <td className="px-6 py-4 font-black text-blue-700">{payment.receiptNo}</td>
                      <td className="px-4 py-4 font-black text-slate-950">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{payment.methodName}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{payment.paidAt}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{payment.payer || '-'}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{payment.transactionCode || '-'}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{payment.proofName || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50" onClick={() => onPrintReceipt(payment)}>
                          In phiếu
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={8}>Chưa có lịch sử thanh toán.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceTuitionDetailModal
