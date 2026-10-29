import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { X } from 'lucide-react'
import { getStudentSaleOptions } from '../../services/crmApi.js'

const inputDate = (value) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parts = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : ''
}

function StudentModal({ modal, configs, selectedStudent, filters, directories, canAssignSale = false, onClose, onSubmit }) {
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
    const source = modal === 'add' ? null : selectedStudent
    reset({ code: source?.code || '', name: source?.name || '', gender: source?.gender || '', birthDate: inputDate(source?.birthDate), phone: source?.phone || '', email: source?.email || '', parent: source?.parent || '', parentPhone: source?.parentPhone || '', courseId: source?.courseId || '', classId: source?.classId || '', branchId: source?.branchId || '', assignedSaleUserId: source?.assignedSaleUserId || '', statusValue: source?.statusValue || '', enrollmentDate: inputDate(source?.enrollmentDate), reason: source?.note || '' })
    setSubmitError('')
  }, [reset, modal, selectedStudent])

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
  const textField = (name, title, type = 'text', required = false) => <label className="block text-sm font-bold" key={name}>{title}{required ? ' *' : ''}<input type={type} className={fieldClass} {...register(name, { required: required ? `Vui lòng nhập ${title.toLowerCase()}` : false })} />{error(name)}</label>
  const submit = handleSubmit(async (values) => {
    setSubmitError('')
    try { await onSubmit(modal, { ...values, assignedSaleUserId: saleUserId }, selectedStudent) }
    catch (cause) { setSubmitError(cause.message) }
  })

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="student-modal-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
      <header className="flex items-start justify-between border-b border-slate-200 p-5"><div><h2 id="student-modal-title" className="text-lg font-black">{config.title}</h2><p className="mt-1 text-sm text-slate-500">{creating ? 'Nhập thông tin học viên mới. Tài khoản học sinh được tạo kèm với email này, mật khẩu ban đầu: 123456.' : selectedStudent?.name}</p></div><button type="button" aria-label="Đóng modal" disabled={isSubmitting} onClick={onClose} className="rounded-lg border p-2 disabled:opacity-40"><X size={18} /></button></header>
      <form onSubmit={submit} className="space-y-5 p-5">
        {deleting ? <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Bạn có chắc chắn muốn xóa vĩnh viễn học viên {selectedStudent?.name} và các dữ liệu liên quan?</p> : <fieldset disabled={isSubmitting} className="space-y-5">
          <h3 className="font-bold text-blue-700">Thông tin học viên</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {textField('code', 'Mã học viên')}{textField('name', 'Họ tên', 'text', true)}
            <label className="block text-sm font-bold">Giới tính<select className={fieldClass} {...register('gender')}><option value="">Chọn giới tính</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option></select></label>
            {textField('birthDate', 'Ngày sinh', 'date')}{textField('phone', 'Số điện thoại', 'tel', creating)}<div>{textField('email', 'Email đăng nhập', 'email', true)}{creating ? <p className="mt-1 text-xs font-normal text-slate-500">Nhập email để tạo tài khoản đăng nhập cho học viên.</p> : null}</div>{textField('enrollmentDate', 'Ngày nhập học', 'date', creating)}
            <label className="block text-sm font-bold">Cơ sở *<select className={fieldClass} {...register('branchId', { required: 'Vui lòng chọn cơ sở', onChange: () => { setValue('assignedSaleUserId', ''); setSaleOptions([]) } })}><option value="">Chọn cơ sở</option>{directories.branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{error('branchId')}</label>
          </div>
          <h3 className="font-bold text-blue-700">Phụ huynh và liên hệ</h3>
          <div className="grid gap-4 md:grid-cols-2">{textField('parent', 'Phụ huynh')}{textField('parentPhone', 'SĐT phụ huynh', 'tel')}</div>
          <h3 className="font-bold text-blue-700">Khóa học và trạng thái</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {creating ? <>
              <label className="block text-sm font-bold">Khóa học *<select className={fieldClass} {...register('courseId', { required: 'Vui lòng chọn khóa học', onChange: () => setValue('classId', '') })}><option value="">Chọn khóa học</option>{directories.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{error('courseId')}</label>
              <label className="block text-sm font-bold">Lớp học *<select className={fieldClass} disabled={!courseId} {...register('classId', { required: 'Vui lòng chọn lớp học' })}><option value="">Chọn lớp học</option>{directories.classes.filter((item) => item.courseId === courseId && ['active', 'upcoming'].includes(item.status?.toLowerCase())).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{error('classId')}</label>
              <label className="block text-sm font-bold">Trạng thái *<select className={fieldClass} {...register('statusValue', { required: 'Vui lòng chọn trạng thái' })}><option value="">Chọn trạng thái</option>{filters.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{error('statusValue')}</label>
            </> : <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 md:col-span-2"><p>Lớp học: {selectedStudent?.className || '—'} · Trạng thái: {selectedStudent?.status || '—'}</p><p className="mt-1">Dùng menu Nghiệp vụ để chuyển lớp, bảo lưu, nghỉ học hoặc gia hạn.</p></div>}
            <div className="text-sm"><p className="font-bold">Giáo viên theo lớp</p><p className="mt-2 text-slate-600">{creating ? classroom?.teacherNames || '—' : selectedStudent?.teacher || '—'}</p></div>
            {canAssignSale ? <div><label className="block text-sm font-bold">Sale phụ trách<select className={fieldClass} disabled={!branchId || salesLoading || Boolean(salesError)} {...register('assignedSaleUserId')}><option value="">Chưa có Sale</option>{saleUserId && !saleOptions.some((item) => item.userId === saleUserId) ? <option value={saleUserId}>Sale hiện tại</option> : null}{saleOptions.map((item) => <option key={item.userId} value={item.userId}>{item.name}</option>)}</select></label><p className="mt-1 text-xs text-slate-500">{salesLoading ? 'Đang tải danh sách Sale…' : !branchId ? 'Chọn cơ sở để xem Sale.' : 'Có thể để trống và gán Sale sau.'}</p>{salesError ? <p role="alert" className="mt-1 text-xs text-red-600">{salesError} <button type="button" className="underline" onClick={() => setSalesVersion((value) => value + 1)}>Thử lại</button></p> : null}</div> : null}
          </div>
          <label className="block text-sm font-bold">Ghi chú<textarea rows={3} className={fieldClass} {...register('reason')} /></label>
        </fieldset>}
        {submitError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{submitError}</p> : null}
        <footer className="flex justify-end gap-3 border-t pt-4"><button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-xl border px-4 py-2.5 disabled:opacity-40">Hủy</button><button type="submit" disabled={isSubmitting || salesLoading} className={`rounded-xl px-4 py-2.5 font-bold text-white disabled:opacity-40 ${deleting ? 'bg-red-600' : 'bg-blue-600'}`}>{isSubmitting ? 'Đang lưu…' : config.submitText}</button></footer>
      </form>
    </section>
  </div>
}
export default StudentModal
