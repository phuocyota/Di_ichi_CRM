import React, { useState } from 'react'
import { X } from 'lucide-react'

export default function StudentAccountModal({ student, onClose, onSubmit }) {
  const [email, setEmail] = useState(student?.email || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!student) return null
  async function submit(event) {
    event.preventDefault()
    if (busy || student.hasAccount === true) return
    setBusy(true); setError('')
    try { await onSubmit('create-account', { email }, student) }
    catch (cause) { setError(cause.message || 'Không thể tạo tài khoản học viên') }
    finally { setBusy(false) }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="student-account-title" className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
      <header className="flex items-start justify-between border-b border-slate-200 p-6"><div><h2 id="student-account-title" className="text-lg font-semibold">Tạo tài khoản học sinh</h2><p className="mt-1 text-sm text-slate-500">{student.name} · {student.code}</p></div><button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="rounded-lg border p-2 disabled:opacity-40"><X size={18} /></button></header>
      <form className="space-y-4 p-6" onSubmit={submit}>
        <label className="block text-sm font-semibold">Email đăng nhập *<input required type="email" autoComplete="username" maxLength={254} disabled={busy} value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" /></label>
        <p className="text-sm text-slate-600">Nhập email để tạo tài khoản đăng nhập cho học viên. Mật khẩu ban đầu: <strong>123456</strong>.</p>
        <p className="text-sm text-slate-600">Học sinh có thể đổi mật khẩu sau khi đăng nhập vào Student LMS.</p>
        {student.statusValue !== 'active' && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Tài khoản sẽ được tạo. Học viên cần ở trạng thái Đang học để đăng nhập.</p>}
        {student.hasAccount === true && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Học viên đã có tài khoản đăng nhập.</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <footer className="flex justify-end gap-3 border-t pt-4"><button type="button" disabled={busy} onClick={onClose} className="rounded-xl border px-4 py-2.5 disabled:opacity-40">Hủy</button><button type="submit" disabled={busy || !email.trim() || student.hasAccount === true} className="rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:opacity-40">{busy ? 'Đang tạo…' : 'Tạo tài khoản'}</button></footer>
      </form>
    </section>
  </div>
}
