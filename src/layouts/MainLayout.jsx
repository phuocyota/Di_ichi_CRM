import { useEffect, useMemo, useState } from 'react'
import { LogOut, Menu, Search, X } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/common/BrandLogo.jsx'
import NotificationPopover from '../components/common/NotificationPopover.jsx'
import { navigationItems } from '../datas/navigation.js'
import { removeStoredSession } from '../services/apiClient.js'

function MainLayout() {
  const navigate = useNavigate()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    const handleUnauthorized = () => navigate('/login', { replace: true })
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [navigate])

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('ec_admin_user')) || null
    } catch {
      return null
    }
  }, [])

  const handleLogout = () => {
    removeStoredSession()
    navigate('/login', { replace: true })
  }

  const renderBrandPanel = (showCloseButton = false) => (
    <div className="border-b border-red-100 bg-[linear-gradient(180deg,#fff7f2_0%,#ffffff_100%)] px-5 py-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col items-center text-center">
          <div className="rounded-md bg-white p-2 shadow-enterprise ring-1 ring-red-100">
            <BrandLogo compact />
          </div>
          <p className="mt-3 text-sm font-semibold text-red-700">Cổng quản trị trung tâm</p>
          <p className="mt-1 text-xs text-ink-500">Di-Ichi CRM</p>
        </div>
        {showCloseButton ? (
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-red-100 bg-white text-red-700 shadow-sm"
            aria-label="Đóng menu"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )

  const renderNavigation = (onNavigate) => (
    <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
      {navigationItems.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition',
                isActive
                  ? `${item.activeColor} shadow-md`
                  : 'text-ink-600 hover:bg-slate-50 hover:text-ink-900',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 transition',
                    isActive ? 'bg-white/20 text-white ring-white/30' : item.color,
                  ].join(' ')}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )

  const renderLogout = () => (
    <div className="border-t border-red-100 bg-red-50/50 p-3">
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-md border border-red-100 bg-white px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white"
      >
        <LogOut size={18} aria-hidden="true" />
        <span>Đăng xuất</span>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted text-ink-900">
      <aside className="fixed inset-y-0 left-0 hidden h-dvh w-64 border-r border-red-100 bg-white lg:flex lg:flex-col">
        {renderBrandPanel()}
        {renderNavigation()}
        {renderLogout()}
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-900/40"
            aria-label="Đóng menu"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative flex h-dvh w-[min(20rem,86vw)] flex-col border-r border-red-100 bg-white shadow-2xl">
            {renderBrandPanel(true)}
            {renderNavigation(() => setIsMobileNavOpen(false))}
            {renderLogout()}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-red-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-700 lg:hidden"
              aria-label="Mở menu"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-red-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#eff6ff_100%)] px-3 shadow-sm md:max-w-md">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-red-100 text-red-700">
                <Search size={16} aria-hidden="true" />
              </span>
              <input
                className="w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-ink-500"
                placeholder="Tìm học viên, lớp học, hóa đơn"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <NotificationPopover />
            <div className="hidden items-center gap-3 rounded-md border border-red-100 bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_52%,#eff6ff_100%)] px-3 py-2 shadow-sm sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-600 text-sm font-bold text-white shadow-md shadow-red-100">
                QV
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-ink-900">
                  {currentUser?.name || 'Quản trị viên'}
                </p>
                <p className="text-xs font-semibold text-red-700">
                  {currentUser?.position || 'Quản lý trung tâm'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
