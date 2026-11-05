import { Plus, Repeat2 } from 'lucide-react'
import { createWeekTimetableLayout } from '../../services/workScheduleLayout.js'
import AttendanceSummary from './AttendanceSummary.jsx'
import ScheduleTimeGroups from './ScheduleTimeGroups.jsx'

export default function WeeklySchedule({ week, people, assignments, allAssignments, attendance, onAdd, onDetail, onReplace }) {
  const { days, minWidth } = createWeekTimetableLayout(assignments, week)
  return <div className="work-calendar-scroll"><table className="work-calendar work-day-calendar work-employee-calendar" style={{ minWidth }}>
    <caption className="sr-only">Lịch nhân viên theo ngày tại cơ sở đang chọn. Chọn ca để xem chi tiết hoặc bổ sung công.</caption>
    <colgroup>{days.map(day => <col key={day.date} style={{ width: day.width }} />)}</colgroup>
    <thead><tr>{days.map(({ date }, index) => <th scope="col" key={date}>{index === 6 ? 'Chủ nhật' : `Thứ ${index + 2}`}<small>{date.split('-').reverse().join('/')}</small></th>)}</tr></thead>
    <tbody><tr>{days.map(({ date, groups }) => {
      const peopleOff = people.filter(person => allAssignments.some(item => item.personId === person.id && item.date >= week && item.date <= days[6].date) && !allAssignments.some(item => item.personId === person.id && item.date === date))
      return <td key={date}><ScheduleTimeGroups groups={groups}>{item => {
        const person = people.find(row => row.id === item.personId)
        const record = attendance.find(row => row.assignmentId === item.id)
        return <article key={item.id} className="work-slot">
          <button type="button" className="work-slot-main" onClick={() => onDetail(item)}>
            <strong>{item.start} – {item.end}</strong>
            <span className="work-lesson-teacher">{person?.name}</span>
            <span>{item.shiftName || 'Ca làm việc'}</span>
            <small>{item.personRole || person?.role}{item.originalPersonId ? ' · Làm thay' : ''}</small>
          </button>
          <AttendanceSummary item={item} record={record} onDetail={onDetail} />
          <button type="button" className="work-replace" aria-label={`Đổi nhân viên ca ${item.start} ngày ${date}`} onClick={() => onReplace(item)}><Repeat2 size={13} /> Đổi nhân viên</button>
        </article>
      }}</ScheduleTimeGroups>
        {!groups.length && <span className="work-off">Chưa có ca làm</span>}
        {peopleOff.map(person => <div className="work-employee-off" key={person.id}><strong>{person.name}</strong><span>OFF · Nghỉ</span></div>)}
        <button type="button" className="work-add" aria-label={`Phân lịch nhân viên ngày ${date}`} onClick={() => onAdd(undefined, date)}><Plus size={13} /> Phân lịch</button>
      </td>
    })}</tr></tbody>
  </table></div>
}
