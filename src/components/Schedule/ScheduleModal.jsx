import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { AlertTriangle, CalendarClock, X } from 'lucide-react'
import {generatePatternSessions,generatePatternUntil} from '../../services/schedulePattern.js'
const sessionLimitMessage = 'Mỗi lần tạo tối đa 104 buổi. Vui lòng chia thành các khoảng ngày ngắn hơn.'

const todayInputDate = () => {
  const parts = new Intl.DateTimeFormat('en', {timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())
  const part=type=>parts.find(item=>item.type===type).value
  return `${part('year')}-${part('month')}-${part('day')}`
}

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
  } = useForm({shouldUnregister:true})

  const selectedClassName = watch('className')
  const repeating = modal === 'recurring' || (modal === 'create' && watch('repeatFullCourse'))
  const untilEnd = modal === 'create' && watch('repeatFullCourse')
  const untilDate = watch('untilDate')
  const pattern = watch('schedulePattern'), firstDate=watch('date'), totalSessions=watch('totalSessions')
  let preview=[], previewError=''
  if(repeating && pattern) {
    try {
      preview=untilEnd?generatePatternUntil(pattern,firstDate,untilDate):generatePatternSessions(pattern,firstDate,totalSessions)
      if(preview.length>104){preview=[];throw new Error('Mỗi lần tạo tối đa 104 buổi. Vui lòng chia thành các khoảng ngày ngắn hơn.')}
    } catch(error) {previewError=error.message}
  }

  useEffect(() => {
    const isEditing = Boolean(event?.id)

    reset({
      className: isEditing ? event?.classId || '' : '',
      course: isEditing ? event?.course || '' : '',
      teacher: isEditing ? event?.teacherId || '' : '',
      room: isEditing ? event?.roomId || '' : '',
      branch: isEditing ? event?.branchId || '' : '',
      date: event?.start ? dayjs(event.start).format('YYYY-MM-DD') : isEditing ? '' : todayInputDate(),
      startTime: event?.start ? dayjs(event.start).format('HH:mm') : '',
      endTime: event?.end ? dayjs(event.end).format('HH:mm') : '',
      status: isEditing ? event?.status || '' : '',
      totalSessions: 12,
      untilDate: dayjs(todayInputDate()).add(4,'month').format('YYYY-MM-DD'),
      schedulePattern: event?.start && event?.end ? `${dayjs(event.start).day()===0?'CN':'T'+(dayjs(event.start).day()+1)} ${dayjs(event.start).format('HH:mm')}-${dayjs(event.end).format('HH:mm')}` : '',
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
    if (selectedClass.endDate) setValue('untilDate', selectedClass.endDate)
    if(modal==='create' && selectedClass.plannedSchedule?.repeatUntilEnd) {
      const plan=selectedClass.plannedSchedule
      setValue('repeatFullCourse',true)
      setValue('date',plan.startDate)
      setValue('untilDate',plan.endDate)
      setValue('schedulePattern',plan.weeklySchedule.map(slot=>`${slot.weekday===0?'CN':'T'+(slot.weekday+1)} ${slot.startTime.slice(0,5)}-${slot.endTime.slice(0,5)}`).join('; '))
    } else if(modal==='create') {
      setValue('repeatFullCourse',false)
      setValue('schedulePattern','')
    }
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
              Tự lặp lịch theo thứ và giờ đã nhập, đến hết ngày kết thúc.
            </span>
          </span>
        </label>
      ) : null}
      {repeating ? <>
        <label className="block"><span className={labelClass}>Ngày bắt đầu</span><input type="date" className={inputClass} {...register('date',required('Chọn ngày bắt đầu'))}/>{renderError('date')}</label>
        {untilEnd ? <label className="block"><span className={labelClass}>Ngày kết thúc</span><input type="date" className={inputClass} {...register('untilDate',required('Chọn ngày kết thúc'))}/>{renderError('untilDate')}</label> : <label className="block"><span className={labelClass}>Số buổi toàn khóa</span><input type="number" min="1" max="104" step="1" className={inputClass} {...register('totalSessions',{required:'Nhập số buổi toàn khóa',validate:value=>Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=104||'Nhập số nguyên từ 1 đến 104'})}/>{renderError('totalSessions')}</label>}
        <label className="block md:col-span-2"><span className={labelClass}>Lịch học trong tuần</span><input className={inputClass} placeholder="T2-T4 14:00-16:00" {...register('schedulePattern',{required:'Nhập lịch học trong tuần',validate:value=>{try{const sessions=untilEnd?generatePatternUntil(value,watch('date'),watch('untilDate')):generatePatternSessions(value,watch('date'),watch('totalSessions'));if(sessions.length>104)throw new Error(sessionLimitMessage);return true}catch(error){return error.message}}})}/><span className="mt-2 block text-xs text-slate-500">T2-T4 nghĩa là học thứ Hai và thứ Tư, không gồm thứ Ba. Thêm khung giờ khác bằng dấu chấm phẩy, ví dụ: T6 09:00-11:00. Dùng CN cho Chủ nhật.</span>{renderError('schedulePattern')}</label>
        {previewError && !errors.schedulePattern ? <p role="status" className="md:col-span-2 text-sm text-amber-700">{previewError}</p> : null}
        {preview.length>0 ? <section className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/60 p-4" aria-label="Xem trước lịch học"><h3 className="text-sm font-semibold text-slate-800">Sẽ tạo {preview.length} buổi học</h3><p className="mt-1 text-xs text-slate-500">Từ {dayjs(preview[0].date).format('DD/MM/YYYY')} đến {dayjs(preview.at(-1).date).format('DD/MM/YYYY')} · Giờ Việt Nam</p><ol className="mt-3 grid gap-2 sm:grid-cols-2">{preview.slice(0,6).map((session,index)=><li key={session.startAt} className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700"><span className="mr-2 text-slate-400">{index+1}.</span>{session.weekday===0?'CN':`T${session.weekday+1}`} · {dayjs(session.date).format('DD/MM/YYYY')} · {session.startTime}–{session.endTime}</li>)}</ol>{preview.length>6?<p className="mt-2 text-xs text-slate-500">Và {preview.length-6} buổi tiếp theo theo lịch đã nhập.</p>:null}</section> : null}
      </> : renderTimeFields()}
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
      return renderMainForm()
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
