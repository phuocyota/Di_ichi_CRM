import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getNotifications,
  readNotifications
} from '../../services/workspaceApi.js'

export default function NotificationPopover() {
  const ref = useRef(null)
  const [open, setOpen] = useState(false),
    [rows, setRows] = useState([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState('all')
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getNotifications()
      if (!Array.isArray(data))
        throw new Error('Dữ liệu thông báo không hợp lệ')
      setRows(data)
    } catch (cause) {
      setError(cause.message)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useEffect(() => {
    if (!open) return
    load()
    const outside = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open, load])
  async function mark(id) {
    setBusy(true)
    setError('')
    try {
      await readNotifications(id)
      await load()
    } catch (cause) {
      setError(cause.message)
    } finally {
      setBusy(false)
    }
  }
  const unread = rows.filter((r) => !r.readAt).length
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Thông báo"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="ui-button ui-icon-button relative"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full border-2 border-white bg-red-600 px-1.5 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <section
          role="dialog"
          aria-label="Danh sách thông báo"
          className="absolute right-0 top-14 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <header className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Thông báo</h2>
                <p className="mt-1 text-xs text-slate-500">{unread} chưa đọc</p>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Tải lại thông báo"
                  disabled={loading}
                  onClick={load}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                >
                  <RefreshCcw size={16} />
                </button>
                <button
                  disabled={busy || !unread}
                  onClick={() => mark()}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 p-2 text-xs font-bold text-blue-700 disabled:opacity-40"
                >
                  <CheckCheck size={16} />
                  Đọc tất cả
                </button>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {[
                ['all', 'Tất cả'],
                ['unread', 'Chưa đọc']
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === v ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </header>
          <div className="max-h-[min(30rem,65vh)] overflow-y-auto p-2">
            {error && (
              <p role="alert" className="p-3 text-sm text-red-600">
                {error}
              </p>
            )}
            {loading && (
              <p role="status" className="p-3 text-sm text-slate-500">
                Đang tải thông báo…
              </p>
            )}
            {rows
              .filter((r) => filter !== 'unread' || !r.readAt)
              .map((r) => (
                <article
                  key={r.id}
                  className={`mb-1 rounded-xl p-3 ${r.readAt ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <h3 className="text-sm font-bold text-slate-800">
                    {r.title}
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                    {r.content}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </p>
                  <div className="mt-2 flex gap-3">
                    {!r.readAt && (
                      <button
                        className="text-xs font-semibold text-blue-600"
                        disabled={busy}
                        onClick={() => mark(r.id)}
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    {r.targetPath?.startsWith('/') &&
                      !r.targetPath.startsWith('//') && (
                        <Link
                          className="text-xs font-semibold text-blue-600"
                          to={r.targetPath}
                          onClick={() => {
                            setOpen(false)
                            if (!r.readAt) mark(r.id)
                          }}
                        >
                          Xem chi tiết
                        </Link>
                      )}
                  </div>
                </article>
              ))}
            {!loading &&
              !error &&
              !rows.some((r) => filter !== 'unread' || !r.readAt) && (
                <p className="p-8 text-center text-sm text-slate-400">
                  Chưa có thông báo.
                </p>
              )}
          </div>
        </section>
      )}
    </div>
  )
}
