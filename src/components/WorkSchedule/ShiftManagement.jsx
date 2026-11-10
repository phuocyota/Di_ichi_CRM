import { useRef, useState } from 'react'
import { Sun, Moon, Clock3, Plus, X, RefreshCcw } from 'lucide-react'
import { Field } from './WorkScheduleDialog.jsx'
import { configuredWorkShifts } from '../../services/workShifts.js'

function ShiftTimeForm({ branchId, shifts, revision, saved, saving, onSave, renderHeader }) {
  const configured = configuredWorkShifts(shifts, branchId)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const draftRevision = useRef(revision)
  const values = draft || configured
  const change = (id, field, value) => {
    if (!draft) draftRevision.current = revision
    setDraft(values.map(shift => shift.id === id ? { ...shift, [field]: value } : shift))
    setError('')
  }
  const submit = async event => {
    event.preventDefault()
    if (saving || (!draft && saved)) return
    try { await onSave(values, draft ? draftRevision.current : revision); setDraft(null); setError('') } catch (cause) { setError(cause.message) }
  }
  const addShift = () => {
    if (!draft) draftRevision.current = revision
    setDraft([...values, { id: crypto.randomUUID(), branchId, name: '', start: '', end: '' }]); setError('')
  }
  return <>
    {renderHeader(addShift)}
    <form className="work-form" onSubmit={submit}>
    <fieldset disabled={saving} className="contents">
    {!saved && <p className="work-hint">Cơ sở chưa lưu cấu hình ca làm. Đang hiển thị khung giờ mặc định từ máy chủ.</p>}
    <div className="grid gap-4 md:grid-cols-2">
      {values.map((shift, index) => {
        const Icon = index === 0 ? Sun : index === 1 ? Moon : Clock3
        return <section key={shift.id} className="rounded-xl border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-base font-semibold"><Icon size={20} />{shift.name || 'Ca bổ sung'}</h3>{index > 1 && !configured.some(item => item.id === shift.id) && <button type="button" className="ui-button ui-icon-button" aria-label="Bỏ ca chưa lưu" onClick={() => setDraft(values.filter(item => item.id !== shift.id))}><X size={16} /></button>}</div>
          {index > 1 && <div className="mb-4"><Field label="Tên ca làm"><input required maxLength={100} value={shift.name} placeholder="Ví dụ: Ca chiều" onChange={event => change(shift.id, 'name', event.target.value)} /></Field></div>}
          <div className="work-form-row">
            <Field label={`${shift.name} từ giờ`}><input required type="time" value={shift.start} onChange={event => change(shift.id, 'start', event.target.value)} /></Field>
            <Field label="Đến giờ"><input required type="time" value={shift.end} onChange={event => change(shift.id, 'end', event.target.value)} /></Field>
          </div>
        </section>
      })}
    </div>
    <p className="work-hint">Khung giờ được lưu trên máy chủ và dùng mặc định khi phân lịch nhân viên. Lịch đã phân giữ nguyên giờ đã lưu.</p>
    {error && <p className="work-error" role="alert">{error}</p>}
    <footer>
      <button type="button" className="ui-button" disabled={!draft} onClick={() => { setDraft(null); setError('') }}>Hủy thay đổi</button>
      <button className="ui-button ui-button-primary" disabled={!draft && saved}>{saving ? 'Đang lưu…' : 'Lưu khung giờ ca làm'}</button>
    </footer>
    </fieldset>
  </form></>
}

export default function ShiftManagement({ branches, branchId, onBranchChange, shifts, revision, saved, saving, loading, error, onReload, onSave }) {
  const renderHeader = onAdd => (
    <div className="work-section-heading">
      <div><h2>Quản lý ca làm</h2><p>Thiết lập giờ Ca sáng, Ca tối và thêm ca làm theo từng cơ sở.</p></div>
      <div className="work-toolbar"><button type="button" className="ui-button" disabled={saving || loading} onClick={onReload}><RefreshCcw size={16} />Tải lại</button><button type="button" className="ui-button" disabled={saving || loading || Boolean(error) || !onAdd} onClick={onAdd}><Plus size={16} />Thêm ca làm</button><label className="work-branch"><span className="sr-only">Cơ sở quản lý ca làm</span><select aria-label="Cơ sở quản lý ca làm" value={branchId} disabled={saving || loading || Boolean(error)} onChange={event => onBranchChange(event.target.value)}><option value="" disabled>Chọn cơ sở</option>{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label></div>
    </div>
  )
  return <section className="work-panel">
    {(loading || error || !branchId) && renderHeader()}
    {loading ? <p className="work-hint p-5" role="status">Đang tải cấu hình ca làm…</p> : error ? <div className="work-error m-5" role="alert">{error} <button type="button" className="ui-button" onClick={onReload}>Thử lại</button></div> : !branchId ? <p className="work-hint p-5">Chưa có cơ sở để cấu hình ca làm.</p> : <ShiftTimeForm key={branchId} branchId={branchId} shifts={shifts} revision={revision} saved={saved} saving={saving} onSave={onSave} renderHeader={renderHeader} />}
  </section>
}
