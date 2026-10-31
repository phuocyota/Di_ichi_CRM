import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/common/BrandLogo.jsx'
import NotificationPopover from '../components/common/NotificationPopover.jsx'
import { navigationItems } from '../datas/navigation.js'
import { removeStoredSession } from '../services/apiClient.js'

export default function MainLayout() {
  const location = useLocation()
  const module = location.pathname.split('/')[1] || 'dashboard'
  const navigate = useNavigate(),
    drawer = useRef(null),
    mobileTrigger = useRef(null)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false),
    [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('diichi-ui-sidebar') === 'collapsed'
    } catch {
      return false
    }
  })
  useEffect(() => {
    const unauthorized = () => navigate('/login', { replace: true })
    window.addEventListener('auth:unauthorized', unauthorized)
    return () => window.removeEventListener('auth:unauthorized', unauthorized)
  }, [navigate])
  useEffect(() => {
    try {
      localStorage.setItem(
        'diichi-ui-sidebar',
        collapsed ? 'collapsed' : 'expanded'
      )
    } catch {}
  }, [collapsed])
  useEffect(() => {
    if (!isMobileNavOpen) return
    const returnTo = mobileTrigger.current
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawer.current?.querySelector('button')?.focus()
    return () => {
      document.body.style.overflow = previous
      returnTo?.focus()
    }
  }, [isMobileNavOpen])
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('ec_admin_user')) || null
    } catch {
      return null
    }
  }, [])
  const logout = () => {
    removeStoredSession()
    navigate('/login', { replace: true })
  }
  const initials = (user?.name || 'Quản trị viên')
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const navigation = (mobile = false) => (
    <nav
      aria-label="Điều hướng chính"
      className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3"
    >
      {navigationItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            data-module={item.path.slice(1)}
            onClick={mobile ? () => setIsMobileNavOpen(false) : undefined}
            className={() =>
              `ui-nav-item group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${collapsed && !mobile ? 'justify-center !px-2' : ''}`
            }
          >
            <Icon size={19} className="ui-nav-icon shrink-0" aria-hidden="true" />
            <span className={collapsed && !mobile ? 'sr-only' : ''}>
              {item.label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
  const brand = (mobile = false) => (
    <div
      className={`flex min-h-[88px] items-center justify-center border-b border-slate-100 ${collapsed && !mobile ? 'px-2' : 'px-5'}`}
    >
      <div className="min-w-0">
        <BrandLogo compact />
        {(!collapsed || mobile) && (
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Cổng quản trị trung tâm
          </p>
        )}
      </div>
      {mobile && (
        <button
          type="button"
          className="ui-button ui-icon-button ml-4"
          aria-label="Đóng menu"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
  const logoutButton = (mobile = false) => (
    <div className="border-t border-slate-100 p-3">
      <button
        type="button"
        onClick={logout}
        title="Đăng xuất"
        className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-700 ${collapsed && !mobile ? 'justify-center' : ''}`}
      >
        <LogOut size={18} />
        <span className={collapsed && !mobile ? 'sr-only' : ''}>Đăng xuất</span>
      </button>
    </div>
  )
  function drawerKey(event) {
    if (event.key === 'Escape') setIsMobileNavOpen(false)
    if (event.key === 'Tab') {
      const nodes = [...drawer.current.querySelectorAll('a,button')],
        first = nodes[0],
        last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }
  return (
    <div className="crm-shell min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:p-3"
      >
        Đến nội dung chính
      </a>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden h-dvh flex-col border-r border-slate-200 bg-white lg:flex ${collapsed ? 'w-[76px]' : 'w-60'}`}
      >
        {brand()}
        {navigation()}
        {logoutButton()}
      </aside>
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Đóng menu"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside
            ref={drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            onKeyDown={drawerKey}
            className="relative flex h-dvh w-[min(280px,86vw)] flex-col bg-white shadow-xl"
          >
            {brand(true)}
            {navigation(true)}
            {logoutButton(true)}
          </aside>
        </div>
      )}
      <div className={collapsed ? 'lg:pl-[76px]' : 'lg:pl-60'}>
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              ref={mobileTrigger}
              type="button"
              className="ui-button ui-icon-button lg:hidden"
              aria-label="Mở menu"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu size={18} />
            </button>
            <button
              type="button"
              className="ui-button ui-icon-button hidden lg:inline-flex"
              aria-label={
                collapsed
                  ? 'Mở rộng thanh điều hướng'
                  : 'Thu gọn thanh điều hướng'
              }
              title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
            <form
              className="ui-search sm:max-w-80"
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                if (search.trim()) {
                  navigate(
                    `/students?search=${encodeURIComponent(search.trim())}`
                  )
                  setSearch('')
                }
              }}
            >
              <Search size={16} aria-hidden="true" />
              <input
                aria-label="Tìm học viên nhanh"
                placeholder="Tìm học viên nhanh…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </form>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <NotificationPopover />
            <div className="hidden min-w-0 items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-semibold text-red-700">
                {initials}
              </span>
              <div className="max-w-40">
                <p
                  className="truncate text-[13px] font-semibold text-slate-800"
                  title={user?.name}
                >
                  {user?.name || 'Quản trị viên'}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {user?.position || 'Quản lý trung tâm'}
                </p>
              </div>
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="crm-content" data-module={module}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
