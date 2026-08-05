import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Download, FileDown, FileSpreadsheet, Printer, Send, SlidersHorizontal, X } from 'lucide-react'

function valueText(value, key) {
  if (typeof value === 'number' && ['revenue', 'cost', 'profit', 'debt', 'collected', 'uncollected'].includes(key)) return `${value.toLocaleString('vi-VN')} đ`
  if (typeof value === 'number' && /rate|conversion|progress|kpi|completion/i.test(key)) return `${value}%`
  return value || '-'
}

function ReportFilterModal({ modal, report, selectedRow, filters, options, onApplyFilters, onClose, onExportExcel, onExportPdf, onPrint, onShare }) {
  const isOpen = Boolean(modal)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (modal === 'filter') reset(filters)
    if (modal === 'share') reset({ email: '', note: '', permission: 'view' })
  }, [filters, modal, reset])

  if (!isOpen) return null

  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const textareaClass = 'mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const labelClass = 'text-sm font-black text-slate-700'
  const renderError = (field) => errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field].message}</p> : null

  const titleMap = {
    filter: 'Bộ lọc nâng cao',
    detail: 'Chi tiết báo cáo',
    export: 'Xuất báo cáo',
    share: 'Chia sẻ báo cáo',
  }

  const handleFilterSubmit = (values) => {
    onApplyFilters(values)
    onClose()
  }

  const renderFilter = () => (
    <form className="space-y-5" onSubmit={handleSubmit(handleFilterSubmit)}>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className={labelClass}>Chu kỳ</span>
          <select className={inputClass} {...register('period')}>
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
            <option value="quarter">Quý</option>
            <option value="year">Năm</option>
            <option value="range">Khoảng thời gian</option>
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Từ ngày</span>
          <input type="date" className={inputClass} {...register('fromDate')} />
        </label>
        <label className="block">
          <span className={labelClass}>Đến ngày</span>
          <input type="date" className={inputClass} {...register('toDate')} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['branch', 'Cơ sở', options.branches],
          ['course', 'Khóa học', options.courses],
          ['className', 'Lớp học', options.classes],
          ['teacher', 'Giáo viên', options.teachers],
          ['staff', 'Nhân viên tuyển sinh', options.staffs],
          ['status', 'Trạng thái', options.statuses],
        ].map(([name, label, values]) => (
          <label key={name} className="block">
            <span className={labelClass}>{label}</span>
            <select className={inputClass} {...register(name)}>
              <option value="">Tất cả</option>
              {values.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100" onClick={() => reset({ period: 'month', fromDate: '', toDate: '', branch: '', course: '', className: '', teacher: '', staff: '', status: '' })}>Đặt lại</button>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">
          <SlidersHorizontal size={18} aria-hidden="true" />
          Áp dụng lọc
        </button>
      </div>
    </form>
  )

  const renderDetail = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-700">{report?.label || 'Dashboard báo cáo'}</p>
        <h3 className="mt-1 text-xl font-black text-slate-950">{selectedRow?.className || selectedRow?.branch || selectedRow?.id}</h3>
        <p className="mt-2 text-sm font-semibold text-slate-600">So sánh nhanh với kỳ trước và trạng thái hiện tại của bản ghi được chọn.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(selectedRow || {}).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">{key}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{valueText(value, key)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100" onClick={onClose}>Đóng</button>
        <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700" onClick={onPrint}>
          <Printer size={18} aria-hidden="true" />
          In chi tiết
        </button>
      </div>
    </div>
  )

  const renderExport = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-300 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
        Chọn định dạng xuất báo cáo theo bộ lọc hiện tại. File sẽ được tạo trực tiếp từ dữ liệu mẫu trong hệ thống.
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <button type="button" className="inline-flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700" onClick={onExportExcel}>
          <FileSpreadsheet size={24} aria-hidden="true" />
          Export Excel
        </button>
        <button type="button" className="inline-flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-black text-red-700" onClick={onExportPdf}>
          <FileDown size={24} aria-hidden="true" />
          Export PDF
        </button>
        <button type="button" className="inline-flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-black text-blue-700" onClick={onPrint}>
          <Printer size={24} aria-hidden="true" />
          In báo cáo
        </button>
      </div>
    </div>
  )

  const renderShare = () => (
    <form className="space-y-4" onSubmit={handleSubmit(onShare)}>
      <label className="block">
        <span className={labelClass}>Email người nhận</span>
        <input type="email" className={inputClass} placeholder="ceo@diichi.edu.vn" {...register('email', { required: 'Vui lòng nhập email người nhận' })} />
        {renderError('email')}
      </label>
      <label className="block">
        <span className={labelClass}>Quyền truy cập</span>
        <select className={inputClass} {...register('permission')}>
          <option value="view">Chỉ xem</option>
          <option value="comment">Xem và ghi chú</option>
          <option value="download">Xem và tải xuống</option>
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Lời nhắn</span>
        <textarea rows={4} className={textareaClass} placeholder="Gửi báo cáo tháng này cho Ban giám đốc..." {...register('note')} />
      </label>
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100" onClick={onClose}>Hủy</button>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">
          <Send size={18} aria-hidden="true" />
          Chia sẻ
        </button>
      </div>
    </form>
  )

  const body = modal === 'filter' ? renderFilter() : modal === 'detail' ? renderDetail() : modal === 'export' ? renderExport() : renderShare()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[1px]">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-gray-300 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{titleMap[modal]}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Phân tích nhanh, lọc sâu và xuất dữ liệu phục vụ điều hành.</p>
          </div>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50" aria-label="Đóng modal" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-88px)] overflow-y-auto bg-slate-50 p-5">
          {body}
          {modal === 'export' ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-300 bg-white p-3 text-xs font-bold text-slate-500">
              <Download size={16} aria-hidden="true" />
              Dữ liệu xuất theo trạng thái bảng hiện tại.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ReportFilterModal
