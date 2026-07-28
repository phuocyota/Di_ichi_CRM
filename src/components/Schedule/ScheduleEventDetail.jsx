import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import {
  Bell,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  DoorOpen,
  GraduationCap,
  NotebookPen,
  Pencil,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react'

function ScheduleEventDetail({ event, statuses, onClose, onOpenModal }) {
  const status = statuses.find((item) => item.value === event?.status)

  return (
    <AnimatePresence>
      {event ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/35">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Đóng chi tiết lịch học" onClick={onClose} />
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="relative flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-gray-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <header className="border-b border-gray-300 p-5 dark:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Chi tiết lịch học</p>
                  <h2 className="mt-1 truncate text-2xl font-black text-slate-950 dark:text-white">{event.className}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {dayjs(event.start).format('DD/MM/YYYY HH:mm')} - {dayjs(event.end).format('HH:mm')}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="Đóng"
                  onClick={onClose}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-bold text-white" onClick={() => onOpenModal('edit', event)}>
                  <Pencil size={16} aria-hidden="true" />
                  Chỉnh sửa
                </button>
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100" onClick={() => onOpenModal('duplicate', event)}>
                  <Copy size={16} aria-hidden="true" />
                  Sao chép
                </button>
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700" onClick={() => onOpenModal('delete', event)}>
                  <Trash2 size={16} aria-hidden="true" />
                  Xóa
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <section className="rounded-xl border border-gray-300 p-4 shadow-sm dark:border-slate-700">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">Thông tin lớp</h3>
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ['Mã lớp', event.classCode],
                    ['Tên lớp', event.className],
                    ['Khóa học', event.course],
                    ['Giáo viên', event.teacher],
                    ['Phòng học', event.room],
                    ['Cơ sở', event.branch],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                      <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-1 font-black text-slate-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Thời gian</p>
                    <p className="mt-1 font-black text-slate-900 dark:text-white">
                      {dayjs(event.start).format('HH:mm')} - {dayjs(event.end).format('HH:mm')}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Trạng thái</p>
                    <span className={`mt-1 inline-flex rounded-xl border px-2 py-1 text-xs font-black ${status?.className || ''}`}>
                      {status?.label || event.status}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-300 p-4 shadow-sm dark:border-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">Danh sách học viên</h3>
                  <span className="text-xs font-bold text-slate-500">{event.students.length} học viên</span>
                </div>
                <div className="mt-3 space-y-2">
                  {event.students.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-slate-700">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
                        {student.avatar}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-xs font-semibold text-slate-500">{student.id}</p>
                      </div>
                      <span className="rounded-xl bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {student.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-gray-300 p-4 shadow-sm dark:border-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">Điểm danh</h3>
                  <button type="button" className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white" onClick={() => onOpenModal('attendance', event)}>
                    <UserCheck size={15} aria-hidden="true" />
                    Bắt đầu điểm danh
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ['Đã điểm danh', event.attendance.checked, CheckCircle2, 'text-emerald-700 bg-emerald-50'],
                    ['Chưa điểm danh', event.attendance.pending, ClipboardCheck, 'text-blue-700 bg-blue-50'],
                    ['Nghỉ phép', event.attendance.excused, CalendarClock, 'text-amber-700 bg-amber-50'],
                    ['Nghỉ không phép', event.attendance.absent, X, 'text-red-700 bg-red-50'],
                  ].map(([label, value, Icon, className]) => (
                    <div key={label} className={`rounded-xl p-3 ${className}`}>
                      <Icon size={18} aria-hidden="true" />
                      <p className="mt-2 text-xl font-black">{value}</p>
                      <p className="text-xs font-bold">{label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-gray-300 p-4 shadow-sm dark:border-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">Homework</h3>
                  <button type="button" className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-300 px-3 text-xs font-black text-slate-700 dark:border-slate-700 dark:text-slate-100" onClick={() => onOpenModal('homework', event)}>
                    <BookOpenCheck size={15} aria-hidden="true" />
                    Giao Homework
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {event.homework.map((item) => (
                    <div key={item.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Hạn nộp {dayjs(item.deadline).format('DD/MM/YYYY')} · {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-gray-300 p-4 shadow-sm dark:border-slate-700">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">Ghi chú</h3>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="flex items-center gap-2 font-black text-slate-900 dark:text-white"><NotebookPen size={16} /> Nội dung buổi học</p>
                    <p className="mt-2 font-medium text-slate-600 dark:text-slate-300">{event.lessonNote}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="flex items-center gap-2 font-black text-slate-900 dark:text-white"><GraduationCap size={16} /> Ghi chú của giáo viên</p>
                    <p className="mt-2 font-medium text-slate-600 dark:text-slate-300">{event.teacherNote}</p>
                  </div>
                </div>
              </section>
            </div>

            <footer className="grid gap-2 border-t border-gray-300 p-4 sm:grid-cols-3 dark:border-slate-700">
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100" onClick={() => onOpenModal('changeTeacher', event)}>
                <GraduationCap size={16} /> Đổi GV
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100" onClick={() => onOpenModal('changeRoom', event)}>
                <DoorOpen size={16} /> Đổi phòng
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100" onClick={() => onOpenModal('notify', event)}>
                <Bell size={16} /> Thông báo
              </button>
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export default ScheduleEventDetail
