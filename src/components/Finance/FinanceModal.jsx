import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AlertTriangle, QrCode, X } from 'lucide-react'

function FinanceModal({ modal, config, transaction, filters, promotions, vouchers, scholarships, onClose, onSubmit }) {
  const isOpen = Boolean(config)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    reset({
      student: transaction?.student || '',
      course: transaction?.course || '',
      className: transaction?.className || '',
      amount: transaction?.debt || transaction?.payable || '',
      methodValue: transaction?.methodValue || '',
      paidAt: transaction?.paidAt || '',
      dueDate: transaction?.dueDate || '',
      voucherCode: '',
      promotionCode: '',
      scholarshipId: '',
      discountAmount: '',
      refundAmount: '',
      messageTitle: '',
      messageContent: '',
      reason: '',
    })
  }, [modal, reset, transaction])

  if (!isOpen) return null

  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const textareaClass = 'mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const labelClass = 'text-sm font-black text-slate-700'
  const required = (message) => ({ required: message })
  const renderError = (field) => errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field].message}</p> : null

  const renderPaymentForm = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className={labelClass}>Học viên</span>
        <select className={inputClass} {...register('student', required('Vui lòng chọn học viên'))}>
          <option value="">Chọn học viên</option>
          {filters.students.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        {renderError('student')}
      </label>
      <label className="block">
        <span className={labelClass}>Khóa học</span>
        <select className={inputClass} {...register('course')}>
          <option value="">Chọn khóa học</option>
          {filters.courses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Lớp học</span>
        <select className={inputClass} {...register('className')}>
          <option value="">Chọn lớp học</option>
          {filters.classes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Số tiền</span>
        <input type="number" className={inputClass} placeholder="Nhập số tiền thu" {...register('amount', required('Vui lòng nhập số tiền'))} />
        {renderError('amount')}
      </label>
      <label className="block">
        <span className={labelClass}>Phương thức thanh toán</span>
        <select className={inputClass} {...register('methodValue')}>
          <option value="">Chọn phương thức</option>
          {filters.paymentMethods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Ngày thanh toán</span>
        <input type="date" className={inputClass} {...register('paidAt')} />
      </label>
    </div>
  )

  const renderBody = () => {
    if (['payment', 'receipt'].includes(config.intent)) return renderPaymentForm()

    if (config.intent === 'debt' || config.intent === 'extend') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Số tiền công nợ</span>
            <input type="number" className={inputClass} placeholder="Nhập số tiền còn nợ" {...register('amount')} />
          </label>
          <label className="block">
            <span className={labelClass}>Hạn thanh toán</span>
            <input type="date" className={inputClass} {...register('dueDate', required('Vui lòng chọn hạn thanh toán'))} />
            {renderError('dueDate')}
          </label>
        </div>
      )
    }

    if (config.intent === 'voucher') {
      return (
        <label className="block">
          <span className={labelClass}>Voucher</span>
          <select className={inputClass} {...register('voucherCode', required('Vui lòng chọn voucher'))}>
            <option value="">Chọn voucher</option>
            {vouchers.map((item) => <option key={item.id} value={item.code}>{item.code} - {item.value.toLocaleString('vi-VN')} đ</option>)}
          </select>
          {renderError('voucherCode')}
        </label>
      )
    }

    if (config.intent === 'promotion') {
      return (
        <label className="block">
          <span className={labelClass}>Khuyến mãi</span>
          <select className={inputClass} {...register('promotionCode', required('Vui lòng chọn khuyến mãi'))}>
            <option value="">Chọn khuyến mãi</option>
            {promotions.map((item) => <option key={item.id} value={item.code}>{item.name} - {item.code}</option>)}
          </select>
        </label>
      )
    }

    if (config.intent === 'scholarship') {
      return (
        <label className="block">
          <span className={labelClass}>Học bổng</span>
          <select className={inputClass} {...register('scholarshipId', required('Vui lòng chọn học bổng'))}>
            <option value="">Chọn học bổng</option>
            {scholarships.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.value.toLocaleString('vi-VN')} đ</option>)}
          </select>
        </label>
      )
    }

    if (config.intent === 'discount' || config.intent === 'refund') {
      return (
        <label className="block">
          <span className={labelClass}>{config.intent === 'refund' ? 'Số tiền hoàn' : 'Số tiền giảm'}</span>
          <input type="number" className={inputClass} placeholder="Nhập số tiền" {...register(config.intent === 'refund' ? 'refundAmount' : 'discountAmount', required('Vui lòng nhập số tiền'))} />
        </label>
      )
    }

    if (config.intent === 'message') {
      return (
        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>Tiêu đề</span>
            <input className={inputClass} placeholder="Nhập tiêu đề" {...register('messageTitle', required('Vui lòng nhập tiêu đề'))} />
          </label>
          <label className="block">
            <span className={labelClass}>Nội dung</span>
            <textarea rows={5} className={textareaClass} placeholder="Nhập nội dung gửi học viên/phụ huynh" {...register('messageContent')} />
          </label>
        </div>
      )
    }

    if (config.intent === 'danger') {
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            <p className="flex items-center gap-2 text-base font-black"><AlertTriangle size={18} /> Xác nhận hủy phiếu thu</p>
            <p className="mt-2">Bạn có chắc chắn muốn hủy phiếu thu của giao dịch {transaction?.code || 'đã chọn'}?</p>
          </div>
          <label className="block">
            <span className={labelClass}>Lý do</span>
            <textarea rows={4} className={textareaClass} placeholder="Nhập lý do hủy phiếu thu" {...register('reason')} />
          </label>
        </div>
      )
    }

    if (config.intent === 'export') {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">
          Xuất dữ liệu theo bộ lọc hiện tại. Khi tích hợp API, thao tác này sẽ tải file thật.
        </div>
      )
    }

    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">
        {modal === 'qrPayment' ? (
          <p className="flex items-center gap-2"><QrCode size={18} /> Tạo mã QR thanh toán cho giao dịch đã chọn.</p>
        ) : 'Xác nhận thao tác tài chính.'}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[1px]">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-gray-300 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{config.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{transaction?.student || 'Nhập thông tin tài chính theo biểu mẫu.'}</p>
          </div>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50" aria-label="Đóng modal" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="max-h-[calc(92vh-88px)] space-y-5 overflow-y-auto bg-slate-50 p-5" onSubmit={handleSubmit((values) => onSubmit(modal, values, transaction))}>
          {renderBody()}

          {!['danger', 'message'].includes(config.intent) ? (
            <label className="block">
              <span className={labelClass}>Ghi chú</span>
              <textarea rows={3} className={textareaClass} placeholder="Nhập ghi chú xử lý" {...register('reason')} />
            </label>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button type="button" className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100" onClick={onClose}>Hủy</button>
            <button type="submit" className={`h-11 rounded-xl px-4 text-sm font-bold text-white ${config.intent === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{config.submitText}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FinanceModal
