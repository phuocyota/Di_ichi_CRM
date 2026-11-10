import { useState } from 'react'
import WorkScheduleDialog, { Field } from './WorkScheduleDialog.jsx'

export default function DayOffForm({ initial, people, onSave, onClose }) {
  const [personId, setPersonId] = useState('')
  const [date, setDate] = useState(initial.date)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async event => {
    event.preventDefault()
    if (saving) return
    if (!personId) return setError('Vui lòng chọn nhân viên.')
    setSaving(true)
    try { await onSave(personId, date) } catch (cause) { setError(cause.message) } finally { setSaving(false) }
  }
  return <WorkScheduleDialog title="Đăng ký ngày nghỉ (OFF)" onClose={onClose}>
    <form onSubmit={submit} className="work-form">
      <Field label="Nhân viên"><select required value={personId} onChange={e => { setPersonId(e.target.value); setError('') }}>
        <option value="">Chọn nhân viên</option>
        {people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
      </select></Field>
      <Field label="Ngày nghỉ"><input required type="date" value={date} onChange={e => { setDate(e.target.value); setError('') }} /></Field>
      <p className="work-hint">Nhân viên đã có lịch ngày này thì máy chủ từ chối: hãy xóa hoặc thay người trước.</p>
      {error && <p role="alert" className="work-error">{error}</p>}
      <footer><button type="button" className="ui-button" onClick={onClose}>Hủy</button><button disabled={saving} className="ui-button ui-button-primary">Lưu ngày nghỉ</button></footer>
    </form>
  </WorkScheduleDialog>
}
