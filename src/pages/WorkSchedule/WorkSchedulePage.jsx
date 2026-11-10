import { useWorkScheduleSnapshot } from '../../services/workScheduleApi.js'
import { normalizeWorkSearch } from '../../services/workScheduleContract.js'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, UserCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { ConfirmDialog } from '../../components/common/ui.jsx'
import WorkTimeGrid from '../../components/WorkSchedule/WorkTimeGrid.jsx'
import WorkAttendanceTable from '../../components/WorkSchedule/WorkAttendanceTable.jsx'
import ShiftManagement from '../../components/WorkSchedule/ShiftManagement.jsx'
import ScheduleFilters from '../../components/WorkSchedule/ScheduleFilters.jsx'
import AssignmentForm from '../../components/WorkSchedule/AssignmentForm.jsx'
import DayOffForm from '../../components/WorkSchedule/DayOffForm.jsx'
import AttendanceDialog from '../../components/WorkSchedule/AttendanceDialog.jsx'
import useWorkScheduleEmployees from '../../components/WorkSchedule/useWorkScheduleEmployees.js'
import { matchesWorkEmployeeType } from '../../services/workScheduleEmployees.js'
import { workTabs, workEmployeeTypes } from '../../datas/workSchedules.js'
import { addDays, upsertWorkAssignment, validateAssignment, weekStart, workAlerts } from '../../services/workSchedule.js'
import './WorkSchedulePage.css'

