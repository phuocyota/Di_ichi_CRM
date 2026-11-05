import { useState } from 'react'
import { workEmployeeTypes } from '../../datas/workSchedules.js'
import { classMatchesWorkBranch } from '../../services/workScheduleCatalog.js'
import { matchesWorkEmployeeType } from '../../services/workScheduleEmployees.js'
import WorkScheduleDialog, { Field } from './WorkScheduleDialog.jsx'
import TeacherSelect from './TeacherSelect.jsx'

export default function AssignmentForm({ initial, data, catalog, people, employeeCatalog, replacement, onSave, onClose }) {
  const [value, setValue] = useState(() => ({ periods: 2, start: '07:30', end: '13:30', ...initial, employeeType: initial.employeeType || people.find(person => person.id === initial.personId)?.employeeType || '' }))
  const [error, setError] = useState('')
  const [courseId, setCourse] = useState(() => catalog.classes.find(item => item.id === initial.classId)?.courseId || initial.courseId || '')
  const change = (key, next) => { setValue(old => ({ ...old, [key]: next })); setError('') }
  const shifts = data.shifts.filter(item => item.branchId === value.branchId && !item.deletedAt)
  const branchClasses = catalog.classes.filter(item => classMatchesWorkBranch(item, value.branchId))
  const availableCourses = catalog.courses
  const classes = branchClasses.filter(item => item.courseId === courseId)
  const classItem = classes.find(item => item.id === value.classId)
  const employees = people.filter(person => person.kind === 'employee' && matchesWorkEmployeeType(person, value.employeeType) && (person.catalogSource !== 'sample' || person.branchId === value.branchId))
  const submit = event => {
    event.preventDefault()
    if (value.kind === 'employee' && !workEmployeeTypes.some(type => type.value === value.employeeType)) return setError('Vui lòng chọn loại nhân viên CSKH hoặc Sale.')
    if (!value.personId) return setError(`Vui lòng tìm và chọn ${value.kind === 'teacher' ? 'giáo viên' : 'nhân viên'} trong danh sách.`)
    if (value.kind === 'employee' && !employees.some(person => person.id === value.personId)) return setError('Nhân viên không thuộc loại đã chọn. Vui lòng chọn lại.')
    if (value.kind === 'employee' && (employeeCatalog.loading || employeeCatalog.error)) return setError('Chưa tải được danh sách nhân viên / cơ sở. Vui lòng thử lại.')
    if (value.kind === 'teacher' && (catalog.loading || catalog.error)) return setError('Chưa tải được danh sách khóa học / lớp học. Vui lòng thử lại.')
    try { onSave(value) } catch (cause) { setError(cause.message) }
  }
  return <WorkScheduleDialog title={replacement ? value.kind === 'teacher' ? 'Thay giáo viên dạy thế' : 'Đổi nhân viên làm thay' : initial.id ? 'Chi tiết phân lịch' : 'Thêm phân lịch'} onClose={onClose}>
    <form onSubmit={submit} className="work-form">
      {initial.id && data.attendance.some(record => record.assignmentId === initial.id) && <p className="work-hint">Lịch mẫu đã có chấm công. Đổi giáo viên / nhân viên, lớp hoặc cơ sở sẽ xóa bản chấm công gắn với lịch này; đổi giờ hoặc số tiết sẽ giữ bản chấm công và cập nhật cảnh báo.</p>}
      <Field label="Chi nhánh"><select disabled={replacement} value={value.branchId} onChange={e => { setCourse(''); setValue(old => ({ ...old, branchId: e.target.value, shiftId: '', classId: '', ...(people.find(person => person.id === old.personId)?.catalogSource === 'sample' ? { personId: '' } : {}) })) }}>{data.branches.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
      {value.kind === 'teacher' ? <Field label="Giáo viên"><TeacherSelect people={people.filter(item => item.kind === 'teacher')} value={value.personId} onChange={id => change('personId', id)} /></Field> : <>
        {employeeCatalog.loading && <p className="work-hint" role="status">Đang tải danh sách nhân viên…</p>}
        {employeeCatalog.error && <p className="work-error" role="alert">Không tải được nhân viên: {employeeCatalog.error} <button type="button" className="underline" onClick={employeeCatalog.reload}>Thử lại</button></p>}
        <Field label="Loại nhân viên"><select required disabled={employeeCatalog.loading || Boolean(employeeCatalog.error)} value={value.employeeType} onChange={event => { setValue(old => ({ ...old, employeeType: event.target.value, personId: '' })); setError('') }}><option value="">Chọn loại nhân viên</option>{workEmployeeTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
        <Field label="Nhân viên"><TeacherSelect key={value.employeeType} disabled={!value.employeeType || employeeCatalog.loading || Boolean(employeeCatalog.error)} people={employees} value={value.personId} onChange={id => change('personId', id)} placeholder={value.employeeType ? 'Chọn nhân viên' : 'Chọn loại nhân viên trước'} searchLabel="Tìm nhân viên" searchPlaceholder="Tìm nhân viên..." emptyMessage="Không có nhân viên thuộc loại đã chọn." /></Field>
        {employees.some(person => person.catalogSource === 'sample') && <p className="work-hint">Nhân viên có nhãn “(mẫu)” là dữ liệu thử nghiệm để phân lịch. Lịch được lưu trên trình duyệt.</p>}
      </>}
      {value.kind === 'teacher' ? <>
        {catalog.error && <p className="work-error" role="alert">Không tải được khóa học / lớp học: {catalog.error} <button type="button" className="underline" onClick={catalog.reload}>Thử lại</button></p>}
        <Field label="Khóa học"><select required disabled={replacement || catalog.loading || Boolean(catalog.error)} value={courseId} onChange={e => { setCourse(e.target.value); change('classId', '') }}><option value="">{catalog.loading ? 'Đang tải khóa học…' : 'Chọn khóa học'}</option>{availableCourses.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="Lớp học"><select required disabled={replacement || !courseId || catalog.loading || Boolean(catalog.error)} value={value.classId || ''} onChange={e => change('classId', e.target.value)}><option value="">{courseId ? 'Chọn lớp thuộc khóa học' : 'Chọn khóa học trước'}</option>{classes.map(item => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></Field>
        {courseId && !catalog.loading && !catalog.error && !classes.length && <p className="work-hint">Chưa có lớp thuộc khóa học này tại cơ sở đang chọn.</p>}
        {classItem && <p className="work-hint">Thời gian hoạt động: {classItem.startDate ? classItem.startDate.split('-').reverse().join('/') : 'Chưa có ngày bắt đầu'} – {classItem.endDate ? classItem.endDate.split('-').reverse().join('/') : 'Chưa có ngày kết thúc'}{!classItem.branchIds.length ? ' · Lớp chưa gán cơ sở' : ''}</p>}
        <Field label="Số tiết dạy"><input required disabled={replacement} min="1" max="12" type="number" value={value.periods} onChange={e => change('periods', Number(e.target.value))} /></Field>
      </> : <Field label="Ca làm theo chi nhánh"><select required disabled={replacement} value={value.shiftId || ''} onChange={e => {
        const shift = shifts.find(item => item.id === e.target.value)
        setValue(old => ({ ...old, shiftId: shift?.id || '', start: shift?.start || '', end: shift?.end || '' }))
      }}><option value="">Chọn ca làm</option>{shifts.map(item => <option key={item.id} value={item.id}>{item.name} ({item.start}–{item.end})</option>)}</select></Field>}
      <div className="work-form-row"><Field label="Bắt đầu"><input required disabled={replacement} type="time" value={value.start} onChange={e => change('start', e.target.value)} /></Field><Field label="Kết thúc"><input required disabled={replacement} type="time" value={value.end} onChange={e => change('end', e.target.value)} /></Field></div>
      {value.kind === 'employee' && !replacement && <p className="work-hint">Ca làm lấy từ máy chủ và cấu hình tại tab Quản lý ca làm. Giờ mặc định lấy từ ca, có thể chỉnh riêng cho lần phân lịch này.</p>}
      {replacement && <Field label="Lý do thay thế"><textarea required value={value.replacementReason || ''} onChange={e => change('replacementReason', e.target.value)} /></Field>}
      {error && <p role="alert" className="work-error">{error}</p>}
      <footer><button type="button" className="ui-button" onClick={onClose}>Hủy</button><button disabled={value.kind === 'teacher' ? catalog.loading || Boolean(catalog.error) || !classes.length : employeeCatalog.loading || Boolean(employeeCatalog.error)} className="ui-button ui-button-primary">{replacement ? value.kind === 'teacher' ? 'Lưu giáo viên dạy thế' : 'Lưu nhân viên làm thay' : 'Lưu phân lịch'}</button></footer>
    </form>
  </WorkScheduleDialog>
}
