import { LogIn, MapPin } from 'lucide-react'
import { teacherAttendanceLocation, teacherAttendanceTime } from '../../services/scheduleTeacherAttendance.js'

const shortTime = value => {
  const formatted = teacherAttendanceTime(value)
  return formatted === 'Chưa ghi nhận' ? '—' : formatted.length === 5 ? formatted : formatted.slice(-8, -3)
}

export default function ScheduleAttendancePreview({ scheduleId, records = [] }) {
  const record = records.find(item => item.scheduleId === scheduleId) || records[0]
  const checkInLocation = teacherAttendanceLocation(record, 'checkIn')
  const checkOutLocation = teacherAttendanceLocation(record, 'checkOut')
  const timeText = `Vào ${shortTime(record?.checkIn)} · Ra ${shortTime(record?.checkOut)}`
  const locationText = checkInLocation || checkOutLocation ? `GPS vào ${checkInLocation ? '✓' : '—'} · ra ${checkOutLocation ? '✓' : '—'}` : 'Chưa có vị trí'
  const scope = record && !record.scheduleId ? 'Chấm công theo ngày' : 'Chấm công buổi học'
  return <div className="schedule-attendance-preview mt-1 space-y-1 border-t border-white/25 pt-1 text-[10px] leading-tight">
    <div className="flex min-w-0 items-center gap-1" title={`${scope}\nCheck-in: ${teacherAttendanceTime(record?.checkIn)}\nCheck-out: ${teacherAttendanceTime(record?.checkOut)}`}>
      <LogIn size={11} className="shrink-0" aria-hidden="true" /><span className="truncate">{timeText}</span>
    </div>
    <div className="flex min-w-0 items-center gap-1 opacity-95" title={`Vị trí check-in: ${checkInLocation?.coordinates || 'Chưa ghi nhận'}\nVị trí check-out: ${checkOutLocation?.coordinates || 'Chưa ghi nhận'}\nBấm lịch dạy để xem chi tiết`} aria-label={`Vị trí check-in: ${checkInLocation ? 'đã có' : 'chưa có'}, check-out: ${checkOutLocation ? 'đã có' : 'chưa có'}`}>
      <MapPin size={11} className="shrink-0" aria-hidden="true" /><span className="truncate">{locationText}</span>
    </div>
    {record && !record.scheduleId && <div className="truncate text-[9px] opacity-80">Công theo ngày</div>}
    {records.length > 1 && <div className="truncate text-[9px] opacity-80">{records.length} bản ghi · Xem chi tiết</div>}
  </div>
}
