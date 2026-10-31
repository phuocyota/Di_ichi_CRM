import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { AlertTriangle, CalendarClock, X } from 'lucide-react'

function ScheduleModal({
  modal,
  event,
  configs,
  filters,
  classes,
  teachers,
  classrooms,
  branches,
  onClose,
  onSubmit,
}) {
  const config = configs[modal]
  const isOpen = Boolean(config)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const selectedClassName = watch('className')

  useEffect(() => {
    const isEditing = Boolean(event?.id)

    reset({
      className: isEditing ? event?.classId || '' : '',
      course: isEditing ? event?.course || '' : '',
      teacher: isEditing ? event?.teacherId || '' : '',
      room: isEditing ? event?.roomId || '' : '',
      branch: isEditing ? event?.branchId || '' : '',
      date: event?.start ? dayjs(event.start).format('YYYY-MM-DD') : '',
      startTime: event?.start ? dayjs(event.start).format('HH:mm') : '',
      endTime: event?.end ? dayjs(event.end).format('HH:mm') : '',
      status: isEditing ? event?.status || '' : '',
      repeatWeeks: 4,
      homeworkTitle: isEditing ? event?.homework?.[0]?.title || '' : '',
      homeworkDeadline: isEditing ? event?.homework?.[0]?.deadline || '' : '',
      notifyTitle: isEditing ? `Thông báo lịch học ${event?.className || ''}`.trim() : '',
      notifyContent: '',
      exportFormat: 'Excel',
      repeatFullCourse: false,
      reason: '',
    })
  }, [classrooms, classes, event, modal, reset, teachers])

  useEffect(() => {
    if (!selectedClassName || !['create', 'edit', 'makeup', 'recurring'].includes(modal)) return

    const selectedClass = classes.find((item) => item.id === selectedClassName)
    if (!selectedClass) return

    setValue('course', selectedClass.course || '')
    setValue('teacher', selectedClass.teacherId || '')
    setValue('room', selectedClass.roomId || '')
    setValue('branch', selectedClass.branchId || '')
  }, [classes, modal, selectedClassName, setValue])

  if (!isOpen) return null

  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const textareaClass = 'mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const labelClass = 'text-sm font-semibold text-slate-700'
  const required = (message) => ({ required: message })
  const renderError = (field) => errors[field] ? <p className="mt-1 text-xs font-semibold text-red-600">{errors[field].message}</p> : null

  const submitForm = (values) => {
    onSubmit(modal, values, event)
  }

  const renderTimeFields = () => (
    <>
      <label className="block">
        <span className={labelClass}>Ngày học</span>
        <input type="date" className={inputClass} {...register('date', required('Vui lòng chọn ngày học'))} />
        {renderError('date')}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>Giờ bắt đầu</span>
          <input type="time" className={inputClass} {...register('startTime', required('Vui lòng chọn giờ bắt đầu'))} />
        </label>
        <label className="block">
          <span className={labelClass}>Giờ kết thúc</span>
          <input type="time" className={inputClass} {...register('endTime', required('Vui lòng chọn giờ kết thúc'))} />
        </label>
      </div>
    </>
  )

  const renderMainForm = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className={labelClass}>Lớp học</span>
        <select className={inputClass} {...register('className', required('Vui lòng chọn lớp học'))}>
          <option value="">Chọn lớp học</option>
          {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        {renderError('className')}
      </label>
      <label className="block">
        <span className={labelClass}>Khóa học</span>
        <input className={inputClass} readOnly {...register('course')} />
      </label>
      <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
        Chọn lớp học để tự đồng bộ khóa học, giáo viên, phòng học và cơ sở từ module Khóa học.
      </div>
      <label className="block">
        <span className={labelClass}>Giáo viên</span>
        <select className={inputClass} {...register('teacher', required('Vui lòng chọn giáo viên'))}>
          <option value="">Chọn giáo viên</option>
          {teachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Phòng học</span>
        <select className={inputClass} {...register('room', required('Vui lòng chọn phòng học'))}>
          <option value="">Chọn phòng học</option>
          {classrooms.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.branch}</option>)}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Cơ sở</span>
        <select className={inputClass} {...register('branch')}>
          <option value="">Chọn cơ sở</option>
          {branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Trạng thái</span>
        <select className={inputClass} {...register('status', required('Vui lòng chọn trạng thái'))}>
          <option value="">Chọn trạng thái</option>
          {filters.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      {renderTimeFields()}
      {watch('repeatFullCourse') && <label className="block text-sm font-semibold">Số buổi toàn khóa<input type="number" min="1" max="104" className={inputClass} {...register('totalSessions', { required: 'Nhập số buổi', min: 1, max: 104 })} />{renderError('totalSessions')}</label>}
      {watch('repeatFullCourse') && <label className="block text-sm font-semibold">Số buổi toàn khóa<input type="number" min="1" max="104" className={inputClass} {...register('totalSessions', { required: 'Nhập số buổi', min: 1, max: 104 })} />{renderError('totalSessions')}</label>}
      {modal === 'create' ? (
        <label className="md:col-span-2 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600"
            {...register('repeatFullCourse')}
          />
          <span>
            <span className="block text-sm font-semibold text-emerald-800">Lặp lại toàn khóa</span>
            <span className="mt-1 block text-xs font-semibold text-emerald-700">
              Nhập số buổi cần tạo. Lịch lặp mỗi tuần theo giờ đã chọn.
            </span>
          </span>
        </label>
      ) : null}
    </div>
  )

  const renderBody = () => {
    if (config.intent === 'danger') {
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <p className="flex items-center gap-2 text-base font-semibold"><AlertTriangle size={18} /> {config.title}</p>
            <p className="mt-2">Thao tác áp dụng cho {event?.className || 'lịch học đã chọn'}.</p>
          </div>
          <label className="block">
            <span className={labelClass}>Lý do</span>
            <textarea rows={4} className={textareaClass} {...register('reason', required('Vui lòng nhập lý do'))} />
            {renderError('reason')}
          </label>
        </div>
      )
    }

    if (config.intent === 'time') {
      return <div className="grid gap-4 md:grid-cols-2">{renderTimeFields()}</div>
    }

    if (config.intent === 'room') {
      return (
        <label className="block">
          <span className={labelClass}>Phòng học mới</span>
          <select className={inputClass} {...register('room', required('Vui lòng chọn phòng học'))}>
            {classrooms.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.branch} · {item.capacity} chỗ</option>)}
          </select>
        </label>
      )
    }

    if (config.intent === 'teacher') {
      return (
        <label className="block">
          <span className={labelClass}>Giáo viên mới</span>
          <select className={inputClass} {...register('teacher', required('Vui lòng chọn giáo viên'))}>
            {teachers.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.branch}</option>)}
          </select>
        </label>
      )
    }

    if (config.intent === 'recurring') {
      return (
        <div className="space-y-4">
          {renderMainForm()}
          <label className="block">
            <span className={labelClass}>Số tuần lặp</span>
            <input type="number" min="1" max="24" className={inputClass} {...register('repeatWeeks')} />
          </label>
        </div>
      )
    }

    if (config.intent === 'homework') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={labelClass}>Tên bài tập</span>
            <input className={inputClass} {...register('homeworkTitle', required('Vui lòng nhập tên bài tập'))} />
            {renderError('homeworkTitle')}
          </label>
          <label className="block">
            <span className={labelClass}>Hạn nộp</span>
            <input type="date" className={inputClass} {...register('homeworkDeadline')} />
          </label>
          <label className="block">
            <span className={labelClass}>Trạng thái giao bài</span>
            <select className={inputClass} {...register('homeworkStatus')}>
              <option>Đã giao</option>
              <option>Nháp</option>
              <option>Chờ giao</option>
            </select>
          </label>
        </div>
      )
    }

    if (config.intent === 'notify') {
      return (
        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>Tiêu đề</span>
            <input className={inputClass} {...register('notifyTitle', required('Vui lòng nhập tiêu đề'))} />
          </label>
          <label className="block">
            <span className={labelClass}>Nội dung thông báo</span>
            <textarea rows={5} className={textareaClass} placeholder="Nhập thông báo trong tài khoản học viên" {...register('notifyContent')} />
          </label>
        </div>
      )
    }

    if (config.intent === 'export') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Định dạng</span>
            <select className={inputClass} {...register('exportFormat')}>
              <option>Excel</option>

            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Khoảng thời gian</span>
            <select className={inputClass} {...register('range')}>
              {filters.ranges.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      )
    }

    if (config.intent === 'confirm') {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
          <p className="flex items-center gap-2 text-base font-semibold"><CalendarClock size={18} /> {event?.className || 'Lịch học'}</p>
          <p className="mt-2">Xác nhận lưu thay đổi lịch học vào hệ thống.</p>
        </div>
      )
    }

    return renderMainForm()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[1px]">
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4 border-b border-gray-300 bg-white px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{config.title}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {event?.className || 'Nhập thông tin lịch học theo biểu mẫu.'}
              </p>
            </div>
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50" aria-label="Đóng modal" onClick={onClose}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <form className="max-h-[calc(92vh-88px)] space-y-5 overflow-y-auto bg-slate-50 p-6" onSubmit={handleSubmit(submitForm)}>
            {renderBody()}

            {config.intent !== 'danger' && config.intent !== 'confirm' && config.intent !== 'export' ? (
              <label className="block">
                <span className={labelClass}>Ghi chú</span>
                <textarea rows={3} className={textareaClass} placeholder="Nội dung buổi học hoặc ghi chú điều phối" {...register('reason')} />
              </label>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
              <button type="button" className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className={`h-11 rounded-xl px-4 text-sm font-semibold text-white ${config.intent === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {config.submitText}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ScheduleModal
