import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Search, UserRoundPlus, X } from 'lucide-react'
import { addStudentToClass, enrollmentToday, findEnrollmentStudents, getClassEnrollmentState } from '../../services/classEnrollment.js'

export default function ClassEnrollmentModal({ item, onClose, onAdded }) {
  const [snapshot, setSnapshot] = useState(null)
  const [students, setStudents] = useState({ items: [], total: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [enrolledAt, setEnrolledAt] = useState(enrollmentToday)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const form = useRef(null)
  const opener = useRef(null)
  useEffect(() => {
    opener.current = document.activeElement
    form.current?.querySelector('button:not(:disabled), input:not(:disabled)')?.focus()
    return () => opener.current?.focus?.()
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError('')
    getClassEnrollmentState(item.id, controller.signal).then(result => {
      if (!controller.signal.aborted) setSnapshot(result)
    }).catch(error => { if (!controller.signal.aborted) setLoadError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [item.id, retry])
  const branchId = snapshot?.classroom.scopeBranchId ?? item.scopeBranchId
  useEffect(() => {
    const controller = new AbortController()
    setSearching(true)
    setSearchError('')
    const timer = window.setTimeout(() => {
      findEnrollmentStudents({ search, page, branchId, signal: controller.signal }).then(result => {
        if (!controller.signal.aborted) setStudents(result)
      }).catch(error => { if (!controller.signal.aborted) setSearchError(error.message) })
        .finally(() => { if (!controller.signal.aborted) setSearching(false) })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [search, page, branchId, retry])
  const existing = new Set((snapshot?.enrollments || []).map(enrollment => enrollment.studentId))
  const classroom = snapshot?.classroom
  const full = classroom && snapshot.enrollments.length >= Number(classroom.maxSize)
  const closed = classroom && (!['active', 'upcoming'].includes(classroom.status) || Boolean(classroom.deletedAt))
  const close = () => { if (!pending.current) onClose() }
  const submit = async event => {
    event.preventDefault()
    if (pending.current || loading || loadError || !selected || full || closed) return
    pending.current = true
    setBusy(true)
    form.current?.focus()
    setSaveError('')
    try {
      const result = await addStudentToClass({ classId: item.id, studentId: selected.id, enrolledAt, reason })
      onAdded(result)
    } catch (error) { setSaveError(error.message) }
    finally { pending.current = false; setBusy(false) }
  }
  const keyboard = event => {
    if (event.key === 'Escape') { event.preventDefault(); close() }
    if (event.key !== 'Tab') return
    const controls = [...form.current.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)')]
    if (!controls.length) { event.preventDefault(); form.current.focus(); return }
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
  return <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <form ref={form} role="dialog" tabIndex={-1} aria-modal="true" aria-label="Thêm học viên vào lớp" aria-busy={busy} onSubmit={submit} onKeyDown={keyboard} className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-5">
        <div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><UserRoundPlus size={22} /> Thêm học viên vào lớp</h2><p className="mt-1 text-sm text-slate-500">{item.name} · {item.code}</p>{snapshot && <p className="mt-1 text-xs text-slate-500">Sĩ số hiện tại: {snapshot.enrollments.length}/{classroom.maxSize}</p>}</div>
        <button type="button" className="ui-button ui-icon-button" disabled={busy} aria-label="Đóng thêm học viên" onClick={close}><X size={20} /></button>
      </header>
      <div className="space-y-4 overflow-y-auto p-5">
        {loading && <p role="status" className="text-sm text-slate-500">Đang kiểm tra lớp và danh sách ghi danh…</p>}
        {loadError && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{loadError} <button type="button" className="underline" disabled={busy || loading} onClick={() => setRetry(value => value + 1)}>Thử lại</button></div>}
        {full || closed ? <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{closed ? 'Lớp hiện không nhận học viên mới.' : 'Lớp đã đủ sĩ số. Hãy kiểm tra hoặc cập nhật sức chứa của lớp trước khi thêm.'}</p> : null}
        <fieldset disabled={busy || loading || Boolean(loadError) || full || closed} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Ngày vào lớp<input type="date" required className="ui-input mt-2 w-full" value={enrolledAt} onChange={event => setEnrolledAt(event.target.value)} /></label><label className="text-sm font-semibold text-slate-700">Ghi chú (không bắt buộc)<input className="ui-input mt-2 w-full" maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ghi chú ghi danh" /></label></div>
          <label className="block text-sm font-semibold text-slate-700">Tìm học viên<div className="relative mt-2"><Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input className="ui-input w-full pl-10" value={search} onChange={event => { setSearch(event.target.value); setPage(1); setSelected(null) }} placeholder="Họ tên, mã học viên, số điện thoại hoặc email" /></div></label>
          <p className="text-xs text-slate-500">Chọn học viên đang học. Việc thêm vào lớp này giữ nguyên các lớp hiện tại của học viên.</p>
          {searching ? <p role="status" className="py-6 text-center text-sm text-slate-500">Đang tìm học viên…</p> : searchError ? <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{searchError} <button type="button" className="underline" onClick={() => setRetry(value => value + 1)}>Thử lại</button></div> : !students.items.length ? <p className="py-6 text-center text-sm text-slate-500">Không tìm thấy học viên phù hợp.</p> : <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Chọn</th><th className="p-3">Học viên</th><th className="p-3">Liên hệ</th><th className="p-3">Ghi danh</th></tr></thead><tbody>{students.items.map(student => <tr key={student.id} className="border-t border-slate-100"><td className="p-3"><input type="radio" name="enrollment-student" aria-label={`Chọn học viên ${student.name}`} checked={selected?.id === student.id} disabled={existing.has(student.id) || Boolean(student.deletedAt)} onChange={() => setSelected(student)} /></td><td className="p-3"><span className="font-semibold text-slate-800">{student.name}</span><span className="block text-xs text-slate-500">{student.code}</span></td><td className="p-3 text-slate-500">{student.phone || student.email || '—'}</td><td className="p-3 text-xs text-slate-500">{existing.has(student.id) ? 'Đã có trong lớp' : 'Chưa có trong lớp'}</td></tr>)}</tbody></table></div>}
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500"><span>{students.total} học viên · Trang {page}/{Math.max(1, Math.ceil(students.total / 20))}</span><div className="flex gap-2"><button type="button" className="ui-button" disabled={searching || page === 1} onClick={() => setPage(value => value - 1)}>Trước</button><button type="button" className="ui-button" disabled={searching || page * 20 >= students.total} onClick={() => setPage(value => value + 1)}>Tiếp</button></div></div>
        </fieldset>
        {saveError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">{selected ? `Đã chọn: ${selected.name}` : 'Chưa chọn học viên'}</p><div className="flex gap-2"><button type="button" className="ui-button" disabled={busy} onClick={close}>Hủy</button><button type="submit" className="ui-button ui-button-primary" disabled={busy || loading || Boolean(loadError) || !selected || full || closed || existing.has(selected?.id)}>{busy ? <LoaderCircle size={16} className="animate-spin" /> : <UserRoundPlus size={16} />} {busy ? 'Đang thêm…' : 'Thêm vào lớp'}</button></div></footer>
    </form>
  </div>
}
