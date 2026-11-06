import { Clock3, MapPin } from 'lucide-react'
import dayjs from 'dayjs'
import { teacherAttendanceLocation, teacherAttendanceTime } from '../../services/scheduleTeacherAttendance.js'

export default function TeacherAttendanceDetails({ teacher, records = [] }) {
  const entries = records.length ? records : [{ id: 'unrecorded' }]
  return <section className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 shadow-sm dark:border-slate-700">
    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200"><Clock3 size={16} /> Chấm công giáo viên</h3>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{teacher}</p>
    {entries.map(record => <div key={record.id} className="mt-3">
      {records.length > 0 && <p className="text-xs text-slate-500 dark:text-slate-400">{record.scheduleId ? 'Chấm công buổi học' : record.date ? `Chấm công theo ngày · ${dayjs(record.date).format('DD/MM/YYYY')}` : 'Bản ghi chấm công'}</p>}
      <dl className="mt-2 grid gap-3 sm:grid-cols-2">{[['Check-in', 'checkIn'], ['Check-out', 'checkOut']].map(([label, field]) => {
        const location = teacherAttendanceLocation(record, field)
        return <div key={field} className="rounded-xl border border-blue-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <dt className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">{label}</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{teacherAttendanceTime(record[field])}</dd>
          <dt className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><MapPin size={13} /> Vị trí {label.toLowerCase()}</dt>
          <dd className="mt-1 break-words text-xs">{location ? <a className="inline-block font-medium text-blue-700 underline underline-offset-2 dark:text-blue-300" href={location.url} target="_blank" rel="noopener noreferrer" aria-label={`Xem vị trí ${label.toLowerCase()} trên Google Maps`}>
            {location.coordinates}<span className="mt-1 block">Xem Google Maps{location.sample ? ' · Dữ liệu mẫu' : ''}</span>
          </a> : <span className="text-slate-500 dark:text-slate-400">Chưa ghi nhận vị trí</span>}</dd>
        </div>
      })}</dl>
    </div>)}
  </section>
}
