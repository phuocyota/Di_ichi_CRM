import { Plus, Repeat2 } from 'lucide-react'
import { workPeople } from '../../datas/workSchedules.js'
import { createWeekTimetableLayout } from '../../services/workScheduleLayout.js'
import AttendanceSummary from './AttendanceSummary.jsx'
import ScheduleTimeGroups from './ScheduleTimeGroups.jsx'

export default function TeacherTimetable({ week, assignments, classes, attendance, onAdd, onDetail, onReplace }) {
  const { days, minWidth } = createWeekTimetableLayout(assignments, week)
  return <div className="work-calendar-scroll"><table className="work-calendar work-day-calendar work-teacher-calendar" style={{ minWidth }}>
    <caption className="sr-only">Thời khóa biểu giáo viên theo ngày tại cơ sở đang chọn</caption>
    <colgroup>{days.map(day => <col key={day.date} style={{ width: day.width }} />)}</colgroup>
    <thead><tr>{days.map(({ date }, index) => <th scope="col" key={date}>{index === 6 ? 'Chủ nhật' : `Thứ ${index + 2}`}<small>{date.split('-').reverse().join('/')}</small></th>)}</tr></thead>
    <tbody><tr>{days.map(({ date, groups }) => {
      return <td key={date}><ScheduleTimeGroups groups={groups}>{item => {
        const person = workPeople.find(row => row.id === item.personId)
        const classItem = classes.find(row => row.id === item.classId)
        const record = attendance.find(row => row.assignmentId === item.id)
        return <article key={item.id} className="work-slot is-lesson">
          <button className="work-slot-main" onClick={() => onDetail(item)}>
            <strong>{item.start} – {item.end}</strong>
            <span className="work-lesson-teacher">{person?.name}</span>
            <span>{classItem?.code || item.classCode || item.classId}</span>
            <small>{classItem?.name || item.className || 'Lớp không còn trong danh sách'}</small>
            <small>{item.periods} tiết{item.originalPersonId ? ' · Dạy thế' : ''}</small>
          </button>
          <AttendanceSummary item={item} record={record} onDetail={onDetail} />
          <button className="work-replace" aria-label={`Thay giáo viên lớp ${classItem?.code || item.classCode || item.classId} ngày ${date}`} onClick={() => onReplace(item)}><Repeat2 size={13} /> Dạy thế</button>
        </article>
      }}</ScheduleTimeGroups>
        {!groups.length && <span className="work-off">Chưa có lịch dạy</span>}
        <button className="work-add" aria-label={`Phân lịch giáo viên ngày ${date}`} onClick={() => onAdd(undefined, date)}><Plus size={13} /> Phân lịch</button>
      </td>
    })}</tr></tbody>
  </table></div>
}
