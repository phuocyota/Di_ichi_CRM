import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'

const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const scheduleDayMap = {
  T2: 'Thứ 2',
  T3: 'Thứ 3',
  T4: 'Thứ 4',
  T5: 'Thứ 5',
  T6: 'Thứ 6',
  T7: 'Thứ 7',
  CN: 'Chủ nhật',
}

function toDateInputValue(value) {
  if (!value) return ''
  const parts = value.split('/')

  if (parts.length !== 3) return value

  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function addHours(time, hours) {
  if (!time) return ''
  const [hour, minute] = time.split(':').map(Number)
  const nextHour = (hour + hours).toString().padStart(2, '0')

  return `${nextHour}:${minute.toString().padStart(2, '0')}`
}

function parseSchedule(schedule) {
  if (!schedule) {
    return {
      scheduleDays: [],
      startTime: '',
      endTime: '',
    }
  }

  const [rawDays = '', rawStartTime = ''] = schedule.split(' ')
  const scheduleDays = rawDays
    .split('-')
    .map((day) => scheduleDayMap[day])
    .filter(Boolean)
  const startTime = rawStartTime || ''

  return {
    scheduleDays,
    startTime,
    endTime: addHours(startTime, 2),
  }
}

function ClassModal({ modal, configs, selectedClass, filters, onClose, onSubmit: submitModal }) {
  const isOpen = Boolean(modal)
  const config = configs[modal] || { title: 'Thao tác lớp học', submitText: 'Xác nhận' }
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      code: '',
      name: '',
      course: '',
      teacher: '',
      room: '',
      branch: '',
      currentSize: '',
      maxSize: '',
      scheduleDays: [],
      startTime: '',
      endTime: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  useEffect(() => {
    const parsedSchedule = parseSchedule(selectedClass?.schedule)

    reset({
      code: selectedClass?.code || '',
      name: selectedClass?.name || '',
      course: selectedClass?.course || '',
      teacher: selectedClass?.teacher || '',
      room: selectedClass?.room || '',
      branch: selectedClass?.branch || '',
      currentSize: selectedClass?.currentSize || '',
      maxSize: selectedClass?.maxSize || '',
      scheduleDays: parsedSchedule.scheduleDays,
      startTime: parsedSchedule.startTime,
      endTime: parsedSchedule.endTime,
      startDate: toDateInputValue(selectedClass?.startDate),
      endDate: toDateInputValue(selectedClass?.endDate),
      reason: '',
    })
  }, [modal, reset, selectedClass])

  if (!isOpen) return null

  const isDelete = modal === 'delete'
  const isClassForm = modal === 'create' || modal === 'edit'
  const isTeacherAction = modal === 'assignTeacher'
  const isRoomAction = modal === 'changeRoom'
  const isTransfer = modal === 'transfer' || modal === 'merge'
  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const labelClass = 'text-sm font-bold text-slate-700'
  const required = (message) => ({ required: message })
  const star = <span className="ml-1 text-red-600">*</span>

  const onSubmit = (values) => submitModal?.(modal, values, selectedClass)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-300 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{config.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{selectedClass?.name || 'Nhập thông tin lớp học.'}</p>
          </div>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-slate-600" aria-label="Đóng modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="max-h-[calc(92vh-92px)] space-y-4 overflow-y-auto p-5" onSubmit={handleSubmit(onSubmit)}>
          {isDelete ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              Bạn có chắc chắn muốn xóa vĩnh viễn lớp {selectedClass?.name || 'đã chọn'} và các dữ liệu liên quan?
            </div>
          ) : null}

          {isClassForm ? (
            <>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Thông tin lớp</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">Các trường có dấu <span className="text-red-600">*</span> là bắt buộc.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Mã lớp</span>
                  <input className={inputClass} placeholder="Tự động nếu để trống" {...register('code')} />
                </label>
                <label className="block">
                  <span className={labelClass}>Tên lớp{star}</span>
                  <input className={inputClass} {...register('name', required('Vui lòng nhập tên lớp'))} />
                  {errors.name ? <span className="mt-1 block text-xs font-semibold text-red-600">{errors.name.message}</span> : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Khóa học{star}</span>
                  <select className={inputClass} {...register('course', required('Vui lòng chọn khóa học'))}>
                    <option value="">Chọn khóa học</option>
                    {filters.courses.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Giáo viên{star}</span>
                  <select className={inputClass} {...register('teacher', required('Vui lòng chọn giáo viên'))}>
                    <option value="">Chọn giáo viên</option>
                    {filters.teachers.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Phòng học{star}</span>
                  <select className={inputClass} {...register('room', required('Vui lòng chọn phòng học'))}>
                    <option value="">Chọn phòng học</option>
                    {filters.rooms.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Cơ sở</span>
                  <select className={inputClass} {...register('branch')}>
                    <option value="">Chọn cơ sở</option>
                    {filters.branches.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Sĩ số hiện tại</span>
                  <input className={inputClass} {...register('currentSize')} />
                </label>
                <label className="block">
                  <span className={labelClass}>Sĩ số tối đa{star}</span>
                  <input className={inputClass} {...register('maxSize', required('Vui lòng nhập sĩ số tối đa'))} />
                </label>
                <div className="md:col-span-2">
                  <span className={labelClass}>Thứ học{star}</span>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {weekDays.map((day) => (
                      <label
                        key={day}
                        className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700"
                      >
                        <input
                          type="checkbox"
                          value={day}
                          {...register('scheduleDays', required('Vui lòng chọn ít nhất một thứ học'))}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                  {errors.scheduleDays ? (
                    <span className="mt-1 block text-xs font-semibold text-red-600">
                      {errors.scheduleDays.message}
                    </span>
                  ) : null}
                </div>
                <label className="block">
                  <span className={labelClass}>Giờ bắt đầu{star}</span>
                  <input
                    type="time"
                    className={inputClass}
                    {...register('startTime', required('Vui lòng chọn giờ bắt đầu'))}
                  />
                  {errors.startTime ? <span className="mt-1 block text-xs font-semibold text-red-600">{errors.startTime.message}</span> : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Giờ kết thúc{star}</span>
                  <input
                    type="time"
                    className={inputClass}
                    {...register('endTime', required('Vui lòng chọn giờ kết thúc'))}
                  />
                  {errors.endTime ? <span className="mt-1 block text-xs font-semibold text-red-600">{errors.endTime.message}</span> : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Ngày khai giảng{star}</span>
                  <input type="date" className={inputClass} {...register('startDate', required('Vui lòng chọn ngày khai giảng'))} />
                  {errors.startDate ? <span className="mt-1 block text-xs font-semibold text-red-600">{errors.startDate.message}</span> : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Ngày kết thúc</span>
                  <input type="date" className={inputClass} {...register('endDate')} />
                </label>
              </div>
            </>
          ) : null}

          {isTeacherAction || isRoomAction || isTransfer ? (
            <div className="grid gap-4 md:grid-cols-2">
              {isTeacherAction ? (
                <label className="block">
                  <span className={labelClass}>Giáo viên</span>
                  <select className={inputClass} {...register('teacher')}>
                    <option value="">Chọn giáo viên</option>
                    {filters.teachers.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              ) : null}
              {isRoomAction ? (
                <label className="block">
                  <span className={labelClass}>Phòng học</span>
                  <select className={inputClass} {...register('room')}>
                    <option value="">Chọn phòng học</option>
                    {filters.rooms.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              ) : null}
              {isTransfer ? (
                <label className="block">
                  <span className={labelClass}>Lớp đích</span>
                  <input className={inputClass} placeholder="Nhập lớp cần ghép/chuyển" {...register('targetClass')} />
                </label>
              ) : null}
            </div>
          ) : null}

          {!isDelete ? (
            <label className="block">
              <span className={labelClass}>Ghi chú</span>
              <textarea rows={4} className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none" placeholder="Nhập nội dung xử lý" {...register('reason')} />
            </label>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button type="button" className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-bold text-slate-700" onClick={onClose}>Hủy</button>
            <button type="submit" className={`h-11 rounded-xl px-4 text-sm font-bold text-white ${isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {config.submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassModal
