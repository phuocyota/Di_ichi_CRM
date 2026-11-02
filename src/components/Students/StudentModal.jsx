import React, { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { LoaderCircle, Plus, Save, Trash2, X } from 'lucide-react'
import { getStudentSaleOptions } from '../../services/crmApi.js'
import CourseModal from '../Courses/CourseModal.jsx'
import {courseStatuses,classStatuses} from '../../config/courses.js'

const inputDate = (value) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parts = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : ''
}

const todayInputDate = () => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const part = (type) => parts.find((item) => item.type === type).value
  return `${part('year')}-${part('month')}-${part('day')}`
}

function StudentModal({ modal, configs, selectedStudent, filters, directories, defaultBranchId = '', canAssignSale = false, onCreateCourseClass, onClose, onSubmit }) {
  const [quickModal,setQuickModal]=useState(null)
  const [quickSaving,setQuickSaving]=useState(false),[quickError,setQuickError]=useState('')
  const [pendingSelection,setPendingSelection]=useState(null)
  const quickLock=useRef(false),quickTrigger=useRef(null)
  const [saleOptions, setSaleOptions] = useState([])
  const [salesLoading, setSalesLoading] = useState(false)
  const [salesError, setSalesError] = useState('')
  const [salesVersion, setSalesVersion] = useState(0)
  const [submitError, setSubmitError] = useState('')
  const creating = modal === 'add'
  const deleting = modal === 'delete'
  const { register, reset, control, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { code: '', name: '', gender: '', birthDate: '', phone: '', email: '', parent: '', parentPhone: '', courseId: '', classId: '', branchId: '', assignedSaleUserId: '', statusValue: '', enrollmentDate: '', reason: '' } })
  const branchId = useWatch({ control, name: 'branchId' })
  const saleUserId = useWatch({ control, name: 'assignedSaleUserId' })
  const courseId = useWatch({ control, name: 'courseId' })
  const classId = useWatch({ control, name: 'classId' })
  const classroom = directories.classes.find((item) => item.id === classId)
  useEffect(() => {
    if (!pendingSelection) return
    const items=pendingSelection.field==='courseId'?directories.courses:directories.classes
    if (!items.some(item=>item.id===pendingSelection.id)) return
    // Validate only after the new option has been rendered into the native select.
    setValue(pendingSelection.field,pendingSelection.id,{shouldDirty:true,shouldValidate:true})
    setPendingSelection(null)
  }, [pendingSelection,directories.courses,directories.classes,setValue])
  useEffect(() => {
    if (!quickModal) quickTrigger.current?.focus()
  }, [quickModal])

  useEffect(() => {
    const source = modal === 'add' ? null : selectedStudent
    reset({ code: source?.code || '', name: source?.name || '', gender: source?.gender || '', birthDate: inputDate(source?.birthDate), phone: source?.phone || '', email: source?.email || '', parent: source?.parent || '', parentPhone: source?.parentPhone || '', courseId: source?.courseId || '', classId: source?.classId || '', branchId: source?.branchId || (modal === 'add' ? defaultBranchId : ''), assignedSaleUserId: source?.assignedSaleUserId || '', statusValue: source?.statusValue || '', enrollmentDate: modal === 'add' ? todayInputDate() : inputDate(source?.enrollmentDate), reason: source?.note || '' })
    setSubmitError('')
    setQuickModal(null)
    setQuickError('')
    setPendingSelection(null)
  }, [reset, modal, selectedStudent, defaultBranchId])

  useEffect(() => {
    let cancelled = false
    setSaleOptions([]); setSalesError(''); setSalesLoading(false)
    if (!canAssignSale || !branchId || !['add', 'edit'].includes(modal)) return
    setSalesLoading(true)
    getStudentSaleOptions(branchId)
      .then((items) => { if (!Array.isArray(items)) throw new Error('Danh sách Sale không đúng định dạng'); if (!cancelled) setSaleOptions(items) })
      .catch((error) => { if (!cancelled) setSalesError(error.message) })
      .finally(() => { if (!cancelled) setSalesLoading(false) })
    return () => { cancelled = true }
  }, [branchId, canAssignSale, modal, salesVersion])

  if (!modal) return null
  const config = configs[modal]
  const fieldClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50'
  const error = (name) => errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name].message}</p> : null
  const textField = (name, title, type = 'text', required = false) => <label className="block text-sm font-semibold" key={name}>{title}{required ? ' *' : ''}<input type={type} className={fieldClass} {...register(name, { required: required ? `Vui lòng nhập ${title.toLowerCase()}` : false })} />{error(name)}</label>
  const submit = handleSubmit(async (values) => {
    setSubmitError('')
    try { await onSubmit(modal, { ...values, assignedSaleUserId: saleUserId }, selectedStudent) }
    catch (cause) { setSubmitError(cause.message) }
  })
  const closeQuick = () => {
    if (quickLock.current) return
    setQuickModal(null);setQuickError('')
    quickTrigger.current?.focus()
  }
  const openQuick = (entity,event) => {
    if (isSubmitting || quickLock.current || (entity === 'class' && !courseId)) return
    quickTrigger.current=event.currentTarget
    setQuickError('');setQuickModal({entity,mode:'create',...(entity==='class'?{courseId}:{})})
  }
  const saveQuick = async (action,values) => {
    if (quickLock.current) return
    quickLock.current=true;setQuickSaving(true);setQuickError('')
    try {
      const saved=await onCreateCourseClass(action,values)
      if(action.entity==='course') {
        setPendingSelection({field:'courseId',id:saved.id})
        setValue('classId','',{shouldDirty:true})
        setQuickModal({entity:'class',mode:'create',courseId:saved.id})
      } else {
        setPendingSelection({field:'classId',id:saved.id})
        setQuickModal(null)
      }
    } catch(error) {setQuickError(error.message)}
    finally{quickLock.current=false;setQuickSaving(false)}
  }

  return <><div inert={Boolean(quickModal)} aria-hidden={quickModal ? true : undefined} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="student-modal-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
      <header className="flex items-start justify-between border-b border-slate-200 p-6"><div><h2 id="student-modal-title" className="text-lg font-semibold">{config.title}</h2><p className="mt-1 text-sm text-slate-500">{creating ? 'Nhập thông tin học viên mới. Tài khoản học sinh được tạo kèm với email này, mật khẩu ban đầu: 123456.' : selectedStudent?.name}</p></div><button type="button" aria-label="Đóng modal" disabled={isSubmitting} onClick={onClose} className="rounded-lg border p-2 disabled:opacity-40"><X size={18} /></button></header>
      <form onSubmit={submit} className="space-y-5 p-6">
        {deleting ? <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Bạn có chắc chắn muốn xóa vĩnh viễn học viên {selectedStudent?.name} và các dữ liệu liên quan?</p> : <fieldset disabled={isSubmitting} className="space-y-5">
          {creating ? <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"><strong>Hướng dẫn:</strong> Tạo khóa học trước khi thêm học viên. Sau đó chọn khóa học và lớp học tương ứng bên dưới.</p> : null}
          <h3 className="font-semibold text-blue-700">Thông tin học viên</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {textField('code', 'Mã học viên')}{textField('name', 'Họ tên', 'text', true)}
            <label className="block text-sm font-semibold">Giới tính<select className={fieldClass} {...register('gender')}><option value="">Chọn giới tính</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option></select></label>
            {textField('birthDate', 'Ngày sinh', 'date')}{textField('phone', 'Số điện thoại', 'tel', creating)}<div>{textField('email', 'Email đăng nhập', 'email', true)}{creating ? <p className="mt-1 text-xs font-normal text-slate-500">Nhập email để tạo tài khoản đăng nhập cho học viên.</p> : null}</div>{textField('enrollmentDate', 'Ngày nhập học', 'date', creating)}
            <label className="block text-sm font-semibold">Cơ sở *<select className={fieldClass} {...register('branchId', { required: 'Vui lòng chọn cơ sở', onChange: () => { setValue('assignedSaleUserId', ''); setSaleOptions([]) } })}><option value="">Chọn cơ sở</option>{directories.branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{error('branchId')}</label>
          </div>
          <h3 className="font-semibold text-blue-700">Phụ huynh và liên hệ</h3>
          <div className="grid gap-4 md:grid-cols-2">{textField('parent', 'Phụ huynh')}{textField('parentPhone', 'SĐT phụ huynh', 'tel')}</div>
          <h3 className="font-semibold text-blue-700">Khóa học và trạng thái</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {creating ? <>
              <div><label htmlFor="student-course" className="block text-sm font-semibold">Khóa học *</label><div className="flex items-center gap-2"><select id="student-course" className={fieldClass} value={courseId || ''} {...register('courseId', { required: 'Vui lòng chọn khóa học', onChange: () => setValue('classId', '') })}><option value="">Chọn khóa học</option>{directories.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button type="button" title="Tạo khóa học mới" aria-label="Tạo khóa học mới" className="mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40" disabled={!onCreateCourseClass} onClick={(event)=>openQuick('course',event)}><Plus size={19}/></button></div>{error('courseId')}</div>
              <div><label htmlFor="student-class" className="block text-sm font-semibold">Lớp học *</label><div className="flex items-center gap-2"><select id="student-class" className={fieldClass} value={classId || ''} disabled={!courseId} {...register('classId', { required: 'Vui lòng chọn lớp học' })}><option value="">Chọn lớp học</option>{directories.classes.filter((item) => item.courseId === courseId && ['active', 'upcoming'].includes(item.status?.toLowerCase())).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button type="button" title={courseId?'Tạo lớp học mới':'Chọn hoặc tạo khóa học trước'} aria-label="Tạo lớp học mới" className="mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40" disabled={!courseId || !onCreateCourseClass} onClick={(event)=>openQuick('class',event)}><Plus size={19}/></button></div>{error('classId')}</div>
              <label className="block text-sm font-semibold">Trạng thái *<select className={fieldClass} {...register('statusValue', { required: 'Vui lòng chọn trạng thái' })}><option value="">Chọn trạng thái</option>{filters.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{error('statusValue')}</label>
            </> : <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 md:col-span-2"><p>Lớp học: {selectedStudent?.className || '—'} · Trạng thái: {selectedStudent?.status || '—'}</p><p className="mt-1">Dùng menu Nghiệp vụ để chuyển lớp, bảo lưu, nghỉ học hoặc gia hạn.</p></div>}
            <div className="text-sm"><p className="font-semibold">Giáo viên theo lớp</p><p className="mt-2 text-slate-600">{creating ? classroom?.teacherNames || '—' : selectedStudent?.teacher || '—'}</p></div>
            {canAssignSale ? <div><label className="block text-sm font-semibold">Sale phụ trách<select className={fieldClass} disabled={!branchId || salesLoading || Boolean(salesError)} {...register('assignedSaleUserId')}><option value="">Chưa có Sale</option>{saleUserId && !saleOptions.some((item) => item.userId === saleUserId) ? <option value={saleUserId}>Sale hiện tại</option> : null}{saleOptions.map((item) => <option key={item.userId} value={item.userId}>{item.name}</option>)}</select></label><p className="mt-1 text-xs text-slate-500">{salesLoading ? 'Đang tải danh sách Sale…' : !branchId ? 'Chọn cơ sở để xem Sale.' : 'Có thể để trống và gán Sale sau.'}</p>{salesError ? <p role="alert" className="mt-1 text-xs text-red-600">{salesError} <button type="button" className="underline" onClick={() => setSalesVersion((value) => value + 1)}>Thử lại</button></p> : null}</div> : null}
          </div>
          <label className="block text-sm font-semibold">Ghi chú<textarea rows={3} className={fieldClass} {...register('reason')} /></label>
        </fieldset>}
        {submitError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{submitError}</p> : null}
        <footer className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-slate-200 bg-slate-50/95 px-6 py-4 backdrop-blur-sm">
          <button type="button" disabled={isSubmitting} onClick={onClose} className="ui-button h-11 min-w-24 flex-1 sm:flex-none">Hủy</button>
          <button type="submit" disabled={isSubmitting || salesLoading} className={`ui-button h-11 min-w-40 flex-1 shadow-sm sm:flex-none ${deleting ? 'ui-button-danger' : 'ui-button-primary'}`}>
            {isSubmitting ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true"/> : deleting ? <Trash2 size={17} aria-hidden="true"/> : <Save size={17} aria-hidden="true"/>}
            {isSubmitting ? 'Đang lưu…' : config.submitText}
          </button>
        </footer>
      </form>
    </section>
  </div>{quickModal ? <CourseModal key={quickModal.entity + (quickModal.courseId || "")} modal={quickModal} saving={quickSaving} errorMessage={quickError} courseStatuses={courseStatuses} classStatuses={classStatuses.filter(item=>['active','upcoming'].includes(item.value))} courses={directories.courses} teachers={directories.teachers || []} courseMap={Object.fromEntries(directories.courses.map(item=>[item.id,item]))} teacherMap={{}} onClose={closeQuick} onSubmit={saveQuick}/> : null}</>
}
export default StudentModal
