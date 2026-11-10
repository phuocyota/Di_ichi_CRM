import { useState } from 'react'
import { MapPin, ExternalLink } from 'lucide-react'
import { attendanceIssues, attendanceMap, attendanceStatus, distanceMeters } from '../../services/workSchedule.js'
import WorkScheduleDialog, { Field } from './WorkScheduleDialog.jsx'

const localTime = value => value ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)).replace(' ', 'T') : ''
const timeLabel = value => value ? new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Chưa chấm công'

function AttendanceEvidence({ label, timestamp, evidence, branch, sample }) {
  const map = timestamp ? attendanceMap(evidence) : null
  const [showMap, setShowMap] = useState(false)
  return <section className="work-evidence">
    <h3>{label}</h3><p className="work-evidence-time">{timeLabel(timestamp)}</p>
    {timestamp && evidence?.photo && <a href={evidence.photo} target="_blank" rel="noopener noreferrer" aria-label={`Xem ảnh ${label}`}><img className="work-photo" src={evidence.photo} alt={`Ảnh ${label}`} /></a>}
    {map ? <>
      <p className="work-hint"><MapPin size={14} /> {map.coordinates}</p>
      {Number.isFinite(evidence.accuracy) && <p className="work-hint">Độ chính xác GPS: ±{Math.round(evidence.accuracy)}m</p>}
      {Number.isFinite(branch.latitude) && Number.isFinite(branch.longitude) && <p className="work-hint">Cách vị trí cơ sở hiện cấu hình: {Math.round(distanceMeters(evidence, branch))}m</p>}
      {evidence.capturedAt && <p className="work-hint">Ghi nhận vị trí: {timeLabel(evidence.capturedAt)}</p>}
      {sample && <p className="work-hint">Vị trí minh họa từ dữ liệu mẫu.</p>}
      <div className="flex flex-wrap gap-2"><a className="work-map-link" href={map.url} target="_blank" rel="noopener noreferrer" aria-label={`Mở vị trí ${label} trên Google Maps`}><ExternalLink size={14} /> Mở Google Maps · {label}</a><button type="button" className="work-map-toggle" aria-expanded={showMap} onClick={() => setShowMap(old => !old)}>{showMap ? 'Ẩn bản đồ' : 'Xem bản đồ'}</button></div>
      {showMap && <iframe className="work-evidence-map" title={`Bản đồ vị trí ${label}`} src={map.embedUrl} loading="lazy" referrerPolicy="no-referrer" allowFullScreen />}
    </> : <p className="work-hint">{timestamp ? 'Không có dữ liệu vị trí được ghi nhận cho lần chấm công này.' : 'Chưa ghi nhận ảnh và vị trí.'}</p>}
  </section>
}

export default function AttendanceDialog({ item, record, branch, classes = [], courses = [], people, isAdmin, onSave, onEdit, onDelete, onClose }) {
  const [manual, setManual] = useState(false)
  const [checkIn, setCheckIn] = useState(localTime(record?.checkIn))
  const [checkOut, setCheckOut] = useState(localTime(record?.checkOut))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const person = people.find(row => row.id === item.personId)
  const classItem = classes.find(row => row.id === item.classId) || (item.classId ? { code: item.classCode || item.classId, name: item.className || 'Lớp không còn trong danh sách', courseId: item.courseId } : null)
  const course = courses.find(row => row.id === classItem?.courseId)
  const status = attendanceStatus(item, record)
  const issues = attendanceIssues(item, record)
  const submit = async event => {
    event.preventDefault(); setError('')
    try {
      if (!isAdmin || !manual) throw new Error('Chỉ quản trị viên được bổ sung chấm công.')
      if (!note.trim() || (!checkIn && !checkOut)) throw new Error('Nhập giờ chấm công và lý do bổ sung.')
      if (!checkIn && checkOut) throw new Error('Cần có check-in trước khi bổ sung check-out.')
      const incoming = checkIn ? `${checkIn}:00+07:00` : null, outgoing = checkOut ? `${checkOut}:00+07:00` : null
      if ([checkIn, checkOut].some(value => value && value.slice(0, 10) !== item.date)) throw new Error('Giờ chấm công phải cùng ngày phân lịch.')
      if ([incoming, outgoing].some(value => value && Date.parse(value) > Date.now())) throw new Error('Không được chấm công trong tương lai.')
      if (outgoing && Date.parse(outgoing) <= Date.parse(incoming)) throw new Error('Check-out phải sau check-in.')
      await onSave({ ...record, assignmentId: item.id, checkIn: incoming, checkOut: outgoing, source: 'admin', note: note.trim() })
    } catch (cause) { setError(cause.message) }
  }
  return <WorkScheduleDialog title="Chi tiết lịch làm việc" onClose={onClose}><form className="work-form" onSubmit={submit}>
    <div className="work-detail"><strong>{person?.name || item.personName || item.personId}</strong><p>{item.personRole || person?.role}</p></div>
    <dl className="work-detail-grid">
      <div><dt>Cơ sở</dt><dd>{branch.name}</dd></div>
      <div><dt>Ngày làm việc</dt><dd>{item.date.split('-').reverse().join('/')}</dd></div>
      <div><dt>Giờ theo lịch</dt><dd>{item.start} – {item.end}</dd></div>
      <div><dt>{item.kind === 'teacher' ? 'Số tiết dạy' : 'Ca làm'}</dt><dd>{item.kind === 'teacher' ? `${item.periods} tiết` : item.shiftName || 'Theo ca phân công'}</dd></div>
      {classItem && <><div><dt>Khóa học</dt><dd>{course?.name || item.courseName || 'Không còn trong danh sách'}</dd></div><div><dt>Lớp học</dt><dd>{classItem.code} · {classItem.name}</dd></div></>}
    </dl>
    {item.originalPersonId && <p className="work-hint">{item.kind === 'teacher' ? 'Dạy thế cho' : 'Làm thay cho'} {people.find(row => row.id === item.originalPersonId)?.name || item.originalPersonId}: {item.replacementReason}</p>}
    <section className="work-attendance-overview"><h3>Thông tin chấm công</h3><span className={`work-attendance-badge is-${status.tone}`}>{status.label}</span>{issues.length > 0 && <p className="work-warning">{issues.join(' · ')}</p>}<p className="work-hint">Nguồn ghi nhận: {record?.source === 'admin' ? 'Admin bổ sung / điều chỉnh' : record?.source === 'sample' ? 'Dữ liệu mẫu' : record ? 'Chấm công trực tiếp' : 'Chưa có bản ghi'}</p>{record?.note && <p className="work-hint">Ghi chú: {record.note}</p>}</section>
    <AttendanceEvidence label="Check-in" timestamp={record?.checkIn} evidence={record?.checkInEvidence} branch={branch} sample={record?.checkInEvidence?.sample || record?.source === 'sample'} />
    <AttendanceEvidence label="Check-out" timestamp={record?.checkOut} evidence={record?.checkOutEvidence} branch={branch} sample={record?.checkOutEvidence?.sample || record?.source === 'sample'} />
    {isAdmin && <label className="work-checkbox"><input type="checkbox" checked={manual} onChange={event => { setManual(event.target.checked); setError('') }} /> Admin bổ sung / điều chỉnh chấm công</label>}
    {manual && <>
      <Field label="Thời gian check-in"><input type="datetime-local" value={checkIn} onChange={event => setCheckIn(event.target.value)} /></Field>
      <Field label="Thời gian check-out"><input type="datetime-local" value={checkOut} onChange={event => setCheckOut(event.target.value)} /></Field>
      <Field label="Lý do bổ sung (bắt buộc)"><textarea required value={note} onChange={event => setNote(event.target.value)} /></Field>
    </>}
    {error && <p className="work-error" role="alert">{error}</p>}
    <footer>{isAdmin && <><button type="button" className="ui-button ui-button-danger" onClick={onDelete}>Xóa lịch</button><button type="button" className="ui-button" onClick={onEdit}>Sửa lịch</button></>}<button type="button" className="ui-button" onClick={onClose}>Đóng</button>{isAdmin && manual && <button type="submit" className="ui-button ui-button-primary">Lưu công bổ sung</button>}</footer>
  </form></WorkScheduleDialog>
}
