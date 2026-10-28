import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { X } from 'lucide-react'
import { getStudentSaleOptions } from '../../services/crmApi.js'

function toDateInputValue(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  const parts = value.split('/')
  if (parts.length !== 3) return ''

  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function StudentModal({
  modal,
  configs,
  selectedStudent,
  filters,
  directories,
  canAssignSale = false,
  onClose,
  onSubmit: submitModal,
}) {
  const isOpen = Boolean(modal)
  const [saleOptions, setSaleOptions] = useState([])
  const [salesLoading, setSalesLoading] = useState(false)
  const [salesError, setSalesError] = useState('')
  const [salesVersion, setSalesVersion] = useState(0)

  const config = configs[modal] || {
    title: 'Thao tác học viên',
    submitText: 'Xác nhận',
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
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
      assignedSaleUserId: '',
      statusValue: '',
      enrollmentDate: '',
      reason: '',
      file: '',
    },
  })

  useEffect(() => {
    const source = modal === 'add' ? null : selectedStudent
    reset({
      code: source?.code || '',
      name: source?.name || '',
      gender: source?.gender || '',
      birthDate: toDateInputValue(source?.birthDate),
      phone: source?.phone || '',
      parent: source?.parent || '',
      parentPhone: source?.parentPhone || '',
      courseId: source?.courseId || '',
      classId: source?.classId || '',
      teacherId: source?.teacherId || '',
      branchId: source?.branchId || '',
      assignedSaleUserId: source?.assignedSaleUserId || '',
      statusValue: source?.statusValue || '',
      enrollmentDate: toDateInputValue(source?.enrollmentDate),
      reason: '',
      file: '',
    })
  }, [reset, selectedStudent, modal])

  const branchId = useWatch({ control, name: 'branchId' })
  const assignedSaleUserId = useWatch({ control, name: 'assignedSaleUserId' })
  useEffect(() => {
    let cancelled = false
    setSaleOptions([])
    setSalesError('')
    setSalesLoading(false)
    if (!canAssignSale || !branchId || (modal !== 'add' && modal !== 'edit')) return
    setSalesLoading(true)
    getStudentSaleOptions(branchId)
      .then((items) => {
        if (!Array.isArray(items)) throw new Error('Danh sách Sale không đúng định dạng')
        if (!cancelled) setSaleOptions(items)
      })
      .catch((error) => { if (!cancelled) setSalesError(error.message) })
      .finally(() => { if (!cancelled) setSalesLoading(false) })
    return () => { cancelled = true }
  }, [branchId, canAssignSale, modal, salesVersion])

  if (!isOpen) {
    return null
  }

  const onSubmit = (values) => {
    return submitModal?.(modal, { ...values, assignedSaleUserId }, selectedStudent)
  }

  const isDelete = modal === 'delete'
  const isImport = modal === 'import'
  const isTransfer = modal === 'transfer'
  const isStudentForm = modal === 'add' || modal === 'edit'

  const requiredRule = (message, condition = modal === 'add') =>
    condition ? { required: message } : {}

  const labelClass = 'text-sm font-bold text-slate-700'

  const inputClass =
    'mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

  const renderRequired = () => (
    <span className="ml-1 text-red-600">*</span>
  )

  const renderError = (field) =>
    errors[field] ? (
      <span className="mt-1 block text-xs font-semibold text-red-600">
        {errors[field].message}
      </span>
    ) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              {config.title}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {selectedStudent && modal !== 'add'
                ? selectedStudent.name
                : 'Nhập thông tin theo biểu mẫu bên dưới.'}
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

        {/* Form */}
        <form
          className="max-h-[calc(92vh-92px)] space-y-4 overflow-y-auto p-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Delete */}
          {isDelete ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              Bạn có chắc chắn muốn xóa vĩnh viễn học viên{' '}
              {selectedStudent?.name || 'đã chọn'} và các dữ liệu liên quan?
            </div>
          ) : null}

          {/* Import */}
          {isImport ? (
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                File Excel
              </span>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
                {...register('file')}
              />
            </label>
          ) : null}

          {/* Student information */}
          {isStudentForm ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                  Thông tin học viên
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Các trường có dấu{' '}
                  <span className="text-red-600">*</span> là bắt buộc khi tạo
                  mới.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Code */}
                <label className="block">
                  <span className={labelClass}>Mã học viên</span>

                  <input
                    className={inputClass}
                    placeholder="Tự động nếu để trống"
                    {...register('code')}
                  />
                </label>

                {/* Name */}
                <label className="block">
                  <span className={labelClass}>
                    Họ tên{renderRequired()}
                  </span>

                  <input
                    className={inputClass}
                    placeholder="Nhập họ tên học viên"
                    {...register(
                      'name',
                      requiredRule('Vui lòng nhập họ tên'),
                    )}
                  />

                  {renderError('name')}
                </label>

                {/* Gender */}
                <label className="block">
                  <span className={labelClass}>Giới tính</span>

                  <select
                    className={inputClass}
                    {...register('gender')}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </label>

                {/* Birth date */}
                <label className="block">
                  <span className={labelClass}>Ngày sinh</span>

                  <input
                    type="date"
                    className={inputClass}
                    {...register('birthDate')}
                  />
                </label>

                {/* Phone */}
                <label className="block">
                  <span className={labelClass}>
                    Số điện thoại{renderRequired()}
                  </span>

                  <input
                    className={inputClass}
                    placeholder="Nhập số điện thoại"
                    {...register(
                      'phone',
                      requiredRule('Vui lòng nhập số điện thoại'),
                    )}
                  />

                  {renderError('phone')}
                </label>

                {/* Enrollment date */}
                <label className="block">
                  <span className={labelClass}>
                    Ngày nhập học{renderRequired()}
                  </span>

                  <input
                    type="date"
                    className={inputClass}
                    {...register(
                      'enrollmentDate',
                      requiredRule('Vui lòng nhập ngày nhập học'),
                    )}
                  />

                  {renderError('enrollmentDate')}
                </label>
              </div>

              {/* Parent information */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                  Phụ huynh và liên hệ
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Phụ huynh</span>

                  <input
                    className={inputClass}
                    placeholder="Tên phụ huynh"
                    {...register('parent')}
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>SĐT phụ huynh</span>

                  <input
                    className={inputClass}
                    placeholder="Số điện thoại phụ huynh"
                    {...register('parentPhone')}
                  />
                </label>
              </div>
            </div>
          ) : null}

          {/* Course / class / transfer / extend */}
          {isStudentForm || isTransfer || modal === 'extend' ? (
            <div className="space-y-4">
              {isStudentForm ? (
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                  Khóa học và trạng thái
                </h3>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Course */}
                <label className="block">
                  <span className={labelClass}>
                    Khóa học
                    {isStudentForm ? renderRequired() : null}
                  </span>

                  <select
                    className={inputClass}
                    {...register(
                      'courseId',
                      requiredRule(
                        'Vui lòng chọn khóa học',
                        modal === 'add',
                      ),
                    )}
                  >
                    <option value="">Chọn khóa học</option>

                    {directories?.courses?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {renderError('courseId')}
                </label>

                {/* Class */}
                <label className="block">
                  <span className={labelClass}>
                    Lớp học
                    {isStudentForm || isTransfer
                      ? renderRequired()
                      : null}
                  </span>

                  <select
                    className={inputClass}
                    {...register(
                      'classId',
                      requiredRule(
                        'Vui lòng chọn lớp học',
                        modal === 'add' || modal === 'transfer',
                      ),
                    )}
                  >
                    <option value="">Chọn lớp học</option>

                    {directories?.classes?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {renderError('classId')}
                </label>

                {/* Student-only fields */}
                {isStudentForm ? (
                  <>
                    {/* Teacher */}
                    <label className="block">
                      <span className={labelClass}>Giáo viên</span>

                      <select
                        className={inputClass}
                        {...register('teacherId')}
                      >
                        <option value="">Chọn giáo viên</option>

                        {directories?.teachers?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Branch */}
                    <label className="block">
                      <span className={labelClass}>
                        Cơ sở{renderRequired()}
                      </span>

                      <select
                        className={inputClass}
                        {...register(
                          'branchId',
                          { ...requiredRule('Vui lòng chọn cơ sở'), onChange: () => { setValue('assignedSaleUserId', ''); setSaleOptions([]) } },
                        )}
                      >
                        <option value="">Chọn cơ sở</option>

                        {directories?.branches?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>

                      {renderError('branchId')}
                    </label>

                    {canAssignSale ? (
                      <div>
                        <label className="block">
                          <span className={labelClass}>Sale phụ trách</span>
                          <select className={inputClass} disabled={!branchId || salesLoading || Boolean(salesError)} {...register('assignedSaleUserId')}>
                            <option value="">Chưa có Sale</option>
                            {assignedSaleUserId && !saleOptions.some((sale) => sale.userId === assignedSaleUserId) ? <option value={assignedSaleUserId}>Sale hiện tại</option> : null}
                            {saleOptions.map((sale) => <option key={sale.userId} value={sale.userId}>{sale.name}</option>)}
                          </select>
                        </label>
                        <p className="mt-1 text-xs text-slate-500">{!branchId ? 'Chọn cơ sở để xem danh sách Sale.' : salesLoading ? 'Đang tải danh sách Sale…' : 'Có thể để trống và gán Sale sau.'}</p>
                        {salesError ? <div role="alert" className="mt-1 text-xs text-red-600">{salesError} <button type="button" className="underline" onClick={() => setSalesVersion((value) => value + 1)}>Thử lại</button></div> : null}
                      </div>
                    ) : null}

                    {/* Status */}
                    <label className="block">
                      <span className={labelClass}>
                        Trạng thái{renderRequired()}
                      </span>

                      <select
                        className={inputClass}
                        {...register(
                          'statusValue',
                          requiredRule('Vui lòng chọn trạng thái'),
                        )}
                      >
                        <option value="">Chọn trạng thái</option>

                        {filters?.statuses?.map((item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>

                      {renderError('statusValue')}
                    </label>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Reason */}
          {!isImport && !isDelete ? (
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Ghi chú / Lý do
              </span>

              <textarea
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none"
                placeholder="Nhập nội dung xử lý"
                {...register('reason')}
              />
            </label>
          ) : null}

          {/* Footer */}
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
              disabled={isSubmitting || salesLoading}
              className={`h-11 rounded-xl px-4 text-sm font-bold text-white ${
                isDelete
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
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
