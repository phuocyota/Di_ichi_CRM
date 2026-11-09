import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, UserCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { ConfirmDialog } from '../../components/common/ui.jsx'
import WeeklySchedule from '../../components/WorkSchedule/WeeklySchedule.jsx'
import WorkAttendanceTable from '../../components/WorkSchedule/WorkAttendanceTable.jsx'
import ShiftManagement from '../../components/WorkSchedule/ShiftManagement.jsx'
import useWorkShifts from '../../components/WorkSchedule/useWorkShifts.js'
import TeacherTimetable from '../../components/WorkSchedule/TeacherTimetable.jsx'
import ScheduleFilters from '../../components/WorkSchedule/ScheduleFilters.jsx'
import AssignmentForm from '../../components/WorkSchedule/AssignmentForm.jsx'
import AttendanceDialog from '../../components/WorkSchedule/AttendanceDialog.jsx'
import TeacherSelect from '../../components/WorkSchedule/TeacherSelect.jsx'
import useWorkScheduleCatalog from '../../components/WorkSchedule/useWorkScheduleCatalog.js'
import useWorkScheduleEmployees from '../../components/WorkSchedule/useWorkScheduleEmployees.js'
import { matchesWorkEmployeeType, withWorkEmployeeSamples } from '../../services/workScheduleEmployees.js'
import { classMatchesWorkBranch } from '../../services/workScheduleCatalog.js'
import { workPeople, workTabs, workEmployeeTypes } from '../../datas/workSchedules.js'
import { addDays, attendanceIssues, loadWorkSchedule, saveWorkSchedule, setWorkDayOff, upsertWorkAssignment, removeWorkAssignment, weekStart, workAlerts, WORK_SCHEDULE_KEY } from '../../services/workSchedule.js'
import './WorkSchedulePage.css'

