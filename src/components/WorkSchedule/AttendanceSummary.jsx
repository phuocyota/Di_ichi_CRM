import { MapPin, ChevronRight } from 'lucide-react'
import { attendanceIssues, attendanceMap, attendanceStatus } from '../../services/workSchedule.js'

const timeLabel = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }) : '—'

export default function AttendanceSummary({ item, record, onDetail }) {
  const status = attendanceStatus(item, record)
  const issues = attendanceIssues(item, record)
  return <div className="work-attendance-summary">
    <button type="button" className="work-attendance-status" onClick={() => onDetail(item)} aria-label={`Xem chi tiết chấm công ngày ${item.date}, ${item.start}–${item.end}`}>
      <span className={`work-attendance-badge is-${status.tone}`}>{status.label}</span>
      {issues.length > 0 && <span className="work-warning">{issues.join(' · ')}</span>}
      <span className="work-attendance-more">Xem chi tiết <ChevronRight size={12} /></span>
    </button>
    <div className="work-attendance-times"><span>Vào: <strong>{timeLabel(record?.checkIn)}</strong></span><span>Ra: <strong>{timeLabel(record?.checkOut)}</strong></span></div>
    {['checkIn', 'checkOut'].map(key => {
      if (!record?.[key]) return null
      const evidence = record[`${key}Evidence`]
      const map = attendanceMap(evidence)
      const label = key === 'checkIn' ? 'check-in' : 'check-out'
      const sample = record.source === 'sample' || evidence?.sample
      return map ? <a key={key} className="work-map-link" href={map.url} target="_blank" rel="noopener noreferrer" aria-label={`Xem vị trí ${label} trên Google Maps ngày ${item.date}, lúc ${timeLabel(record[key])}`}><MapPin size={13} /><span>Vị trí {label} · Google Maps{sample ? ' (mẫu)' : ''}</span></a> : <span key={key} className="work-no-location"><MapPin size={13} />Chưa có vị trí {label}</span>
    })}
    {!record?.checkIn && !record?.checkOut && <span className="work-no-location"><MapPin size={13} />Chưa ghi nhận vị trí</span>}
  </div>
}
