import { useWorkScheduleSnapshot } from '../../services/workScheduleApi.js'
import { normalizeWorkSearch } from '../../services/workScheduleContract.js'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, UserCheck, AlertTriangle, Info } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import WorkTimeGrid from '../../components/WorkSchedule/WorkTimeGrid.jsx'
import WorkAttendanceTable from '../../components/WorkSchedule/WorkAttendanceTable.jsx'
import ScheduleFilters from '../../components/WorkSchedule/ScheduleFilters.jsx'
import AttendanceDialog from '../../components/WorkSchedule/AttendanceDialog.jsx'
import useWorkScheduleEmployees from '../../components/WorkSchedule/useWorkScheduleEmployees.js'
import { addDays, weekStart, workAlerts } from '../../services/workSchedule.js'
import './WorkSchedulePage.css'

/**
 * CRM chỉ xem phân lịch nhân viên: lịch tuần, thống kê, chấm công, nhật ký.
 * Phân ca / ngày nghỉ / chấm công bổ sung do nhân sự có vai trò "Nhân sự phân lịch" thực hiện trên HRM;
 * backend từ chối mọi thao tác ghi của quản trị viên.
 */
export default function WorkSchedulePage() {
  const [week, setWeek] = useState(weekStart)
  const [employeeBranchId, setEmployeeBranch] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [actor] = useState(() => { try { return JSON.parse(localStorage.getItem('ec_admin_user')) || {} } catch { return {} } })
  const scheduleApi = useWorkScheduleSnapshot(!modal, true, { branchId: employeeBranchId || actor.branchId, fromDate: week, toDate: addDays(week, 6), search })
  const data = scheduleApi.data
  const employeeCatalog = useWorkScheduleEmployees(!modal)
  const directoryPeople = employeeCatalog.employees
  const branches = employeeCatalog.branches.filter(branch => branch.id === (data.branchId || actor.branchId))
  const branchId = branches.some(item => item.id === employeeBranchId) ? employeeBranchId : branches[0]?.id || ''
  const shifts = scheduleApi.configuration?.shifts || []
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])
  const end = addDays(week, 6)
  const currentView = data.view?.fromDate === week && data.view?.toDate === end && data.view?.search === search.trim() ? data.view : undefined
  const matchingAssignments = currentView ? new Set(currentView.assignmentIds) : null
  const matchingPeople = currentView?.personIds ? new Set(currentView.personIds) : null
  const assignments = data.assignments.filter(item => item.branchId === branchId && item.kind === 'employee' && item.date >= week && item.date <= end && (!matchingAssignments || matchingAssignments.has(item.id)))
  const people = directoryPeople.filter(person => person.kind === 'employee' && (!matchingPeople || matchingPeople.has(person.id)) && (person.branchId === branchId || assignments.some(item => item.personId === person.id) || data.preferences.some(item => item.shiftId === 'OFF' && item.personId === person.id && item.branchId === branchId && item.date >= week && item.date <= end)) && normalizeWorkSearch(person.name).includes(normalizeWorkSearch(search)))
  const peopleIds = new Set(people.map(person => person.id))
  const visible = assignments.filter(item => peopleIds.has(item.personId))
  const alerts = useMemo(() => workAlerts(data, now, directoryPeople), [data, now, directoryPeople]).filter(item => item.branchId === branchId && item.date >= week && item.date <= end && peopleIds.has(item.personId))
  const confirmed = visible.filter(item => { const record = data.attendance.find(row => row.assignmentId === item.id); return record?.checkIn && record?.checkOut }).length
  const dayOffs = data.preferences.filter(item => item.shiftId === 'OFF' && item.branchId === branchId && item.date >= week && item.date <= end && peopleIds.has(item.personId))
  const decorated = visible.map(item => ({ ...item, shiftName: shifts.find(shift => shift.id === item.shiftId)?.name }))
  const branchName = branches.find(item => item.id === branchId)?.name || 'chưa chọn cơ sở'
  const scheduleTitle = branchId ? `Lịch tuần · ${branchName}` : 'Lịch làm việc trong tuần'
  return <div className="work-page space-y-5">
    {scheduleApi.loading && <p role="status">Đang tải phân lịch từ máy chủ…</p>}
    {scheduleApi.error && <div className="work-error" role="alert">{scheduleApi.error} <button onClick={scheduleApi.reload}>Tải lại</button></div>}
    <PageHeader title="Lịch làm việc" description="Theo dõi lịch tuần, ca làm và chấm công tại trung tâm." />
    <p className="work-hint" role="note"><Info size={14} className="inline" /> Phân lịch nhân sự được thực hiện trên ứng dụng HRM bởi tài khoản có vai trò "Nhân sự phân lịch". CRM chỉ xem.</p>
    {employeeCatalog.refreshError && <div className="work-error" role="alert">Chưa cập nhật được dữ liệu mới: {employeeCatalog.refreshError}. Đang hiển thị dữ liệu đã tải. <button type="button" className="ui-button" onClick={employeeCatalog.reload}>Thử lại</button></div>}
    {scheduleApi.configurationError && <div className="work-error" role="alert">Không tải được ca làm: {scheduleApi.configurationError} <button type="button" className="ui-button" onClick={scheduleApi.reload}>Thử lại</button></div>}
    {employeeCatalog.loading && <p className="work-hint" role="status">Đang tải nhân viên, cơ sở và vai trò…</p>}
    {employeeCatalog.error && <div className="work-error" role="alert">Không tải được nhân viên / cơ sở: {employeeCatalog.error} <button type="button" className="ui-button" onClick={employeeCatalog.reload}>Thử lại</button></div>}
    {!employeeCatalog.loading && !employeeCatalog.error && !employeeCatalog.branches.length && <p className="work-hint">Chưa có cơ sở trong dữ liệu API.</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Ca được phân" value={visible.length} description={`${people.length} nhân viên trong danh sách`} icon={CalendarDays} color="blue" />
      <StatCard label="Ca đã chấm công" value={confirmed} description="Có đủ check-in và check-out" icon={UserCheck} color="emerald" />
      <StatCard label="Đi trễ / về sớm" value={`${alerts.filter(item => item.type === 'Đi trễ').length} / ${alerts.filter(item => item.type === 'Về sớm').length}`} description="Số lần ghi nhận trong tuần" icon={Clock3} color="amber" />
      <StatCard label="Quên chấm công" value={alerts.filter(item => item.type === 'Quên chấm công').length} description="Thiếu check-in/out khi hết lịch" icon={AlertTriangle} color="red" />
    </div>
    <section className="work-panel work-schedule-panel" aria-label="Lịch phân ca tuần"><div className="work-section-heading"><div><h2>{scheduleTitle}</h2><p>Chỉ xem · Phân ca theo ngày</p></div><span className="work-schedule-period">{week.split('-').reverse().join('/')} — {end.split('-').reverse().join('/')}</span></div><div className="work-timetable-filters"><ScheduleFilters week={week} onWeekChange={setWeek} branches={branches} branchId={branchId} onBranchChange={setEmployeeBranch} search={search} onSearchChange={setSearch} /></div>
      <WorkTimeGrid readOnly revision={data.revision} editing={Boolean(modal)} disabled={scheduleApi.loading || Boolean(scheduleApi.error) || !branchId} shifts={shifts} week={week} people={people} assignments={decorated} attendance={data.attendance} preferences={dayOffs} onDetail={item => setModal({ type: 'attendance', item })} />
    </section>
    {data.audit.length > 0 && <details className="work-panel p-4"><summary className="cursor-pointer text-sm font-semibold">Nhật ký thay đổi ({data.audit.length})</summary><div className="work-audit">{data.audit.slice().reverse().map(item => <p key={item.id}>{new Date(item.at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · {item.actor} · {item.action}{typeof item.detail?.off === 'boolean' ? ' · ' + item.detail.personName + ' · ' + item.detail.date.split('-').reverse().join('/') : ''}{item.detail?.after?.replacementReason ? ` · ${item.detail.after.replacementReason}` : ''}</p>)}</div></details>}
    <WorkAttendanceTable key={`${week}-${branchId}`} fromDate={week} toDate={end} assignments={data.assignments.filter(item => item.branchId === branchId && item.kind === 'employee' && peopleIds.has(item.personId))} attendance={data.attendance} people={directoryPeople} onDetail={item => setModal({ type: 'attendance', item })} />
    {/* isAdmin=false: chỉ xem chi tiết chấm công, không sửa/xóa lịch hay bổ sung công. */}
    {modal?.type === 'attendance' && <AttendanceDialog item={modal.item} record={data.attendance.find(item => item.assignmentId === modal.item.id)} branch={branches.find(item => item.id === modal.item.branchId) || { id: modal.item.branchId, name: 'Cơ sở không còn trong danh sách' }} people={directoryPeople} isAdmin={false} onClose={() => setModal(null)} />}
  </div>
}
