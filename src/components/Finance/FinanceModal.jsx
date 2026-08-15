import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, X } from 'lucide-react'

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value || 0)

function FinanceModal({ modal, tuition, paymentMethods, collectors, onClose, onSubmit }) {
  const isOpen = modal === 'collectPayment'
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    reset({
      amount: tuition?.remaining > 0 ? tuition.remaining : '',
      method: 'transfer',
      paidAt: '2026-08-13',
      collectorId: collectors[0]?.id || '',
      payer: '',
      transactionCode: '',
      proof: '',
      note: '',
    })
  }, [collectors, reset, tuition])

  if (!isOpen) return null

  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const textareaClass = 'mt-2 min-h-24 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const labelClass = 'text-sm font-black text-slate-700'
  const required = (message) => ({ required: message })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[1px]">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-gray-300 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">Thu học phí</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {tuition ? `${tuition.studentName} - còn lại ${formatCurrency(tuition.remaining)}` : 'Chọn khoản học phí để thu tiền.'}
            </p>
          </div>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="max-h-[calc(92vh-78px)] space-y-5 overflow-y-auto bg-slate-50 p-5" onSubmit={handleSubmit(onSubmit)}>
          {tuition ? (
            <div className="grid gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-blue-800 md:grid-cols-2">
              <p>Mã học viên: {tuition.studentCode}</p>
              <p>Học viên: {tuition.studentName}</p>
              <p>Lớp học: {tuition.className || '-'}</p>
              <p>Mã HP: {tuition.code}</p>
              <p>Khóa học: {tuition.courseName}</p>
              <p>Tổng học phí: {formatCurrency(tuition.totalFee)}</p>
              <p>Ưu đãi: {formatCurrency(tuition.discountTotal)}</p>
              <p>Đã thu: {formatCurrency(tuition.paid)}</p>
              <p>Còn lại: {formatCurrency(tuition.remaining)}</p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Số tiền thu đợt này</span>
              <input type="number" min="1" className={inputClass} {...register('amount', required('Vui lòng nhập số tiền'))} />
              {errors.amount ? <p className="mt-1 text-xs font-bold text-red-600">{errors.amount.message}</p> : null}
            </label>
            <label className="block">
              <span className={labelClass}>Phương thức</span>
              <select className={inputClass} {...register('method', required('Vui lòng chọn phương thức'))}>
                {paymentMethods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Ngày thu</span>
              <input type="date" className={inputClass} {...register('paidAt', required('Vui lòng chọn ngày thu'))} />
            </label>
            <label className="block">
              <span className={labelClass}>Thu ngân</span>
              <select className={inputClass} {...register('collectorId', required('Vui lòng chọn thu ngân'))}>
                {collectors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Người nộp</span>
              <input className={inputClass} placeholder="Ví dụ: Phạm Thu Hương" {...register('payer', required('Vui lòng nhập người nộp'))} />
              {errors.payer ? <p className="mt-1 text-xs font-bold text-red-600">{errors.payer.message}</p> : null}
            </label>
            <label className="block">
              <span className={labelClass}>Mã giao dịch</span>
              <input className={inputClass} placeholder="Ví dụ: VCB250813001" {...register('transactionCode')} />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Minh chứng chuyển khoản</span>
            <div className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-white px-3 py-3 text-sm font-bold text-slate-600">
              <Upload size={18} className="text-blue-600" aria-hidden="true" />
              <input type="file" className="w-full text-sm" accept="image/*,.pdf" {...register('proof')} />
            </div>
          </label>

          <label className="block">
            <span className={labelClass}>Ghi chú</span>
            <textarea className={textareaClass} placeholder="Ví dụ: Thu đợt 2, phụ huynh hẹn thanh toán phần còn lại cuối tháng." {...register('note')} />
          </label>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            Hệ thống hỗ trợ thanh toán nhiều đợt. Số tiền đợt này sẽ được cộng vào lịch sử thanh toán và tự tính lại phần còn nợ.
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button type="button" className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100" onClick={onClose}>Hủy</button>
            <button type="submit" className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">Ghi nhận thu tiền</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FinanceModal
