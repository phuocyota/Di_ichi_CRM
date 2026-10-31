import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { X } from 'lucide-react'
import { businessDate } from '../../services/studentWorkflow.js'

function StudentOperationModal({ type, student, classes, onClose, onSubmit }) {
  const [error, setError] = useState('')
  const isImport = type === 'import'
  const enrollments = (student?.enrollments || []).filter((item) => item.isCurrent && (type !== 'transfer' || item.status === 'active'))
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: { enrollmentId: enrollments.length === 1 ? enrollments[0].id : '', targetClassId: '', effectiveDate: businessDate(), expiresAt: '', reason: '' } })
  const enrollmentId = useWatch({ control, name: 'enrollmentId' })
  const enrollment = enrollments.find((item) => item.id === enrollmentId)
  const targetClasses = classes.filter((item) => item.id !== enrollment?.classId && item.courseId === enrollment?.class?.courseId && ['active', 'upcoming'].includes(item.status?.toLowerCase()) && (!item.branchIds?.length || (item.branchIds.length === 1 && item.branchIds[0] === student?.branchId)))
  const titles = { import: 'Import học viên từ Excel', transfer: 'Chuyển lớp', reserve: 'Bảo lưu học viên', stop: 'Nghỉ học', extend: 'Gia hạn thời gian học' }
  const fieldClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500'
  const submit = handleSubmit(async (values) => {
    setError('')
    try { await onSubmit(type, values, student) } catch (cause) { setError(cause.message) }
  })
  const message = (name) => errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name].message}</p> : null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="student-operation-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl">
      <header className="flex items-start justify-between border-b border-slate-200 p-6"><div><h2 id="student-operation-title" className="text-lg font-semibold">{titles[type]}</h2>{!isImport ? <p className="mt-1 text-sm text-slate-500">{student?.name} · {student?.code}</p> : null}</div><button type="button" aria-label="Đóng" disabled={isSubmitting} onClick={onClose} className="rounded border p-2 disabled:opacity-40"><X size={18} /></button></header>
      <form onSubmit={submit} className="space-y-4 p-6">
        {isImport ? <label className="block text-sm font-semibold">File Excel (.xlsx, tối đa 10 MB)<input type="file" accept=".xlsx" disabled={isSubmitting} className={fieldClass} {...register('file', { required: 'Vui lòng chọn file Excel' })} />{message('file')}</label> : <>
          {type === 'transfer' || type === 'extend' ? <>
            <label className="block text-sm font-semibold">Lượt ghi danh hiện tại<select className={fieldClass} disabled={isSubmitting} {...register('enrollmentId', { required: 'Vui lòng chọn lượt ghi danh', onChange: () => setValue('targetClassId', '') })}><option value="">Chọn lượt ghi danh</option>{enrollments.map((item) => <option key={item.id} value={item.id}>{item.class?.name || item.classId} · nhập học {item.enrolledAt}</option>)}</select>{message('enrollmentId')}</label>
            {!enrollments.length ? <p className="text-sm text-amber-700">Học viên chưa có ghi danh phù hợp để thực hiện thao tác.</p> : null}
          </> : null}
          {type === 'transfer' ? <label className="block text-sm font-semibold">Lớp đích<select className={fieldClass} disabled={isSubmitting || !enrollment} {...register('targetClassId', { required: 'Vui lòng chọn lớp đích' })}><option value="">Chọn lớp cùng khóa học</option>{targetClasses.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.code}</option>)}</select>{message('targetClassId')}<span className="mt-1 block text-xs font-normal text-slate-500">Cơ sở và sĩ số lớp sẽ được kiểm tra khi lưu.</span></label> : null}
          {type === 'extend' ? <label className="block text-sm font-semibold">Hạn học mới<input type="date" className={fieldClass} disabled={isSubmitting} {...register('expiresAt', { required: 'Vui lòng chọn hạn học mới' })} />{message('expiresAt')}<span className="mt-1 block text-xs font-normal text-slate-500">Hạn hiện tại: {enrollment?.expiresAt || enrollment?.class?.endDate || '—'}. Chỉ gia hạn cho học viên này.</span></label> : <label className="block text-sm font-semibold">Ngày có hiệu lực<input type="date" max={businessDate()} min={type === 'transfer' ? enrollment?.enrolledAt : undefined} className={fieldClass} disabled={isSubmitting} {...register('effectiveDate', { required: 'Vui lòng chọn ngày có hiệu lực' })} />{message('effectiveDate')}</label>}
          <label className="block text-sm font-semibold">Lý do<textarea rows={3} maxLength={2000} className={fieldClass} disabled={isSubmitting} {...register('reason', { required: 'Vui lòng nhập lý do', validate: (value) => Boolean(value.trim()) || 'Vui lòng nhập lý do' })} />{message('reason')}</label>
        </>}
        {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <footer className="flex justify-end gap-3 border-t pt-4"><button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-lg border px-4 py-2.5 disabled:opacity-40">Hủy</button><button type="submit" disabled={isSubmitting || ((type === 'transfer' || type === 'extend') && !enrollments.length)} className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:opacity-40">{isSubmitting ? 'Đang xử lý…' : isImport ? 'Tải lên' : 'Xác nhận'}</button></footer>
      </form>
    </section>
  </div>
}

export default StudentOperationModal
