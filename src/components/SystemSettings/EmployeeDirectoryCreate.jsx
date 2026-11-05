import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createEmployeeDirectory } from '../../services/systemSettingsApi.js'

export default function EmployeeDirectoryCreate({ resource, onCreated, onClose }) {
  const label = resource === 'department' ? 'phòng ban' : 'chức vụ'
  const [code, setCode] = useState(''), [name, setName] = useState('')
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const codeInput = useRef(null), saving = useRef(false)
  useEffect(() => {
    const previous = document.activeElement
    codeInput.current?.focus()
    return () => previous?.isConnected && previous.focus()
  }, [])
  async function submit(event) {
    event.preventDefault()
    if (saving.current) return
    saving.current = true; setBusy(true); setError('')
    try { onCreated(await createEmployeeDirectory(resource, { code, name })) }
    catch (cause) { setError(cause.message) }
    finally { saving.current = false; setBusy(false) }
  }
  return createPortal(<div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4" onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); if (!saving.current) onClose() }
    if (event.key === 'Tab') {
      const nodes = [...event.currentTarget.querySelectorAll('input:not(:disabled), button:not(:disabled)')]
      const first = nodes[0], last = nodes.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
  }}><section role="dialog" aria-modal="true" aria-label={`Thêm ${label}`} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
    <h2 className="text-lg font-semibold">Thêm {label}</h2>
    <form className="mt-4 space-y-4" onSubmit={submit}>
      <label className="block text-sm font-semibold">Mã {label} *<input ref={codeInput} required disabled={busy} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={code} onChange={event => setCode(event.target.value)} placeholder={resource === 'position' ? 'Ví dụ: SALE, CSKH' : 'Ví dụ: KINH_DOANH'} /></label>
      <label className="block text-sm font-semibold">Tên {label} *<input required disabled={busy} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={name} onChange={event => setName(event.target.value)} /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <footer className="flex justify-end gap-2"><button type="button" className="ui-button" disabled={busy} onClick={onClose}>Hủy</button><button className="ui-button ui-button-primary" disabled={busy}>{busy ? 'Đang lưu…' : `Lưu ${label}`}</button></footer>
    </form>
  </section></div>, document.body)
}
