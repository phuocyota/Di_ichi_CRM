import { X } from 'lucide-react'
import { notificationToneStyles } from '../../datas/notifications.js'

function NotificationDetailModal({ notification, onClose }) {
  if (!notification) return null

  const Icon = notification.icon
  const detail = notification.detail

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/45 px-4 py-6">
      <section
        className="flex max-h-[min(42rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-red-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết thông báo: ${notification.title}`}
      >
        <div className="border-b border-red-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_58%,#eff6ff_100%)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <span
                className={[
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-md ring-1',
                  notificationToneStyles[notification.tone],
                ].join(' ')}
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-red-700">Chi tiết thông báo</p>
                <h2 className="mt-1 text-xl font-black leading-tight text-ink-900">
                  {notification.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-ink-600">{notification.message}</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-100 bg-white text-ink-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
              aria-label="Đóng chi tiết thông báo"
              onClick={onClose}
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Mã thông báo</p>
              <p className="mt-1 text-sm font-black text-ink-900">{detail.code}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Thời gian tạo</p>
              <p className="mt-1 text-sm font-black text-ink-900">{detail.createdAt}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Nguồn</p>
              <p className="mt-1 text-sm font-black text-ink-900">{detail.source}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Phụ trách</p>
              <p className="mt-1 text-sm font-black text-ink-900">{detail.owner}</p>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase text-amber-700">{detail.priorityLabel}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink-700">{detail.content}</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-black text-ink-900">Thông tin liên quan</p>
            <div className="mt-3 overflow-hidden rounded-md border border-slate-200">
              {detail.fields.map((field) => (
                <div
                  key={`${notification.id}-${field.label}`}
                  className="grid gap-1 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:grid-cols-[10rem_1fr]"
                >
                  <span className="text-xs font-bold uppercase text-slate-500">{field.label}</span>
                  <span className="text-sm font-bold text-ink-900">{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-red-100 bg-white p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-slate-50"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            {notification.actionLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

export default NotificationDetailModal