export default function WorkSchedulePage() {
  const [data, setData] = useState(loadWorkSchedule)
  const [tab, setTab] = useState('employee')
  const [week, setWeek] = useState(weekStart)
  const [employeeBranchId, setEmployeeBranch] = useState('')
  const [teacherBranchId, setTeacherBranch] = useState('')
  const [search, setSearch] = useState('')
  const [teacherId, setTeacher] = useState('')
  const [employeeId, setEmployee] = useState('')
  const [modal, setModal] = useState(null)
  const catalog = useWorkScheduleCatalog(!modal, { load: tab === 'teacher' })
  const employeeCatalog = useWorkScheduleEmployees(!modal)
  const employeeDirectory = useMemo(() => withWorkEmployeeSamples({ employees: employeeCatalog.employees, branches: employeeCatalog.branches }, data.assignments), [employeeCatalog.employees, employeeCatalog.branches, data.assignments])
  const directoryPeople = useMemo(() => [...workPeople.filter(person => person.kind === 'teacher'), ...employeeDirectory.employees], [employeeDirectory.employees])
  const branches = tab === 'teacher' ? catalog.branches : employeeCatalog.branches
  const chosenBranchId = tab === 'teacher' ? teacherBranchId : employeeBranchId
  const branchId = branches.some(item => item.id === chosenBranchId) ? chosenBranchId : branches[0]?.id || ''
  const shiftApi = useWorkShifts(branchId)
  const shifts = shiftApi.snapshot?.shifts || []
  const setBranch = tab === 'teacher' ? setTeacherBranch : setEmployeeBranch
  const [now, setNow] = useState(Date.now)
  const [showAlerts, setShowAlerts] = useState(false)
  const [actor] = useState(() => { try { return JSON.parse(localStorage.getItem('ec_admin_user')) || {} } catch { return {} } })
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(actor.role)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    const sync = () => setData(loadWorkSchedule())
    const storage = event => { if (event.key === WORK_SCHEDULE_KEY) sync() }
    window.addEventListener('storage', storage)
    return () => { clearInterval(timer); window.removeEventListener('storage', storage) }
  }, [])
  const end = addDays(week, 6)
  const requestedPersonId = tab === 'teacher' ? teacherId : employeeId
  const selectedPersonId = directoryPeople.some(person => person.kind === tab && person.id === requestedPersonId && (person.catalogSource !== 'sample' || person.kind === 'teacher' || person.branchId === branchId)) ? requestedPersonId : ''
  const assignments = data.assignments.filter(item => item.branchId === branchId && item.kind === tab && item.date >= week && item.date <= end)
  const people = directoryPeople.filter(person => person.kind === tab && (!selectedPersonId || person.id === selectedPersonId) && (person.kind === 'teacher' || person.id === employeeId || person.branchId === branchId || assignments.some(item => item.personId === person.id) || data.preferences.some(item => item.shiftId === 'OFF' && item.personId === person.id && item.branchId === branchId && item.date >= week && item.date <= end)) && `${person.name} ${person.role}`.toLowerCase().includes(search.toLowerCase()))
  const peopleIds = new Set(people.map(person => person.id))
  const visible = assignments.filter(item => peopleIds.has(item.personId))
  const alerts = useMemo(() => workAlerts(data, now, directoryPeople), [data, now, directoryPeople]).filter(item => item.branchId === branchId && item.date >= week && item.date <= end && peopleIds.has(item.personId))
  const completed = visible.filter(item => { const record = data.attendance.find(row => row.assignmentId === item.id); return record?.checkIn && record?.checkOut })
  const total = visible.reduce((sum, item) => sum + (tab === 'teacher' ? item.periods : 1), 0)
  const confirmed = completed.reduce((sum, item) => sum + (tab === 'teacher' ? item.periods : 1), 0)
  const commit = (next, message, { silent = false } = {}) => {
    const nextData = next
    try { saveWorkSchedule(nextData) } catch { throw new Error('Không lưu được dữ liệu trên trình duyệt. Bộ nhớ có thể đã đầy; hãy giảm số ảnh lưu hoặc kiểm tra quyền lưu trữ.') }
    setData(nextData); setModal(null); if (!silent) toast.success(message)
  }
  const audit = (action, detail) => [...data.audit, { id: crypto.randomUUID(), action, detail, actor: actor.name || 'Quản trị viên', at: new Date().toISOString() }]
  const add = (person, date = week, defaults = {}) => {
    if (tab === 'teacher' && (catalog.loading || catalog.error)) return toast.error('Vui lòng tải danh sách khóa học / lớp học trước khi phân lịch.')
    if (tab === 'employee' && (employeeCatalog.loading || employeeCatalog.error)) return toast.error('Vui lòng tải danh sách nhân viên / cơ sở trước khi phân lịch.')
    if (shiftApi.loading || shiftApi.error) return toast.error('Vui lòng tải cấu hình ca làm từ máy chủ trước khi phân lịch.')
    if (!branchId) return toast.error('Chưa có cơ sở để phân lịch.')
    const selectedPerson = person || directoryPeople.find(item => item.id === selectedPersonId)
    setModal({ type: 'assignment', item: { ...defaults, personId: selectedPerson?.id || '', kind: tab, branchId, date } })
  }
  const saveAssignment = (value, { silent = false } = {}) => {
    const existing = data.assignments.find(item => item.id === value.id)
    let candidate = { ...value, id: value.id || crypto.randomUUID() }
    if (candidate.kind === 'teacher') {
      if (catalog.loading || catalog.error) throw new Error('Chưa tải được danh sách khóa học / lớp học từ API. Vui lòng thử lại.')
      const classItem = catalog.classes.find(item => item.id === candidate.classId && classMatchesWorkBranch(item, candidate.branchId))
      if (!classItem) throw new Error('Chọn lớp thuộc chi nhánh đang phân lịch.')
      if ((classItem.startDate && candidate.date < classItem.startDate) || (classItem.endDate && candidate.date > classItem.endDate)) throw new Error(`Ngày dạy nằm ngoài thời gian hoạt động của lớp (${classItem.startDate ? classItem.startDate.split('-').reverse().join('/') : 'chưa có ngày bắt đầu'} – ${classItem.endDate ? classItem.endDate.split('-').reverse().join('/') : 'chưa có ngày kết thúc'}).`)
      if (!Number.isInteger(candidate.periods) || candidate.periods < 1 || candidate.periods > 12) throw new Error('Số tiết phải là số nguyên từ 1 đến 12.')
      candidate = { ...candidate, catalogSource: 'api', classCode: classItem.code, className: classItem.name, courseId: classItem.courseId, courseName: catalog.courses.find(item => item.id === classItem.courseId)?.name || '' }
    } else {
      if (employeeCatalog.loading || employeeCatalog.error) throw new Error('Chưa tải được danh sách nhân viên / cơ sở từ API. Vui lòng thử lại.')
      const employee = employeeDirectory.employees.find(person => person.id === candidate.personId)
      if (!workEmployeeTypes.some(type => type.value === candidate.employeeType) || !matchesWorkEmployeeType(employee, candidate.employeeType)) throw new Error('Chọn nhân viên đúng loại CSKH hoặc Sale.')
      if (employee.catalogSource === 'sample' && employee.branchId !== candidate.branchId) throw new Error('Chọn nhân viên mẫu thuộc cơ sở đang phân lịch.')
      if (!employeeCatalog.branches.some(branch => branch.id === candidate.branchId)) throw new Error('Chọn cơ sở hợp lệ từ API.')
      const shift = shifts.find(item => !item.deletedAt && item.id === candidate.shiftId && item.branchId === candidate.branchId)
      if (!shift) throw new Error('Chọn ca hợp lệ của chi nhánh.')
      candidate = { ...candidate, catalogSource: employee.catalogSource, personName: employee.name, personRole: workEmployeeTypes.find(type => type.value === candidate.employeeType).label, start: candidate.start || shift.start, end: candidate.end || shift.end }
    }
    if (modal?.replacement) {
      if (candidate.personId === existing.personId) throw new Error(candidate.kind === 'teacher' ? 'Hãy chọn giáo viên khác để dạy thế.' : 'Hãy chọn nhân viên khác để làm thay.')
      if (!candidate.replacementReason?.trim()) throw new Error('Cần nhập lý do thay thế.')
      candidate.originalPersonId = existing.originalPersonId || existing.personId
    }
    const next = upsertWorkAssignment(data, candidate)
    commit({ ...next, audit: audit(modal?.replacement ? candidate.kind === 'teacher' ? 'Thay giáo viên' : 'Đổi nhân viên làm thay' : existing ? 'Sửa lịch mẫu' : 'Thêm lịch mẫu', { before: existing, after: candidate, attendanceBefore: data.attendance.find(record => record.assignmentId === candidate.id) }) }, 'Đã lưu phân lịch tuần', { silent })
  }
  const changeDayOff = (person, date, off) => {
    if (employeeCatalog.loading || employeeCatalog.error || !branchId) return toast.error('Vui lòng tải danh sách nhân viên / cơ sở trước khi đánh dấu OFF.')
    try {
      const next = setWorkDayOff(data, { personId: person.id, date, branchId }, off)
      commit({ ...next, audit: audit(off ? 'Đánh dấu OFF' : 'Bỏ OFF', { personId: person.id, personName: person.name, date, branchId, off }) }, (off ? 'Đã đánh dấu OFF' : 'Đã bỏ OFF') + ' cho ' + person.name + ' ngày ' + date.split('-').reverse().join('/'))
    } catch (cause) { toast.error(cause.message) }
  }
  const decorated = visible.map(item => ({ ...item, shiftName: shifts.find(shift => shift.id === item.shiftId)?.name }))
  const branchName = branches.find(item => item.id === branchId)?.name || 'chưa chọn cơ sở'
  const filters = <ScheduleFilters week={week} onWeekChange={setWeek} branches={branches} branchId={branchId} onBranchChange={setBranch} search={search} onSearchChange={setSearch} teacher={tab === 'teacher'} />
  const scheduleTitle = branchId ? `${tab === 'teacher' ? 'Lịch dạy' : 'Lịch làm việc'} ở ${branchName} từ ngày ${week.split('-').reverse().join('/')} tới ngày ${end.split('-').reverse().join('/')}` : tab === 'teacher' ? 'Lịch dạy trong tuần' : 'Lịch làm việc trong tuần'
  return <div className="work-page space-y-5">
    <PageHeader title="Lịch làm việc" description="Điều phối lịch tuần, theo dõi ca làm và chấm công tại trung tâm." tabs={workTabs} activeTab={tab} onTabChange={setTab} />
    <div className="work-demo"><span>Lịch & chấm công mẫu</span> Nhân viên, cơ sở và cấu hình ca làm lấy từ API; bổ sung người có nhãn “(mẫu)” khi thiếu loại CSKH / Sale. Lịch phân công và chấm công vẫn dùng dữ liệu mẫu lưu trên trình duyệt.</div>
    {employeeCatalog.refreshError && <div className="work-error" role="alert">Chưa cập nhật được dữ liệu mới: {employeeCatalog.refreshError}. Đang hiển thị dữ liệu đã tải. <button type="button" className="ui-button" onClick={employeeCatalog.reload}>Thử lại</button></div>}
    {shiftApi.refreshError && <div className="work-error" role="alert">Chưa cập nhật được ca làm: {shiftApi.refreshError}. Đang hiển thị lần tải thành công gần nhất. <button type="button" className="ui-button" onClick={shiftApi.reload}>Thử lại</button></div>}
    {tab === 'shifts' ? <ShiftManagement branches={branches} branchId={branchId} onBranchChange={setBranch} shifts={shifts} revision={shiftApi.snapshot?.revision} saved={shiftApi.snapshot?.saved} saving={shiftApi.saving} loading={employeeCatalog.loading || shiftApi.loading} error={employeeCatalog.error || shiftApi.error} onReload={() => { employeeCatalog.reload(); shiftApi.reload() }} onSave={async (values, revision) => {
      await shiftApi.save(values, revision)
      toast.success('Đã lưu ca làm trên máy chủ')
    }} /> : <>
    {shiftApi.loading && <p className="work-hint" role="status">Đang tải cấu hình ca làm…</p>}
    {shiftApi.error && <div className="work-error" role="alert">Không tải được ca làm: {shiftApi.error} <button type="button" className="ui-button" onClick={shiftApi.reload}>Thử lại</button></div>}
    {tab === 'teacher' && catalog.loading && <p className="work-hint" role="status">Đang tải khóa học, lớp học và cơ sở…</p>}
    {tab === 'teacher' && catalog.error && <div className="work-error" role="alert">Không tải được khóa học / lớp học: {catalog.error} <button type="button" className="ui-button" onClick={catalog.reload}>Thử lại</button></div>}
    {tab === 'teacher' && !catalog.loading && !catalog.error && !catalog.branches.length && <p className="work-hint">Chưa có cơ sở trong dữ liệu API.</p>}
    {tab === 'employee' && employeeCatalog.loading && <p className="work-hint" role="status">Đang tải nhân viên, cơ sở và vai trò…</p>}
    {tab === 'employee' && employeeCatalog.error && <div className="work-error" role="alert">Không tải được nhân viên / cơ sở: {employeeCatalog.error} <button type="button" className="ui-button" onClick={employeeCatalog.reload}>Thử lại</button></div>}
    {tab === 'employee' && !employeeCatalog.loading && !employeeCatalog.error && !employeeCatalog.branches.length && <p className="work-hint">Chưa có cơ sở trong dữ liệu API.</p>}
    {tab === 'employee' && !employeeCatalog.loading && !employeeCatalog.error && employeeCatalog.unclassified.length > 0 && <p className="work-hint">Có {employeeCatalog.unclassified.length} nhân viên chưa có thông tin phân loại CSKH / Sale trong vai trò hoặc chức vụ, nên chưa xuất hiện trong danh sách phân lịch.</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={tab === 'teacher' ? 'Tiết dạy được phân' : 'Ca được phân'} value={total} description={`${people.length} ${tab === 'teacher' ? 'giáo viên' : 'nhân viên'} trong danh sách`} icon={CalendarDays} color="blue" />
      <StatCard label={tab === 'teacher' ? 'Tiết đã chấm công' : 'Ca đã chấm công'} value={confirmed} description="Có đủ check-in và check-out" icon={UserCheck} color="emerald" />
      <StatCard label="Đi trễ / về sớm" value={`${alerts.filter(item => item.type === 'Đi trễ').length} / ${alerts.filter(item => item.type === 'Về sớm').length}`} description="Số lần ghi nhận trong tuần" icon={Clock3} color="amber" onClick={() => setShowAlerts(true)} />
      <StatCard label="Quên chấm công" value={alerts.filter(item => item.type === 'Quên chấm công').length} description="Thiếu check-in/out khi hết lịch" icon={AlertTriangle} color="red" onClick={() => setShowAlerts(true)} />
    </div>
    <section className="work-panel"><div className="work-timetable-filters">{filters}</div><div className="work-section-heading"><div><h2>{scheduleTitle}</h2><p>{tab === 'teacher' ? 'Phân theo lớp thực tế · Chấm công theo tiết · Hỗ trợ dạy thế' : 'Phân ca theo ngày · Tối thiểu 1 ngày OFF / tuần'}</p></div><div className="flex flex-wrap gap-2"><div className="work-teacher-filter"><TeacherSelect people={directoryPeople.filter(person => person.kind === tab && (person.catalogSource !== 'sample' || person.kind === 'teacher' || person.branchId === branchId))} value={selectedPersonId} onChange={tab === 'teacher' ? setTeacher : setEmployee} placeholder={tab === 'teacher' ? 'Tất cả giáo viên' : 'Tất cả nhân viên'} searchLabel={tab === 'teacher' ? 'Tìm giáo viên' : 'Tìm nhân viên'} searchPlaceholder={tab === 'teacher' ? 'Tìm giáo viên...' : 'Tìm nhân viên...'} emptyMessage={tab === 'teacher' ? 'Không tìm thấy giáo viên.' : 'Không tìm thấy nhân viên.'} required={false} aria-label={tab === 'teacher' ? 'Lọc lịch theo giáo viên' : 'Lọc lịch theo nhân viên'} /></div><button className="ui-button" aria-expanded={showAlerts} onClick={() => setShowAlerts(value => !value)}>Cảnh báo ({alerts.length})</button></div></div>
      {tab === 'teacher' ? <TeacherTimetable week={week} assignments={decorated} classes={catalog.classes} attendance={data.attendance} onAdd={add} onDetail={item => setModal({ type: 'attendance', item })} onReplace={item => setModal({ type: 'assignment', replacement: true, item })} /> : <WeeklySchedule key={`${week}-${branchId}-${selectedPersonId}-${search}`} branchId={branchId} availablePeople={directoryPeople} disabled={employeeCatalog.loading || Boolean(employeeCatalog.error) || shiftApi.loading || Boolean(shiftApi.error) || !branchId} onSave={value => saveAssignment(value, { silent: true })} shifts={shifts} week={week} people={people} assignments={decorated} allAssignments={data.assignments} preferences={data.preferences} onSetDayOff={changeDayOff} attendance={data.attendance} onAdd={add} onDetail={item => setModal({ type: 'attendance', item })} onReplace={item => setModal({ type: 'assignment', replacement: true, item })} />}
    </section>
    {showAlerts && <section className="work-panel"><div className="work-section-heading"><div><h2>Cảnh báo & thống kê chấm công</h2><p>Cập nhật mỗi 30 giây · Theo tuần, chi nhánh và danh sách đang lọc</p></div></div><div className="work-calendar-scroll"><table className="work-report"><thead><tr><th>Nhân sự</th><th>Đi trễ</th><th>Về sớm</th><th>Quên công</th></tr></thead><tbody>{people.map(person => <tr key={person.id}><td>{person.name}</td>{['Đi trễ', 'Về sớm', 'Quên chấm công'].map(type => <td key={type}>{alerts.filter(item => item.personId === person.id && item.type === type).length}</td>)}</tr>)}</tbody></table></div><div className="work-alert-list">{alerts.length ? alerts.map(alert => <button key={alert.id} onClick={() => setModal({ type: 'attendance', item: data.assignments.find(item => item.id === alert.assignmentId) })}><AlertTriangle size={15} /><span><strong>{alert.name}</strong> · {alert.type}<small>{alert.date.split('-').reverse().join('/')} · Xem chấm công</small></span></button>) : <p className="work-hint">Chưa có cảnh báo trong tuần này.</p>}</div></section>}
    </>}
    {data.audit.length > 0 && <details className="work-panel p-4"><summary className="cursor-pointer text-sm font-semibold">Nhật ký thay đổi ({data.audit.length})</summary><div className="work-audit">{data.audit.slice().reverse().map(item => <p key={item.id}>{new Date(item.at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · {item.actor} · {item.action}{typeof item.detail?.off === 'boolean' ? ' · ' + item.detail.personName + ' · ' + item.detail.date.split('-').reverse().join('/') : ''}{item.detail?.after?.replacementReason ? ` · ${item.detail.after.replacementReason}` : ''}</p>)}</div></details>}
    {tab === 'employee' && <WorkAttendanceTable key={`${week}-${branchId}`} fromDate={week} toDate={end} assignments={data.assignments.filter(item => item.branchId === branchId && item.kind === 'employee' && peopleIds.has(item.personId))} attendance={data.attendance} people={directoryPeople} onDetail={item => setModal({ type: 'attendance', item })} />}
    {modal?.type === 'assignment' && <AssignmentForm initial={modal.item} data={{ ...data, branches, shifts }} catalog={catalog} people={directoryPeople} employeeCatalog={employeeCatalog} replacement={modal.replacement} onSave={saveAssignment} onClose={() => setModal(null)} />}
    {modal?.type === 'delete' && <ConfirmDialog open title="Xóa lịch làm việc" description={`Xóa lịch mẫu của ${directoryPeople.find(person => person.id === modal.item.personId)?.name || modal.item.personName || modal.item.personId} ngày ${modal.item.date.split('-').reverse().join('/')} (${modal.item.start}–${modal.item.end})? Bản chấm công gắn với lịch này cũng sẽ được xóa.`} confirmLabel="Xóa lịch" danger onClose={() => setModal({ type: 'attendance', item: modal.item })} onConfirm={() => {
      if (!isAdmin) throw new Error('Chỉ admin được xóa lịch.')
      commit({ ...removeWorkAssignment(data, modal.item.id), audit: audit('Xóa lịch mẫu', { assignment: modal.item, attendance: data.attendance.find(record => record.assignmentId === modal.item.id) }) }, 'Đã xóa lịch và chấm công liên quan')
    }} />}
    {modal?.type === 'attendance' && <AttendanceDialog item={modal.item} record={data.attendance.find(item => item.assignmentId === modal.item.id)} branch={branches.find(item => item.id === modal.item.branchId) || { id: modal.item.branchId, name: 'Cơ sở không còn trong danh sách' }} classes={catalog.classes} courses={catalog.courses} people={directoryPeople} isAdmin={isAdmin} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'assignment', item: modal.item })} onDelete={() => setModal({ type: 'delete', item: modal.item })} onSave={record => {
      if (!isAdmin || record.source !== 'admin') throw new Error('Màn quản trị chỉ cho phép admin bổ sung / điều chỉnh công.')
      const before = data.attendance.find(item => item.assignmentId === record.assignmentId)
      commit({ ...data, attendance: [...data.attendance.filter(item => item.assignmentId !== record.assignmentId), record], audit: audit(record.source === 'admin' ? 'Admin bổ sung chấm công' : 'Chấm công ảnh / GPS', { assignmentId: record.assignmentId, before, after: record, issues: attendanceIssues(modal.item, record) }) }, 'Đã lưu chấm công')
    }} />}
  </div>
}





