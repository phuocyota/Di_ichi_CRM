import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import {
  notificationFilters,
  notificationToneStyles,
  notifications,
} from '../../datas/notifications.js'
import NotificationDetailModal from './NotificationDetailModal.jsx'

function NotificationPopover() {
  const notificationRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedNotification, setSelectedNotification] = useState(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (selectedNotification) {
          setSelectedNotification(null)
        } else {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, selectedNotification])

  const unreadCount = notifications.filter((item) => item.status === 'unread').length
  const urgentCount = notifications.filter((item) => item.priority === 'urgent').length
  const visibleNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return item.status === 'unread'
    if (activeFilter === 'urgent') return item.priority === 'urgent'
    return true
  })

  return (
    <div className="relative" ref={notificationRef}>
      <button
        type="button"
        className={[
          'relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-amber-100 bg-amber-50 text-amber-700 shadow-sm transition hover:bg-amber-100',
          isOpen ? 'ring-2 ring-amber-200' : '',
        ].join(' ')}
        aria-label="Thông báo"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell size={19} aria-hidden="true" />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-14 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-red-100 bg-white shadow-2xl"
          role="dialog"
          aria-label="Danh sách thông báo"
        >
          <div className="border-b border-red-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_58%,#eff6ff_100%)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-ink-900">Thông báo</p>
                <p className="mt-1 text-xs font-semibold text-ink-500">
                  {unreadCount} chưa đọc · {urgentCount} khẩn cấp
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-100 bg-white px-3 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                <CheckCheck size={15} aria-hidden="true" />
                Đã đọc
              </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {notificationFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={[
                    'shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition',
                    activeFilter === filter.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-ink-600 hover:bg-slate-50',
                  ].join(' ')}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[min(32rem,calc(100dvh-9rem))] overflow-y-auto p-2">
            {visibleNotifications.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    'flex w-full gap-3 rounded-md p-3 text-left transition hover:bg-slate-50',
                    item.status === 'unread' ? 'bg-blue-50/50' : 'bg-white',
                  ].join(' ')}
                  onClick={() => setSelectedNotification(item)}
                >
                  <span
                    className={[
                      'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1',
                      notificationToneStyles[item.tone],
                    ].join(' ')}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0 text-sm font-black text-ink-900">
                        {item.title}
                      </span>
                      {item.status === 'unread' ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs font-medium leading-5 text-ink-600">
                      {item.message}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-ink-500">{item.time}</span>
                      <span className="shrink-0 rounded bg-white px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                        {item.actionLabel}
                      </span>
                    </span>
                  </span>
                </button>
              )
            })}

            {!visibleNotifications.length ? (
              <div className="px-4 py-8 text-center text-sm font-bold text-ink-500">
                Không có thông báo phù hợp.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  )
}

export default NotificationPopover
