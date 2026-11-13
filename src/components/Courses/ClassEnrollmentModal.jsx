import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Search, UserRoundPlus, X } from 'lucide-react'
import { addStudentsToClass, enrollmentToday, findEnrollmentStudents, getClassEnrollmentState } from '../../services/classEnrollment.js'

export default function ClassEnrollmentModal({ item, onClose, onAdded }) {
  const [snapshot, setSnapshot] = useState(null)
  const [students, setStudents] = useState({ items: [], total: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [outcome, setOutcome] = useState(null)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
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
      if (!controller.signal.aborted) {
        setSnapshot(result)
        const enrolledIds = new Set(result.enrollments.map(row => row.studentId))
        setSelected(current => current.filter(student => !enrolledIds.has(student.id)))
      }
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
  const available = classroom ? Math.max(0, Number(classroom.maxSize) - snapshot.enrollments.length) : 0
  const overCapacity = Boolean(classroom) && selected.length > available
  const selectedIds = new Set(selected.map(student => student.id))
  const selectable = students.items.filter(student => !existing.has(student.id) && !student.deletedAt)
  const allPageSelected = selectable.length > 0 && selectable.every(student => selectedIds.has(student.id))
  const somePageSelected = selectable.some(student => selectedIds.has(student.id)) && !allPageSelected
  const toggleStudent = (student, checked) => setSelected(current => checked ? [...current.filter(row => row.id !== student.id), student] : current.filter(row => row.id !== student.id))
  const togglePage = checked => setSelected(current => {
    const pageIds = new Set(selectable.map(student => student.id))
    const others = current.filter(student => !pageIds.has(student.id))
    return checked ? [...others, ...selectable] : others
  })
  const closed = classroom && (!['active', 'upcoming'].includes(classroom.status) || Boolean(classroom.deletedAt))
  const close = () => { if (!pending.current) onClose() }
  const submit = async event => {
    event.preventDefault()
    if (pending.current || loading || loadError || !selected.length || full || closed || overCapacity) return
    pending.current = true
    setBusy(true)
    form.current?.focus()
    setSaveError('')
    setOutcome(null)
    setProgress({ completed: 0, total: selected.length })
    try {
      const result = await addStudentsToClass({ classId: item.id, students: selected, enrolledAt, reason }, setProgress)
      const confirmed = [...result.added, ...result.existing].map(row => row.enrollment)
      setSnapshot(current => current ? { ...current, enrollments: [...current.enrollments.filter(row => !confirmed.some(saved => saved.studentId === row.studentId)), ...confirmed] } : current)
      setSelected(result.failed.map(row => row.student))
      setOutcome(result)
      onAdded({ enrollments: confirmed, addedCount: result.added.length, existingCount: result.existing.length, close: result.failed.length === 0 })
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
        {selected.length > 0 && <div className="rounded-xl border border-blue-100 bg-blue-50 p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-blue-800">Đã chọn {selected.length} học viên</p><button type="button" className="text-xs font-semibold text-blue-700 underline" disabled={busy} onClick={() => setSelected([])}>Bỏ chọn tất cả</button></div><div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-y-auto">{selected.map(student => <button key={student.id} type="button" disabled={busy} onClick={() => toggleStudent(student, false)} aria-label={`Bỏ chọn ${student.name}`} className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-white px-2 py-1 text-xs text-blue-800">{student.name}<X size={13} /></button>)}</div></div>}
        {overCapacity && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Đã chọn {selected.length} học viên nhưng lớp chỉ còn {available} chỗ. Vui lòng giảm số học viên đã chọn.</p>}
        <fieldset disabled={busy || loading || Boolean(loadError) || full || closed} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Ngày vào lớp<input type="date" required className="ui-input mt-2 w-full" value={enrolledAt} onChange={event => setEnrolledAt(event.target.value)} /></label><label className="text-sm font-semibold text-slate-700">Ghi chú (không bắt buộc)<input className="ui-input mt-2 w-full" maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ghi chú ghi danh" /></label></div>
          <label className="block text-sm font-semibold text-slate-700">Tìm học viên<div className="relative mt-2"><Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input className="ui-input w-full pl-10" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Họ tên, mã học viên, số điện thoại hoặc email" /></div></label>
          <p className="text-xs text-slate-500">Có thể chọn nhiều học viên qua các trang và kết quả tìm kiếm. Việc thêm vào lớp này giữ nguyên các lớp hiện tại của học viên.</p>
          {searching ? <p role="status" className="py-6 text-center text-sm text-slate-500">Đang tìm học viên…</p> : searchError ? <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{searchError} <button type="button" className="underline" onClick={() => setRetry(value => value + 1)}>Thử lại</button></div> : !students.items.length ? <p className="py-6 text-center text-sm text-slate-500">Không tìm thấy học viên phù hợp.</p> : <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3"><input type="checkbox" aria-label="Chọn tất cả học viên hợp lệ trong trang" checked={allPageSelected} aria-checked={somePageSelected ? 'mixed' : allPageSelected} ref={node => { if (node) node.indeterminate = somePageSelected }} disabled={searching || !selectable.length} onChange={event => togglePage(event.target.checked)} /></th><th className="p-3">Học viên</th><th className="p-3">Liên hệ</th><th className="p-3">Ghi danh</th></tr></thead><tbody>{students.items.map(student => <tr key={student.id} className="border-t border-slate-100"><td className="p-3"><input type="checkbox" name="enrollment-student" aria-label={`Chọn học viên ${student.name}`} checked={selectedIds.has(student.id)} disabled={existing.has(student.id) || Boolean(student.deletedAt)} onChange={event => toggleStudent(student, event.target.checked)} /></td><td className="p-3"><span className="font-semibold text-slate-800">{student.name}</span><span className="block text-xs text-slate-500">{student.code}</span></td><td className="p-3 text-slate-500">{student.phone || student.email || '—'}</td><td className="p-3 text-xs text-slate-500">{existing.has(student.id) ? 'Đã có trong lớp' : 'Chưa có trong lớp'}</td></tr>)}</tbody></table></div>}
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500"><span>{students.total} học viên · Trang {page}/{Math.max(1, Math.ceil(students.total / 20))}</span><div className="flex gap-2"><button type="button" className="ui-button" disabled={searching || page === 1} onClick={() => setPage(value => value - 1)}>Trước</button><button type="button" className="ui-button" disabled={searching || page * 20 >= students.total} onClick={() => setPage(value => value + 1)}>Tiếp</button></div></div>
        </fieldset>
        {busy && <p role="status" className="text-sm text-blue-700">Đang xử lý {progress.completed}/{progress.total} học viên…</p>}
        {outcome && <div role={outcome.failed.length ? 'alert' : 'status'} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"><p>Đã thêm: {outcome.added.length} · Đã có trong lớp: {outcome.existing.length} · Chưa thêm được: {outcome.failed.length}</p>{outcome.failed.length > 0 && <><p className="mt-2">Các học viên chưa thêm được vẫn được giữ lựa chọn để thử lại.</p><ul className="mt-2 space-y-1">{outcome.failed.map(row => <li key={row.student.id}><strong>{row.student.name}:</strong> {row.message}</li>)}</ul><button type="button" className="mt-2 font-semibold underline" disabled={busy || loading} onClick={() => setRetry(value => value + 1)}>Tải lại sĩ số và danh sách</button></>}</div>}
        {saveError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">{selected.length ? `Đã chọn ${selected.length} học viên` : 'Chưa chọn học viên'}</p><div className="flex gap-2"><button type="button" className="ui-button" disabled={busy} onClick={close}>Hủy</button><button type="submit" className="ui-button ui-button-primary" disabled={busy || loading || Boolean(loadError) || !selected.length || full || closed || overCapacity}>{busy ? <LoaderCircle size={16} className="animate-spin" /> : <UserRoundPlus size={16} />} {busy ? `Đang thêm ${progress.completed}/${progress.total}…` : `Thêm ${selected.length || ''} học viên vào lớp`}</button></div></footer>
    </form>
  </div>
}