export default function WorkSchedulePage() {
  const [tab, setTab] = useState('employee')
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
  const chosenBranchId = employeeBranchId
  const branchId = branches.some(item => item.id === chosenBranchId) ? chosenBranchId : branches[0]?.id || ''
  const shiftApi = { snapshot: scheduleApi.configuration, saving: scheduleApi.saving, loading: scheduleApi.loading && !scheduleApi.configuration, error: scheduleApi.configurationError, reload: scheduleApi.reload, save: scheduleApi.saveConfiguration }
  const shifts = shiftApi.snapshot?.shifts || []
  const setBranch = setEmployeeBranch
  const [now, setNow] = useState(Date.now)

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(actor.role)
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
  const completed = visible.filter(item => { const record = data.attendance.find(row => row.assignmentId === item.id); return record?.checkIn && record?.checkOut })
  const total = visible.length
  const confirmed = completed.length
  const commit = async (next, message, { silent = false } = {}) => {
    await scheduleApi.save(next)
    setModal(null); if (!silent) toast.success(message)
  }
  const add = (person, date = week, defaults = {}) => {
    if (scheduleApi.loading || scheduleApi.saving || scheduleApi.error) return toast.error(scheduleApi.error || 'Đang tải hoặc lưu phân lịch.')
    if (employeeCatalog.loading || employeeCatalog.error) return toast.error('Vui lòng tải danh sách nhân viên / cơ sở trước khi phân lịch.')
    if (shiftApi.loading || shiftApi.error) return toast.error('Vui lòng tải cấu hình ca làm từ máy chủ trước khi phân lịch.')
    if (!branchId) return toast.error('Chưa có cơ sở để phân lịch.')
    const selectedPerson = person
    setModal({ type: 'assignment', item: { ...defaults, personId: selectedPerson?.id || '', kind: 'employee', branchId, date } })
  }
  const requestAdd = (date = week) => {
    const shift = shifts.find(item => item.branchId === branchId)
    setModal({ type: 'assignment', item: { kind: 'employee', personId: '', branchId: branchId || actor.branchId || '', date, shiftId: shift?.id || '', start: shift?.start || '', end: shift?.end || '' } })
  }
  const saveAssignment = async (value, { silent = false } = {}) => {
    if (scheduleApi.error) throw new Error(scheduleApi.error)
    const existing = data.assignments.find(item => item.id === value.id)
    const { expectedRevision, ...assignmentValue } = value
    let candidate = { ...assignmentValue, id: value.id || crypto.randomUUID() }

    if (employeeCatalog.loading || employeeCatalog.error) throw new Error('Chưa tải được danh sách nhân viên / cơ sở từ API. Vui lòng thử lại.')
    const employee = employeeCatalog.employees.find(person => person.id === candidate.personId)
    if (!workEmployeeTypes.some(type => type.value === candidate.employeeType) || !matchesWorkEmployeeType(employee, candidate.employeeType)) throw new Error('Chọn nhân viên đúng loại CSKH hoặc Sale.')
    if (employee.branchId !== candidate.branchId) throw new Error('Chọn nhân viên thuộc cơ sở đang phân lịch.')
    if (!employeeCatalog.branches.some(branch => branch.id === candidate.branchId)) throw new Error('Chọn cơ sở hợp lệ từ API.')
    const shift = shifts.find(item => !item.deletedAt && item.id === candidate.shiftId && item.branchId === candidate.branchId)
    if (!shift) throw new Error('Chọn ca hợp lệ của chi nhánh.')
    candidate = { ...candidate, catalogSource: employee.catalogSource, personName: employee.name, personRole: workEmployeeTypes.find(type => type.value === candidate.employeeType).label, start: candidate.start || shift.start, end: candidate.end || shift.end }
    if (modal?.replacement) {
      if (candidate.personId === existing.personId) throw new Error('Hãy chọn nhân viên khác để làm thay.')
      if (!candidate.replacementReason?.trim()) throw new Error('Cần nhập lý do thay thế.')
      candidate.originalPersonId = existing.originalPersonId || existing.personId
    }
    if (modal?.replacement) {
      // Server rejects a replacement once attendance exists, so the old attendance is never silently dropped.
      await scheduleApi.actions.replace(existing.id, candidate.personId, candidate.replacementReason.trim())
      setModal(null); if (!silent) toast.success('Đã đổi nhân viên làm thay')
      return
    }
    const hasAttendance = existing && data.attendance.some(record => record.assignmentId === existing.id)
    // Moving a checked-in shift to another day would silently drop its attendance, so refuse like the server does.
    if (hasAttendance && candidate.date !== existing.date) throw new Error('Lịch đã có chấm công nên không thể chuyển sang ngày khác. Hãy xóa lịch (kèm chấm công) rồi phân lại.')
    if (existing && existing.kind === 'employee' && candidate.shiftId !== existing.shiftId && candidate.personId === existing.personId && candidate.date === existing.date && candidate.branchId === existing.branchId && candidate.start === shift.start && candidate.end === shift.end) {
      await scheduleApi.actions.swapShift(existing.id, shift.id)
      setModal(null); if (!silent) toast.success('Đã đổi ca')
      return
    }
    if (!existing && candidate.start === shift.start && candidate.end === shift.end) {
      // Default shift hours: let the server create the assignment and run its own checks.
      validateAssignment(candidate, data.assignments, data.preferences)
      await scheduleApi.actions.assign([{ personId: candidate.personId, date: candidate.date, shiftId: shift.id, employeeType: candidate.employeeType }])
      setModal(null); if (!silent) toast.success('Đã thêm phân lịch')
      return
    }
    const next = upsertWorkAssignment(data, candidate)
    if (Number.isInteger(expectedRevision)) next.revision = expectedRevision
    return commit(next, 'Đã lưu phân lịch tuần', { silent })
  }
  const dayOffs = data.preferences.filter(item => item.shiftId === 'OFF' && item.branchId === branchId && item.date >= week && item.date <= end && peopleIds.has(item.personId))
  const saveDayOff = async (personId, date) => {
    if (!isAdmin) throw new Error('Chỉ admin được đăng ký ngày nghỉ.')
    await scheduleApi.actions.createDayOff(personId, date)
    setModal(null); toast.success('Đã đăng ký ngày nghỉ')
  }
  const decorated = visible.map(item => ({ ...item, shiftName: shifts.find(shift => shift.id === item.shiftId)?.name }))
  const branchName = branches.find(item => item.id === branchId)?.name || 'chưa chọn cơ sở'
  const filters = <ScheduleFilters week={week} onWeekChange={setWeek} branches={branches} branchId={branchId} onBranchChange={setBranch} search={search} onSearchChange={setSearch} />
  const scheduleTitle = branchId ? `Lịch tuần · ${branchName}` : 'Lịch làm việc trong tuần'
  return <div className="work-page space-y-5">
    {scheduleApi.loading && <p role="status">Đang tải phân lịch từ máy chủ…</p>}
    {tab === 'employee' && scheduleApi.error && <div className="work-error" role="alert">{scheduleApi.error} <button onClick={scheduleApi.reload}>Tải lại</button></div>}
    <PageHeader title="Lịch làm việc" description="Điều phối lịch tuần, theo dõi ca làm và chấm công tại trung tâm." tabs={workTabs} activeTab={tab} onTabChange={setTab} />
    {employeeCatalog.refreshError && <div className="work-error" role="alert">Chưa cập nhật được dữ liệu mới: {employeeCatalog.refreshError}. Đang hiển thị dữ liệu đã tải. <button type="button" className="ui-button" onClick={employeeCatalog.reload}>Thử lại</button></div>}
    {tab === 'shifts' ? <ShiftManagement branches={branches} branchId={branchId} onBranchChange={setBranch} shifts={shifts} revision={shiftApi.snapshot?.revision} saved={shiftApi.snapshot?.saved} saving={shiftApi.saving} loading={employeeCatalog.loading || shiftApi.loading} error={employeeCatalog.error || shiftApi.error} onReload={() => { employeeCatalog.reload(); shiftApi.reload() }} onSave={async (values, revision) => {
      await shiftApi.save(values, revision)
      toast.success('Đã lưu ca làm trên máy chủ')
    }} /> : <>
    {shiftApi.loading && <p className="work-hint" role="status">Đang tải cấu hình ca làm…</p>}
    {shiftApi.error && <div className="work-error" role="alert">Không tải được ca làm: {shiftApi.error} <button type="button" className="ui-button" onClick={shiftApi.reload}>Thử lại</button></div>}
    {tab === 'employee' && employeeCatalog.loading && <p className="work-hint" role="status">Đang tải nhân viên, cơ sở và vai trò…</p>}
    {tab === 'employee' && employeeCatalog.error && <div className="work-error" role="alert">Không tải được nhân viên / cơ sở: {employeeCatalog.error} <button type="button" className="ui-button" onClick={employeeCatalog.reload}>Thử lại</button></div>}
    {tab === 'employee' && !employeeCatalog.loading && !employeeCatalog.error && !employeeCatalog.branches.length && <p className="work-hint">Chưa có cơ sở trong dữ liệu API.</p>}
    {tab === 'employee' && !employeeCatalog.loading && !employeeCatalog.error && employeeCatalog.unclassified.length > 0 && <p className="work-hint">Có {employeeCatalog.unclassified.length} nhân viên chưa có thông tin phân loại CSKH / Sale trong vai trò hoặc chức vụ, nên chưa xuất hiện trong danh sách phân lịch.</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={'Ca được phân'} value={total} description={`${people.length} ${'nhân viên'} trong danh sách`} icon={CalendarDays} color="blue" />
      <StatCard label={'Ca đã chấm công'} value={confirmed} description="Có đủ check-in và check-out" icon={UserCheck} color="emerald" />
      <StatCard label="Đi trễ / về sớm" value={`${alerts.filter(item => item.type === 'Đi trễ').length} / ${alerts.filter(item => item.type === 'Về sớm').length}`} description="Số lần ghi nhận trong tuần" icon={Clock3} color="amber" />
      <StatCard label="Quên chấm công" value={alerts.filter(item => item.type === 'Quên chấm công').length} description="Thiếu check-in/out khi hết lịch" icon={AlertTriangle} color="red" />
    </div>
    <section className="work-panel work-schedule-panel" aria-label="Lịch phân ca tuần"><div className="work-section-heading"><div><h2>{scheduleTitle}</h2><p>Phân ca theo ngày · Tối thiểu 1 ngày nghỉ / tuần</p></div><span className="work-schedule-period">{week.split('-').reverse().join('/')} — {end.split('-').reverse().join('/')}</span></div><div className="work-timetable-filters">{filters}</div>
      <WorkTimeGrid onRequestAdd={requestAdd} revision={data.revision} onChange={saveAssignment} editing={Boolean(modal) || scheduleApi.saving} disabled={scheduleApi.loading || scheduleApi.saving || Boolean(scheduleApi.error) || employeeCatalog.loading || Boolean(employeeCatalog.error) || shiftApi.loading || Boolean(shiftApi.error) || !branchId} shifts={shifts} week={week} people={people} assignments={decorated} attendance={data.attendance} preferences={dayOffs} onRequestDayOff={date => setModal({ type: 'dayoff', item: { date } })} onDayOff={off => setModal({ type: 'undayoff', item: off })} onAdd={add} onDetail={item => setModal({ type: 'attendance', item })} onReplace={item => setModal({ type: 'assignment', replacement: true, item })} />
    </section>
    </>}
    {data.audit.length > 0 && <details className="work-panel p-4"><summary className="cursor-pointer text-sm font-semibold">Nhật ký thay đổi ({data.audit.length})</summary><div className="work-audit">{data.audit.slice().reverse().map(item => <p key={item.id}>{new Date(item.at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · {item.actor} · {item.action}{typeof item.detail?.off === 'boolean' ? ' · ' + item.detail.personName + ' · ' + item.detail.date.split('-').reverse().join('/') : ''}{item.detail?.after?.replacementReason ? ` · ${item.detail.after.replacementReason}` : ''}</p>)}</div></details>}
    {tab === 'employee' && <WorkAttendanceTable key={`${week}-${branchId}`} fromDate={week} toDate={end} assignments={data.assignments.filter(item => item.branchId === branchId && item.kind === 'employee' && peopleIds.has(item.personId))} attendance={data.attendance} people={directoryPeople} onDetail={item => setModal({ type: 'attendance', item })} />}
    {modal?.type === 'assignment' && <AssignmentForm initial={modal.item} data={{ ...data, branches, shifts }} people={directoryPeople} employeeCatalog={employeeCatalog} replacement={modal.replacement} saveError={scheduleApi.error} onSave={saveAssignment} onClose={() => setModal(null)} />}
    {modal?.type === 'dayoff' && <DayOffForm initial={modal.item} people={people} onSave={saveDayOff} onClose={() => setModal(null)} />}
    {modal?.type === 'undayoff' && <ConfirmDialog open title="Bỏ ngày nghỉ" description={`Bỏ OFF của ${directoryPeople.find(person => person.id === modal.item.personId)?.name || modal.item.personId} ngày ${modal.item.date.split('-').reverse().join('/')}?`} confirmLabel="Bỏ ngày nghỉ" onClose={() => setModal(null)} onConfirm={async () => {
      if (!isAdmin) throw new Error('Chỉ admin được bỏ ngày nghỉ.')
      await scheduleApi.actions.deleteDayOff(modal.item.personId, modal.item.date)
      setModal(null); toast.success('Đã bỏ ngày nghỉ')
    }} />}
    {modal?.type === 'delete' && <ConfirmDialog open title="Xóa lịch làm việc" description={`Xóa lịch của ${directoryPeople.find(person => person.id === modal.item.personId)?.name || modal.item.personName || modal.item.personId} ngày ${modal.item.date.split('-').reverse().join('/')} (${modal.item.start}–${modal.item.end})? Bản chấm công gắn với lịch này cũng sẽ được xóa.`} confirmLabel="Xóa lịch" danger onClose={() => setModal({ type: 'attendance', item: modal.item })} onConfirm={async () => {
      if (!isAdmin) throw new Error('Chỉ admin được xóa lịch.')
      await scheduleApi.actions.remove(modal.item.id)
      setModal(null); toast.success('Đã xóa lịch và chấm công liên quan')
    }} />}
    {modal?.type === 'attendance' && <AttendanceDialog item={modal.item} record={data.attendance.find(item => item.assignmentId === modal.item.id)} branch={branches.find(item => item.id === modal.item.branchId) || { id: modal.item.branchId, name: 'Cơ sở không còn trong danh sách' }} people={directoryPeople} isAdmin={isAdmin} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'assignment', item: modal.item })} onDelete={() => setModal({ type: 'delete', item: modal.item })} onSave={async record => {
      if (!isAdmin || record.source !== 'admin') throw new Error('Màn quản trị chỉ cho phép admin bổ sung / điều chỉnh công.')
      await commit({ ...data, attendance: [...data.attendance.filter(item => item.assignmentId !== record.assignmentId), record] }, 'Đã lưu chấm công')
    }} />}
  </div>
}





