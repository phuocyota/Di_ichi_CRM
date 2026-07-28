import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AlertTriangle, Upload, X } from 'lucide-react'

function StaffModal({ modal, config, staff, filters, onClose, onSubmit }) {
  const isOpen = Boolean(config)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    reset({
      code: staff?.code || '',
      name: staff?.name || '',
      type: staff?.type || '',
      position: staff?.position || '',
      specialty: staff?.specialty || '',
      department: staff?.department || '',
      phone: staff?.phone || '',
      email: staff?.email || '',
      statusValue: staff?.statusValue || '',
      startDate: staff?.startDate || '',
      birthDate: staff?.birthDate || '',
      gender: staff?.gender || '',
      citizenId: staff?.citizenId || '',
      address: staff?.address || '',
      major: staff?.major || '',
      degree: staff?.degree || '',
      experience: staff?.experience || '',
      languages: staff?.languages || '',
      skills: staff?.skills?.join(', ') || '',
      className: '',
      certificateTitle: '',
      certificateIssuer: '',
      issuedAt: '',
      expiresAt: '',
      messageTitle: '',
      messageContent: '',
      reason: '',
      file: '',
    })
  }, [modal, reset, staff])

  if (!isOpen) return null

  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const textareaClass = 'mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const labelClass = 'text-sm font-black text-slate-700'
  const required = (message) => ({ required: message })
  const renderError = (field) => errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field].message}</p> : null

  const renderStaffForm = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Mã nhân sự</span>
          <input className={inputClass} placeholder="Tự động nếu để trống" {...register('code')} />
        </label>
        <label className="block">
          <span className={labelClass}>Họ tên</span>
          <input className={inputClass} placeholder="Nhập họ tên" {...register('name', required('Vui lòng nhập họ tên'))} />
          {renderError('name')}
        </label>
        <label className="block">
          <span className={labelClass}>Loại nhân sự</span>
          <select className={inputClass} {...register('type', required('Vui lòng chọn loại nhân sự'))}>
            <option value="">Chọn loại nhân sự</option>
            {filters.types.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {renderError('type')}
        </label>
        <label className="block">
          <span className={labelClass}>Chức vụ</span>
          <select className={inputClass} {...register('position', required('Vui lòng chọn chức vụ'))}>
            <option value="">Chọn chức vụ</option>
            {filters.positions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Bộ phận</span>
          <select className={inputClass} {...register('department', required('Vui lòng chọn bộ phận'))}>
            <option value="">Chọn bộ phận</option>
            {filters.departments.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Chuyên môn</span>
          <select className={inputClass} {...register('specialty')}>
            <option value="">Chọn chuyên môn</option>
            {filters.specialties.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Số điện thoại</span>
          <input className={inputClass} placeholder="Nhập số điện thoại" {...register('phone')} />
        </label>
        <label className="block">
          <span className={labelClass}>Email</span>
          <input type="email" className={inputClass} placeholder="name@diichi.edu.vn" {...register('email')} />
        </label>
        <label className="block">
          <span className={labelClass}>Ngày vào làm</span>
          <input type="date" className={inputClass} {...register('startDate')} />
        </label>
        <label className="block">
          <span className={labelClass}>Trạng thái</span>
          <select className={inputClass} {...register('statusValue')}>
            <option value="">Chọn trạng thái</option>
            {filters.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Ngày sinh</span>
          <input type="date" className={inputClass} {...register('birthDate')} />
        </label>
        <label className="block">
          <span className={labelClass}>Giới tính</span>
          <select className={inputClass} {...register('gender')}>
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>CCCD</span>
          <input className={inputClass} placeholder="Nhập số CCCD" {...register('citizenId')} />
        </label>
        <label className="block">
          <span className={labelClass}>Trình độ</span>
          <input className={inputClass} placeholder="Cử nhân, Thạc sĩ, CELTA..." {...register('degree')} />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Địa chỉ</span>
        <input className={inputClass} placeholder="Nhập địa chỉ liên hệ" {...register('address')} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Chuyên ngành</span>
          <input className={inputClass} placeholder="Ngôn ngữ Anh, TESOL..." {...register('major')} />
        </label>
        <label className="block">
          <span className={labelClass}>Kinh nghiệm</span>
          <input className={inputClass} placeholder="Ví dụ: 5 năm" {...register('experience')} />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Ngoại ngữ</span>
        <input className={inputClass} placeholder="Tiếng Anh C1, Tiếng Nhật N4..." {...register('languages')} />
      </label>
      <label className="block">
        <span className={labelClass}>Kỹ năng</span>
        <textarea rows={3} className={textareaClass} placeholder="Nhập kỹ năng, phân tách bằng dấu phẩy" {...register('skills')} />
      </label>
    </div>
  )

  const renderBody = () => {
    if (config.intent === 'form') return renderStaffForm()

    if (config.intent === 'assign') {
      return (
        <label className="block">
          <span className={labelClass}>Lớp phân công</span>
          <input className={inputClass} placeholder="Nhập tên lớp cần phân công" {...register('className', required('Vui lòng nhập lớp phân công'))} />
          {renderError('className')}
        </label>
      )
    }

    if (config.intent === 'department') {
      return (
        <label className="block">
          <span className={labelClass}>Bộ phận mới</span>
          <select className={inputClass} {...register('department', required('Vui lòng chọn bộ phận'))}>
            <option value="">Chọn bộ phận</option>
            {filters.departments.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      )
    }

    if (config.intent === 'specialty') {
      return (
        <label className="block">
          <span className={labelClass}>Chuyên môn mới</span>
          <select className={inputClass} {...register('specialty', required('Vui lòng chọn chuyên môn'))}>
            <option value="">Chọn chuyên môn</option>
            {filters.specialties.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      )
    }

    if (config.intent === 'certificate') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={labelClass}>Tên chứng chỉ</span>
            <input className={inputClass} placeholder="IELTS, TESOL, CELTA..." {...register('certificateTitle', required('Vui lòng nhập tên chứng chỉ'))} />
          </label>
          <label className="block">
            <span className={labelClass}>Đơn vị cấp</span>
            <input className={inputClass} placeholder="Cambridge, British Council..." {...register('certificateIssuer')} />
          </label>
          <label className="block">
            <span className={labelClass}>Ngày cấp</span>
            <input type="date" className={inputClass} {...register('issuedAt')} />
          </label>
          <label className="block">
            <span className={labelClass}>Ngày hết hạn</span>
            <input className={inputClass} placeholder="Không thời hạn hoặc dd/mm/yyyy" {...register('expiresAt')} />
          </label>
        </div>
      )
    }

    if (config.intent === 'import') {
      return (
        <label className="block">
          <span className={labelClass}>File Excel</span>
          <input type="file" accept=".xlsx,.xls,.csv" className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold" {...register('file')} />
          <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500"><Upload size={14} /> Hỗ trợ .xlsx, .xls và .csv.</p>
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
            <textarea rows={5} className={textareaClass} placeholder="Nhập nội dung gửi cho nhân sự" {...register('messageContent')} />
          </label>
        </div>
      )
    }

    if (config.intent === 'danger') {
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            <p className="flex items-center gap-2 text-base font-black"><AlertTriangle size={18} /> Xác nhận xóa</p>
            <p className="mt-2">Bạn có chắc chắn muốn xóa nhân sự {staff?.name || 'đã chọn'}? Thao tác này chỉ cập nhật dữ liệu mẫu.</p>
          </div>
          <label className="block">
            <span className={labelClass}>Lý do</span>
            <textarea rows={4} className={textareaClass} placeholder="Nhập lý do xóa" {...register('reason')} />
          </label>
        </div>
      )
    }

    if (config.intent === 'export') {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">
          Xuất dữ liệu nhân sự theo bộ lọc hiện tại. Khi tích hợp API, thao tác này sẽ tải file thật.
        </div>
      )
    }

    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">
        Xác nhận thao tác cho {staff?.name || 'nhân sự đã chọn'}.
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[1px]">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-gray-300 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{config.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {staff?.name || 'Nhập thông tin nhân sự theo biểu mẫu.'}
            </p>
          </div>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50" aria-label="Đóng modal" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="max-h-[calc(92vh-88px)] space-y-5 overflow-y-auto bg-slate-50 p-5" onSubmit={handleSubmit((values) => onSubmit(modal, values, staff))}>
          {renderBody()}

          {config.intent !== 'danger' && config.intent !== 'form' ? (
            <label className="block">
              <span className={labelClass}>Ghi chú</span>
              <textarea rows={3} className={textareaClass} placeholder="Nhập ghi chú xử lý" {...register('reason')} />
            </label>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button type="button" className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={`h-11 rounded-xl px-4 text-sm font-bold text-white ${config.intent === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {config.submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StaffModal
