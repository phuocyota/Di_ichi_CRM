import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchInput } from '../common/ui.jsx'
import { addDays, weekStart } from '../../services/workSchedule.js'

export default function ScheduleFilters({ week, onWeekChange, branches, branchId, onBranchChange, search, onSearchChange, teacher = false }) {
  const end = addDays(week, 6)
  return <div className="work-toolbar">
    <div className="work-week">
      <button className="ui-button ui-icon-button" aria-label="Tuần trước" onClick={() => onWeekChange(addDays(week, -7))}><ChevronLeft size={17} /></button>
      <label className="work-week-picker"><CalendarDays size={16} aria-hidden="true" /><span className="sr-only">Chọn tuần</span>
        <input aria-label="Chọn tuần" type="date" value={week} onChange={event => event.target.value && onWeekChange(weekStart(event.target.value))} />
        <span aria-hidden="true" className="work-week-display">{week.split('-').reverse().join('/')} – {end.split('-').reverse().join('/')}</span>
      </label>
      <button className="ui-button ui-icon-button" aria-label="Tuần sau" onClick={() => onWeekChange(addDays(week, 7))}><ChevronRight size={17} /></button>
      <button className="ui-button" onClick={() => onWeekChange(weekStart())}>Tuần này</button>
    </div>
    <label className="work-branch"><span className="sr-only">Cơ sở</span><select aria-label="Cơ sở" disabled={!branches.length} value={branchId} onChange={event => onBranchChange(event.target.value)}>{!branches.length && <option value="">Chưa có cơ sở</option>}{branches.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <SearchInput value={search} onChange={onSearchChange} placeholder={teacher ? 'Tìm tên giáo viên…' : 'Tìm tên nhân sự…'} label={teacher ? 'Tìm giáo viên trong lịch' : 'Tìm nhân sự'} />
  </div>
}
