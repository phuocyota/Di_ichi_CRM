import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const inputClass = 'mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-400'
const textareaClass = 'mt-2 min-h-24 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400'

function formatCurrencyInput(value) {
  return String(value || '').replace(/[^\d]/g, '')
}

function buildCourseInitial(item) {
  return {
    code: item?.code || '',
    name: item?.name || '',
    level: item?.level || '',
    duration: item?.duration || '',
    sessions: item?.sessions || 24,
    tuition: item?.tuition || '',
    description: item?.description || '',
    status: item?.status || 'recruiting',
  }
}

function buildClassInitial(item, courseId) {
  return {
    code: item?.code || '',
    name: item?.name || '',
    courseId: item?.courseId || courseId || '',
    teacherId: item?.teacherId || 'teacher-001',
    roomId: item?.roomId || 'room-201',
    startDate: item?.startDate || '',
    endDate: item?.endDate || '',
    schedule: item?.schedule || '',
    currentStudents: item?.currentStudents || 0,
    maxStudents: item?.maxStudents || 20,
    status: item?.status || 'upcoming',
  }
}

function CourseModal({
  modal,
  courseStatuses,
  classStatuses,
  courses,
  teachers,
  rooms,
  courseMap,
  teacherMap,
  roomMap,
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState({})

  useEffect(() => {
    if (!modal) return
    setValues(modal.entity === 'course' ? buildCourseInitial(modal.item) : buildClassInitial(modal.item, modal.courseId))
  }, [modal])

  if (!modal) return null

  const isCourse = modal.entity === 'course'
  const isClass = modal.entity === 'class'
  const isReadonly = modal.mode === 'view'
  const isDelete = modal.mode === 'delete'

  const titleMap = {
    create: isCourse ? 'Thêm khóa học' : 'Thêm lớp học',
    view: isCourse ? 'Chi tiết khóa học' : 'Chi tiết lớp học',
    edit: isCourse ? 'Sửa khóa học' : 'Sửa lớp học',
    delete: isCourse ? 'Xóa khóa học' : 'Xóa lớp học',
  }

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isReadonly) {
      onClose()
      return
    }
    onSubmit(modal, values)
  }

  const courseName = modal.item?.name || courseMap[modal.courseId]?.name

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onSubmit={handleSubmit}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Quản lý khóa học</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">{titleMap[modal.mode]}</h3>
          </div>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {isDelete ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">
                Bạn có chắc muốn xóa {isCourse ? 'khóa học' : 'lớp học'} <span className="font-black">{modal.item?.name}</span>?
              </p>
              {isCourse ? (
                <p className="mt-2 text-sm font-semibold text-red-600">Các lớp thuộc khóa học này cũng sẽ được gỡ khỏi danh sách mẫu hiện tại.</p>
              ) : null}
            </div>
          ) : null}

          {isCourse && !isDelete ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Mã khóa học</span>
                <input className={inputClass} value={values.code || ''} disabled={isReadonly} onChange={(event) => updateValue('code', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Tên khóa học</span>
                <input className={inputClass} value={values.name || ''} disabled={isReadonly} onChange={(event) => updateValue('name', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Cấp độ</span>
                <input className={inputClass} value={values.level || ''} disabled={isReadonly} onChange={(event) => updateValue('level', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Thời lượng</span>
                <input className={inputClass} value={values.duration || ''} disabled={isReadonly} onChange={(event) => updateValue('duration', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Số buổi học</span>
                <input className={inputClass} type="number" min="1" value={values.sessions || ''} disabled={isReadonly} onChange={(event) => updateValue('sessions', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Học phí</span>
                <input className={inputClass} value={values.tuition || ''} disabled={isReadonly} onChange={(event) => updateValue('tuition', formatCurrencyInput(event.target.value))} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Trạng thái</span>
                <select className={inputClass} value={values.status || ''} disabled={isReadonly} onChange={(event) => updateValue('status', event.target.value)}>
                  {courseStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="text-xs font-black uppercase text-slate-500">Mô tả</span>
                <textarea className={textareaClass} value={values.description || ''} disabled={isReadonly} onChange={(event) => updateValue('description', event.target.value)} />
              </label>
            </div>
          ) : null}

          {isClass && !isDelete ? (
            <div className="grid gap-4 md:grid-cols-2">
              {courseName ? (
                <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                  Lớp này thuộc khóa học: {courseName}
                </div>
              ) : null}
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Mã lớp</span>
                <input className={inputClass} value={values.code || ''} disabled={isReadonly} onChange={(event) => updateValue('code', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Tên lớp</span>
                <input className={inputClass} value={values.name || ''} disabled={isReadonly} onChange={(event) => updateValue('name', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Khóa học</span>
                <select className={inputClass} value={values.courseId || ''} disabled={isReadonly || Boolean(modal.courseId)} onChange={(event) => updateValue('courseId', event.target.value)}>
                  {courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Giáo viên</span>
                <select className={inputClass} value={values.teacherId || ''} disabled={isReadonly} onChange={(event) => updateValue('teacherId', event.target.value)}>
                  {teachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Phòng học</span>
                <select className={inputClass} value={values.roomId || ''} disabled={isReadonly} onChange={(event) => updateValue('roomId', event.target.value)}>
                  {rooms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Ngày khai giảng</span>
                <input className={inputClass} type="date" value={values.startDate || ''} disabled={isReadonly} onChange={(event) => updateValue('startDate', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Ngày kết thúc</span>
                <input className={inputClass} type="date" value={values.endDate || ''} disabled={isReadonly} onChange={(event) => updateValue('endDate', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Lịch học</span>
                <input
                  className={inputClass}
                  value={values.schedule || ''}
                  disabled={isReadonly}
                  placeholder="VD: T2-T4 18:00 - 20:00"
                  onChange={(event) => updateValue('schedule', event.target.value)}
                  required
                />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Sĩ số hiện tại</span>
                <input className={inputClass} type="number" min="0" value={values.currentStudents || 0} disabled={isReadonly} onChange={(event) => updateValue('currentStudents', event.target.value)} />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Sĩ số tối đa</span>
                <input className={inputClass} type="number" min="1" value={values.maxStudents || ''} disabled={isReadonly} onChange={(event) => updateValue('maxStudents', event.target.value)} required />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Trạng thái</span>
                <select className={inputClass} value={values.status || ''} disabled={isReadonly} onChange={(event) => updateValue('status', event.target.value)}>
                  {classStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
            </div>
          ) : null}

          {isReadonly && isCourse ? (
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 md:grid-cols-2">
              <p>Học phí: {new Intl.NumberFormat('vi-VN').format(modal.item.tuition)}</p>
              <p>Số buổi: {modal.item.sessions}</p>
            </div>
          ) : null}

          {isReadonly && isClass ? (
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 md:grid-cols-2">
              <p>Giáo viên: {teacherMap[modal.item.teacherId]?.name}</p>
              <p>Phòng học: {roomMap[modal.item.roomId]?.name}</p>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" className="h-10 rounded-xl border border-gray-300 px-4 text-sm font-black text-slate-600" onClick={onClose}>
            {isReadonly ? 'Đóng' : 'Hủy'}
          </button>
          {!isReadonly ? (
            <button type="submit" className={`h-10 rounded-xl px-4 text-sm font-black text-white ${isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isDelete ? 'Xóa' : 'Lưu'}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}

export default CourseModal
