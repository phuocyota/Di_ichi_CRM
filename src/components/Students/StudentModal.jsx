import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'

function dateInputValue(value) {
  if (!value) return ''
  const isoDate = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (isoDate) return isoDate

  const parts = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : ''
}

function StudentModal({ modal, configs, selectedStudent, filters, directories, onClose, onSubmit: submitModal }) {
function toDateInputValue(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  const parts = value.split('/')
  if (parts.length !== 3) return ''

  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function StudentModal({ modal, configs, selectedStudent, filters, onClose, onSubmit: submitModal }) {
  const isOpen = Boolean(modal)
  const config = configs[modal] || { title: 'Thao tác học viên', submitText: 'Xác nhận' }
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: '',
      name: '',
      gender: '',
      birthDate: '',
      phone: '',
      parent: '',
      parentPhone: '',
      courseId: '',
      classId: '',
      teacherId: '',
      branchId: '',
      statusValue: '',
      enrollmentDate: '',
      reason: '',
      file: '',
    },
  })

  useEffect(() => {
    reset({
      code: selectedStudent?.code || '',
      name: selectedStudent?.name || '',
      gender: selectedStudent?.gender || '',
      birthDate: toDateInputValue(selectedStudent?.birthDate),
      phone: selectedStudent?.phone || '',
      parent: selectedStudent?.parent || '',
      parentPhone: selectedStudent?.parentPhone || '',
      courseId: selectedStudent?.courseId || '',
      classId: selectedStudent?.classId || '',
      teacherId: selectedStudent?.teacherId || '',
      branchId: selectedStudent?.branchId || '',
      statusValue: selectedStudent?.statusValue || '',
      enrollmentDate: toDateInputValue(selectedStudent?.enrollmentDate),
      reason: '',
      file: '',
    })
  }, [reset, selectedStudent, modal])

  if (!isOpen) {
    return null
  }

  const onSubmit = (values) => submitModal?.(modal, values, selectedStudent)

  const isDelete = modal === 'delete'
  const isImport = modal === 'import'
  const isTransfer = modal === 'transfer'
  const isStudentForm = modal === 'add' || modal === 'edit'
  const requiredRule = (message) => (modal === 'add' ? { required: message } : {})
  const labelClass = 'text-sm font-bold text-slate-700'
  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const renderRequired = () => <span className="ml-1 text-red-600">*</span>
  const renderError = (field) =>
    errors[field] ? <span className="mt-1 block text-xs font-semibold text-red-600">{errors[field].message}</span> : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-300 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{config.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {selectedStudent ? selectedStudent.name : 'Nhập thông tin theo biểu mẫu bên dưới.'}
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-slate-600"
            aria-label="Đóng modal"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="max-h-[calc(92vh-92px)] space-y-4 overflow-y-auto p-5" onSubmit={handleSubmit(onSubmit)}>
          {isDelete ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              Bạn có chắc chắn muốn xóa vĩnh viễn học viên {selectedStudent?.name || 'đã chọn'} và các dữ liệu liên quan?
            </div>
          ) : null}

          {isImport ? (
            <label className="block">
              <span className="text-sm font-bold text-slate-700">File Excel</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
                {...register('file')}
              />
            </label>
          ) : null}

          {isStudentForm ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                  Thông tin học viên
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Các trường có dấu <span className="text-red-600">*</span> là bắt buộc khi tạo mới.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Mã học viên</span>
                  <input className={inputClass} placeholder="Tự động nếu để trống" {...register('code')} />
                </label>
                <label className="block">
                  <span className={labelClass}>Họ tên{renderRequired()}</span>
                  <input
                    className={inputClass}
                    placeholder="Nhập họ tên học viên"
                    {...register('name', requiredRule('Vui lòng nhập họ tên'))}
                  />
                  {renderError('name')}
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
                  <span className={labelClass}>Ngày sinh</span>
                  <input type="date" className={inputClass} {...register('birthDate')} />
                </label>
                <label className="block">
                  <span className={labelClass}>Số điện thoại{renderRequired()}</span>
                  <input
                    className={inputClass}
                    placeholder="Nhập số điện thoại"
                    {...register('phone', requiredRule('Vui lòng nhập số điện thoại'))}
                  />
                  {renderError('phone')}
                </label>
                <label className="block">
                  <span className={labelClass}>Ngày nhập học{renderRequired()}</span>
                  <input
                    type="date"
                    className={inputClass}
                    {...register('enrollmentDate', requiredRule('Vui lòng nhập ngày nhập học'))}
                  />
                  {renderError('enrollmentDate')}
                </label>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                  Phụ huynh và liên hệ
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Phụ huynh</span>
                  <input className={inputClass} placeholder="Tên phụ huynh" {...register('parent')} />
                </label>
                <label className="block">
                  <span className={labelClass}>SĐT phụ huynh</span>
                  <input className={inputClass} placeholder="Số điện thoại phụ huynh" {...register('parentPhone')} />
                </label>
              </div>
            </div>
          ) : null}

          {isStudentForm || isTransfer || modal === 'extend' ? (
            <div className="space-y-4">
              {isStudentForm ? (
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                  Khóa học và trạng thái
                </h3>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Khóa học{isStudentForm ? renderRequired() : null}</span>
                  <select
                    className={inputClass}
                    {...register('courseId', isStudentForm ? requiredRule('Vui lòng chọn khóa học') : {})}
                  >
                    <option value="">Chọn khóa học</option>
                    {directories.courses.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  {renderError('courseId')}
                </label>
                <label className="block">
                  <span className={labelClass}>Lớp học{isStudentForm || isTransfer ? renderRequired() : null}</span>
                  <select
                    className={inputClass}
                    {...register('classId', isStudentForm || isTransfer ? requiredRule('Vui lòng chọn lớp học') : {})}
                  >
                    <option value="">Chọn lớp học</option>
                    {directories.classes.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  {renderError('classId')}
                </label>
                {isStudentForm ? (
                  <>
                    <label className="block">
                      <span className={labelClass}>Giáo viên</span>
                      <select className={inputClass} {...register('teacherId')}>
                        <option value="">Chọn giáo viên</option>
                        {directories.teachers.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className={labelClass}>Cơ sở{renderRequired()}</span>
                      <select className={inputClass} {...register('branchId', requiredRule('Vui lòng chọn cơ sở'))}>
                        <option value="">Chọn cơ sở</option>
                        {directories.branches.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      {renderError('branchId')}
                    </label>
                    <label className="block">
                      <span className={labelClass}>Trạng thái{renderRequired()}</span>
                      <select
                        className={inputClass}
                        {...register('statusValue', requiredRule('Vui lòng chọn trạng thái'))}
                      >
                        <option value="">Chọn trạng thái</option>
                        {filters.statuses.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                      {renderError('statusValue')}
                    </label>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {!isImport && !isDelete ? (
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Ghi chú / Lý do</span>
              <textarea
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none"
                placeholder="Nhập nội dung xử lý"
                {...register('reason')}
              />
            </label>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-bold text-slate-700"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`h-11 rounded-xl px-4 text-sm font-bold text-white ${isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {config.submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentModal
