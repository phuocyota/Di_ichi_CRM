import { useState } from 'react'
import { ArrowLeftRight, Check, Plus, Repeat2, X } from 'lucide-react'
import { addDays, attendanceStatus, isWorkDayOff } from '../../services/workSchedule.js'
import { workEmployeeTypes } from '../../datas/workSchedules.js'
import { matchesWorkEmployeeType } from '../../services/workScheduleEmployees.js'
import TeacherSelect from './TeacherSelect.jsx'

const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật']
const shiftGroup = item => Number(item.start?.split(':')[0]) < 12 ? 'morning' : 'evening'
const groups = [{ id: 'morning', label: 'Ca sáng' }, { id: 'evening', label: 'Ca tối' }]

function ScheduleRow({ item, date, group, shifts, employees, record, disabled, onSave, onRemove, onDetail, onReplace }) {
  const [value, setValue] = useState(() => ({ employeeType: '', personId: '', shiftId: shifts[0]?.id || '', start: shifts[0]?.start || (group.id === 'morning' ? '07:30' : '13:30'), end: shifts[0]?.end || (group.id === 'morning' ? '14:30' : '19:30'), ...item }))
  const [state, setState] = useState(item?.id ? 'saved' : 'draft')
  const [error, setError] = useState('')
  const saving = state === 'saving'
  const persist = async next => {
    if (disabled || saving) return
    if (!next.start || !next.end || !next.employeeType || !next.personId) { setState('pending'); return }
    if (next.start >= next.end) { setState('error'); setError('Giờ kết thúc phải sau giờ bắt đầu.'); return }
    const shiftId = next.shiftId || shifts[0]?.id
    if (!shiftId) { setState('error'); setError('Chưa có cấu hình ca làm. Hãy thêm ca tại tab Quản lý ca làm.'); return }
    setState('saving')
    try { await onSave({ ...next, shiftId, date }); setState('saved'); setError('') } catch (cause) { setError(cause.message); setState('error') }
  }
  const change = (patch, autoSave = true) => {
    const next = { ...value, ...patch }
    setValue(next); setError(''); setState('pending')
    if (autoSave) void persist(next)
  }
  const choices = employees.filter(person => matchesWorkEmployeeType(person, value.employeeType))
  const personOptions = choices.some(person => person.id === value.personId) || !value.personId ? choices : [{ id: value.personId, name: value.personName || employees.find(person => person.id === value.personId)?.name || value.personId }, ...choices]
  const status = item?.id && attendanceStatus(item, record)
  return <div className="work-inline-row">
    <div className="work-inline-fields">
      <div className="work-inline-time-range">
        <input type="time" step="60" aria-label={`Giờ bắt đầu ngày ${date}`} value={value.start?.slice(0, 5) || ''} disabled={disabled || saving} onChange={event => change({ start: event.target.value }, false)} onBlur={() => { if (state === 'pending') void persist(value) }} />
        <span>–</span>
        <input type="time" step="60" aria-label={`Giờ kết thúc ngày ${date}`} value={value.end?.slice(0, 5) || ''} disabled={disabled || saving} onChange={event => change({ end: event.target.value }, false)} onBlur={() => { if (state === 'pending') void persist(value) }} />
      </div>
      <TeacherSelect people={workEmployeeTypes.map(type => ({ id: type.value, name: type.label }))} value={value.employeeType} onChange={employeeType => change({ employeeType, personId: '' })} placeholder="Chọn loại" searchLabel="Tìm loại nhân viên" searchPlaceholder="Tìm loại nhân viên..." emptyMessage="Không tìm thấy loại nhân viên." aria-label={`Loại nhân viên ngày ${date}`} disabled={disabled || saving} />
      <TeacherSelect people={personOptions} value={value.personId} onChange={personId => change({ personId })} placeholder="Chọn nhân viên" searchLabel="Tìm nhân viên" searchPlaceholder="Tìm tên, số điện thoại..." emptyMessage="Không tìm thấy nhân viên phù hợp." aria-label={`Nhân viên ngày ${date}`} disabled={disabled || saving || !value.employeeType} />
    </div>
    <div className="work-inline-actions">
      <span className={`work-inline-sync is-${state}`} role="status">{state === 'saving' ? 'Đang lưu...' : state === 'saved' ? <><Check size={12} /> Đã lưu</> : state === 'pending' ? 'Chưa lưu · Chọn đủ thông tin' : state === 'error' ? 'Chưa lưu' : 'Tự lưu khi chọn đủ thông tin'}</span>
      {item?.id && <><button type="button" onClick={() => onDetail(item)}><span className={`work-attendance-badge is-${status.tone}`}>{status.label}</span></button><button type="button" onClick={() => onReplace(item)}><Repeat2 size={13} /> Đổi nhân viên</button></>}
      {!item?.id && <button type="button" className="work-inline-remove" onClick={onRemove} aria-label={`Bỏ hàng chưa lưu ngày ${date}`}><X size={14} /></button>}
    </div>
    {error && <p className="work-inline-error" role="alert">{error}</p>}
  </div>
}

function DayShift({ date, group, items, shifts, employees, attendance, disabled, onSave, onDetail, onReplace }) {
  const [drafts, setDrafts] = useState(() => items.length ? [] : [crypto.randomUUID()])
  const remove = id => setDrafts(old => old.filter(value => value !== id))
  const rowProps = { date, group, shifts: shifts.filter(shift => shiftGroup(shift) === group.id), employees, disabled, onDetail, onReplace }
  return <div className="work-day-shift">
    {items.map(item => <ScheduleRow key={item.id} {...rowProps} item={item} record={attendance.find(record => record.assignmentId === item.id)} onSave={onSave} />)}
    {drafts.map(id => <ScheduleRow key={id} {...rowProps} onRemove={() => remove(id)} onSave={async value => { await onSave(value); remove(id) }} />)}
    <button type="button" className="work-inline-add" disabled={disabled} onClick={() => setDrafts(old => [...old, crypto.randomUUID()])} aria-label={`Thêm lịch ${group.label.toLowerCase()} ngày ${date}`}><Plus size={14} /> Thêm lịch</button>
  </div>
}

export default function WeeklySchedule({ week, branchId, people, availablePeople = people, assignments, shifts = [], allAssignments, preferences = [], attendance, disabled, onSave, onSetDayOff, onDetail, onReplace }) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(week, index))
  const employees = availablePeople.filter(person => person.kind === 'employee' && (person.catalogSource !== 'sample' || person.branchId === branchId))
  const activeShifts = shifts.filter(shift => !shift.deletedAt)
  const save = value => onSave({ ...value, kind: 'employee', branchId })
  return <div className="work-matrix">
    <div className="work-matrix-toolbar"><span><strong>{assignments.length} ca được phân</strong> · 7 ngày hiển thị · Tự động lưu</span><span><ArrowLeftRight size={15} /> Cuộn ngang để xem các ngày</span></div>
    <div className="work-matrix-scroll" tabIndex={0} role="region" aria-label="Lịch làm việc tuần, cuộn ngang để xem đủ 7 ngày">
      <table className="work-shift-matrix">
        <caption className="sr-only">Lịch làm việc theo ca; mỗi ngày có khung giờ, loại nhân viên và nhân viên</caption>
        <colgroup><col className="work-matrix-shift-col" />{days.map(date => <col key={date} className="work-matrix-day-col" />)}</colgroup>
        <thead><tr><th scope="col" rowSpan={2} className="work-matrix-shift">Ca</th>{days.map((date, index) => <th scope="col" key={date} className="work-matrix-day">{dayNames[index]}<small>{date.split('-').reverse().join('/')}</small></th>)}</tr>
          <tr>{days.map(date => <th key={date}><div className="work-inline-fields work-inline-labels"><span>Khung giờ</span><span>Loại nhân viên</span><span>Nhân viên</span></div></th>)}</tr></thead>
        <tbody>{groups.map(group => <tr key={group.id} className={group.id === 'evening' ? 'is-evening' : ''}><th scope="row" className="work-matrix-shift"><span>{group.label}</span></th>{days.map(date => <td key={date}><DayShift date={date} group={group} items={assignments.filter(item => item.date === date && shiftGroup(item) === group.id)} shifts={activeShifts} employees={employees} attendance={attendance} disabled={disabled} onSave={save} onDetail={onDetail} onReplace={onReplace} /></td>)}</tr>)}</tbody>
        <tfoot>{[true, false].map(off => <tr key={String(off)}><th scope="row" className="work-matrix-off-label">{off ? 'OFF · Nghỉ' : 'Chưa phân ca'}</th>{days.map(date => {
          const dayPeople = people.filter(person => off
            ? isWorkDayOff(preferences, person.id, date)
            : !isWorkDayOff(preferences, person.id, date) && !allAssignments.some(item => item.personId === person.id && item.date === date))
          return <td key={date}>{dayPeople.length ? dayPeople.map(person => <div className={`work-matrix-day-person ${off ? 'is-off' : 'is-unassigned'}`} key={person.id}>
            <span>{person.name}<small>{off ? 'OFF · Nghỉ đã đánh dấu' : 'Chưa được phân ca'}</small></span>
            <button type="button" disabled={disabled} onClick={() => onSetDayOff(person, date, !off)} aria-label={`${off ? 'Bỏ OFF' : 'Đánh dấu OFF'} cho ${person.name} ngày ${date}`}>{off ? 'Bỏ OFF' : 'Đánh dấu OFF'}</button>
          </div>) : <span className="work-matrix-muted">{off ? 'Chưa có nhân viên OFF' : 'Không có nhân viên chưa phân ca'}</span>}</td>
        })}</tr>)}</tfoot>
      </table>
    </div>
    <p className="work-report-note">OFF là ngày nghỉ được đánh dấu cho nhân viên tại tất cả cơ sở. Ngày không có ca và chưa đánh dấu OFF được hiển thị là “Chưa phân ca”. Bỏ OFF trước khi phân ca; ca làm ở cơ sở khác vẫn được tính là đã phân ca.</p>
  </div>
}
