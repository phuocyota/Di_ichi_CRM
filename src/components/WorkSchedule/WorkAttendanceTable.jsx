import { Fragment, useState } from 'react'
import { CalendarDays, Clock3, MapPin } from 'lucide-react'
import { attendanceMap, attendanceStatus } from '../../services/workSchedule.js'
import { dailyWorkAttendance, workDurationLabel } from '../../services/workAttendanceReport.js'

const timeLabel = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }) : '—'

function RecordedLocation({ record, field }) {
  const evidence = record?.[`${field}Evidence`]
  const map = record?.[field] && attendanceMap(evidence)
  if (!map) return <span className="work-report-muted">Chưa có vị trí</span>
  return <a className="work-report-location" href={map.url} target="_blank" rel="noopener noreferrer"><MapPin size={14} /><span>{map.coordinates}<small>Google Maps{record.source === 'sample' || evidence.sample ? ' · Mẫu' : ''}</small></span></a>
}

export default function WorkAttendanceTable({ assignments, attendance, people, fromDate = '', toDate = '', onDetail }) {
  const [from, setFrom] = useState(fromDate)
  const [to, setTo] = useState(toDate)
  const invalidRange = Boolean(from && to && from > to)
  const filtered = invalidRange ? [] : assignments.filter(item => (!from || item.date >= from) && (!to || item.date <= to))
  const groups = dailyWorkAttendance(filtered, attendance, people)
  return <section className="work-panel work-daily-attendance">
    <div className="work-section-heading"><div><h2>Tình hình chấm công theo ngày</h2><p>Check-in, check-out và vị trí thực tế · Theo khoảng thời gian, cơ sở và nhân viên đang lọc</p></div><span className="work-report-count"><Clock3 size={15} /> {groups.length} lượt nhân viên / ngày</span></div>
    <div className="work-attendance-filters">
      <span className="work-attendance-filter-title"><CalendarDays size={16} /> Thời gian chấm công</span>
      <label>Từ ngày<input type="date" aria-label="Chấm công từ ngày" value={from} max={to || undefined} aria-invalid={invalidRange} onChange={event => setFrom(event.target.value)} /></label>
      <label>Đến ngày<input type="date" aria-label="Chấm công đến ngày" value={to} min={from || undefined} aria-invalid={invalidRange} onChange={event => setTo(event.target.value)} /></label>
      <button type="button" className="ui-button" onClick={() => { setFrom(fromDate); setTo(toDate) }}>Tuần đang xem</button>
      <button type="button" className="work-attendance-clear" onClick={() => { setFrom(''); setTo('') }}>Tất cả thời gian</button>
      {invalidRange && <p role="alert">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</p>}
    </div>
    <div className="work-calendar-scroll"><table className="work-attendance-table">
      <caption className="sr-only">Chi tiết chấm công từng ca và tổng số giờ làm thực tế mỗi ngày của nhân viên</caption>
      <thead><tr>{['Ngày', 'Nhân viên', 'Khung giờ', 'Check-in', 'Vị trí check-in', 'Check-out', 'Vị trí check-out', 'Tình trạng', 'Tổng giờ / ngày'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{groups.length ? groups.map(group => <Fragment key={group.key}>{group.entries.map(({ item, record }, index) => {
        const status = attendanceStatus(item, record)
        return <tr key={item.id} className={index === 0 ? 'is-day-start' : ''}>
          {index === 0 && <><th scope="rowgroup" rowSpan={group.entries.length}>{group.date.split('-').reverse().join('/')}</th><td rowSpan={group.entries.length}><strong>{group.name}</strong><small>{group.role}</small></td></>}
          <td><button type="button" className="work-report-detail" onClick={() => onDetail(item)}>{item.start.slice(0, 5)} – {item.end.slice(0, 5)}<small>{item.shiftName || 'Xem chi tiết ca'}</small></button></td>
          <td title={record?.checkIn || ''}>{timeLabel(record?.checkIn)}</td><td><RecordedLocation record={record} field="checkIn" /></td>
          <td title={record?.checkOut || ''}>{timeLabel(record?.checkOut)}</td><td><RecordedLocation record={record} field="checkOut" /></td>
          <td><button type="button" onClick={() => onDetail(item)}><span className={`work-attendance-badge is-${status.tone}`}>{status.label}</span></button></td>
          {index === 0 && <td className="work-report-total" rowSpan={group.entries.length}><strong>{group.completed ? workDurationLabel(group.minutes) : '—'}</strong><small>{group.incomplete ? `Chưa đủ công: ${group.incomplete} ca${group.completed ? ' · Tạm tính' : ''}` : `${group.completed} ca đủ check-in/out`}</small></td>}
        </tr>
      })}</Fragment>) : <tr><td colSpan={9} className="work-report-empty">Chưa có lịch làm việc trong bộ lọc đang chọn.</td></tr>}</tbody>
    </table></div>
    <p className="work-report-note">Tổng giờ tính từ các cặp check-in / check-out hợp lệ trong ngày, cộng các ca và không tính trùng khoảng giờ giao nhau. Ca thiếu check-in hoặc check-out chưa được cộng vào tổng.</p>
  </section>
}
