import { statusInfo } from './presentation.js'
import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  MoreHorizontal,
  Search,
  X
} from 'lucide-react'

export function Breadcrumb({ current }) {
  return (
    <nav className="ui-breadcrumb" aria-label="Đường dẫn">
      <span>Cổng quản trị</span>
      <ChevronRight size={12} aria-hidden="true" />
      <span aria-current="page">{current}</span>
    </nav>
  )
}
export function PageTabs({ tabs, value, onChange, label = 'Chuyên mục' }) {
  return (
    <nav className="ui-tabs" aria-label={label}>
      {tabs.map((item) => {
        const tab =
          typeof item === 'string'
            ? { key: item, label: item === 'Dashboard' ? 'Tổng quan' : item }
            : Array.isArray(item)
              ? { key: item[0], label: item[1] }
              : item
        return (
          <button
            type="button"
            key={tab.key}
            aria-pressed={value === tab.key}
            className={`ui-tab ${value === tab.key ? 'is-active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
export function SearchInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm…',
  label = 'Tìm kiếm',
  className = ''
}) {
  return (
    <label className={`ui-search ${className}`}>
      <Search size={16} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          title="Xóa tìm kiếm"
          aria-label="Xóa tìm kiếm"
          onClick={() => onChange('')}
        >
          <X size={14} />
        </button>
      )}
    </label>
  )
}
export function FilterBar({ children, onClear = null, active = false }) {
  const chips = []
  const text = nodes => React.Children.toArray(nodes).map(node => React.isValidElement(node) ? text(/** @type {{children?: import('react').ReactNode}} */ (node.props).children) : String(node ?? '')).join('')
  // Derive chips from controlled selects, preserving the existing callbacks.
  function collect(nodes) {
    React.Children.forEach(nodes, node => {
      if (!React.isValidElement(node)) return
      if (node.type === 'label') {
        const contents = React.Children.toArray(node.props.children)
        const select = contents.filter(React.isValidElement).find(child => child.type === 'select')
        const props = /** @type {{value?: string | number, children?: import('react').ReactNode}} */ (select?.props || {})
        if (props.value !== undefined && props.value !== null && String(props.value) !== '') {
          const option = React.Children.toArray(props.children).filter(React.isValidElement).find(child => String(/** @type {{value?: string | number}} */ (child.props).value) === String(props.value))
          const optionProps = /** @type {{children?: import('react').ReactNode}} */ (option?.props || {})
          chips.push({ label: text(contents.filter(child => child !== select)).trim(), value: text(optionProps.children) || String(props.value) })
        }
      } else collect(node.props.children)
    })
  }
  collect(children)
  return (
    <section className="ui-filterbar" aria-label="Bộ lọc">
      <div className="ui-filter-grid">{children}</div>
      {active && onClear && (
        <button
          type="button"
          className="ui-button ui-button-quiet"
          onClick={onClear}
        >
          Xóa bộ lọc
        </button>
      )}
      {chips.length > 0 && <div className="ui-filter-chips" aria-label="Bộ lọc đang áp dụng">{chips.map((chip, index) => <span className="ui-filter-chip" key={index}><strong>{chip.label}:</strong> {chip.value}</span>)}</div>}
    </section>
  )
}
export function StatusBadge({ value, context = 'general', children = null }) {
  const [label, tone] = statusInfo(value, context)
  return (
    <span className={`ui-badge ui-badge-${tone}`}>
      <span className="ui-status-dot" aria-hidden="true" />
      {children || label}
    </span>
  )
}
export function EmptyState({
  title = 'Chưa có dữ liệu',
  description = 'Dữ liệu sẽ xuất hiện khi có bản ghi phù hợp.',
  action = null,
  compact = false
}) {
  return (
    <div className={`ui-empty ${compact ? 'ui-empty-compact' : ''}`}>
      <span className="ui-empty-icon">
        <Inbox size={22} aria-hidden="true" />
      </span>
      <p className="ui-card-title">{title}</p>
      {description && <p className="ui-caption">{description}</p>}
      {action}
    </div>
  )
}
export function LoadingSkeleton({ label = 'Đang tải dữ liệu…', rows = 3 }) {
  return (
    <div className="ui-skeleton" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="ui-skeleton-line ui-skeleton-title" />
      {Array.from({ length: rows }, (_, i) => (
        <div className="ui-skeleton-line" key={i} />
      ))}
    </div>
  )
}
export function Pagination({
  page,
  pages,
  total,
  size,
  onPageChange,
  onSizeChange,
  label = 'bản ghi'
}) {
  return (
    <footer className="ui-pagination">
      <span>
        {new Intl.NumberFormat('vi-VN').format(total)} {label} · Trang {page}/
        {Math.max(1, pages)}
      </span>
      <div>
        {onSizeChange && (
          <select
            aria-label="Số dòng mỗi trang"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100]
              .filter((n) => n !== 5 || size === 5)
              .map((n) => (
                <option key={n} value={n}>
                  {n} dòng / trang
                </option>
              ))}
          </select>
        )}
        <button
          type="button"
          className="ui-button ui-button-small"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} />
          Trước
        </button>
        <button
          type="button"
          className="ui-button ui-button-small"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
          <ChevronRight size={14} />
        </button>
      </div>
    </footer>
  )
}
export function ChartCard({
  title,
  description = null,
  actions = null,
  children
}) {
  return (
    <section className="ui-card ui-chart-card">
      <header className="ui-section-heading">
        <div>
          <h2 className="ui-card-title">{title}</h2>
          {description && <p className="ui-caption">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}

export function DateRangePicker({ from, to, onFromChange, onToChange }) {
  return (
    <div className="ui-date-range">
      <label>
        Từ ngày
        <input
          className="ui-input"
          aria-label="Từ ngày"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onFromChange(e.target.value)}
        />
      </label>
      <span aria-hidden="true">—</span>
      <label>
        Đến ngày
        <input
          className="ui-input"
          aria-label="Đến ngày"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onToChange(e.target.value)}
        />
      </label>
    </div>
  )
}
export function ConfirmDialog({
  open,
  title = 'Xác nhận thao tác',
  description,
  confirmLabel = 'Xác nhận',
  danger = false,
  onConfirm,
  onClose,
  busy = false
}) {
  const ref = useRef(null),
    titleId = useId(),
    descriptionId = useId()
  const [pending, setPending] = useState(false),
    [error, setError] = useState('')
  const blocked = pending || busy
  useEffect(() => {
    if (!open) return
    setError('')
    const previous = document.activeElement
    ref.current?.querySelector('button')?.focus()
    return () =>
      previous instanceof HTMLElement &&
      previous.isConnected &&
      previous.focus()
  }, [open])
  if (!open) return null
  async function confirm() {
    if (blocked) return
    setPending(true)
    setError('')
    try {
      await onConfirm()
    } catch (cause) {
      setError(cause.message || 'Không thực hiện được thao tác')
    } finally {
      setPending(false)
    }
  }
  function keyboard(event) {
    if (event.key === 'Escape' && !blocked) {
      event.stopPropagation()
      onClose()
    }
    if (event.key === 'Tab') {
      const nodes = [...ref.current.querySelectorAll('button:not(:disabled)')],
        first = nodes[0],
        last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  }
  return createPortal(
    <div className="ui-dialog-backdrop" onKeyDown={keyboard}>
      <section
        className="ui-confirm-dialog"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <span className={`ui-dialog-symbol ${danger ? 'is-danger' : ''}`}>
          <CheckCircle2 size={24} />
        </span>
        <h2 id={titleId} className="ui-section-title">
          {title}
        </h2>
        <p id={descriptionId} className="ui-secondary">
          {description}
        </p>
        {error && (
          <p role="alert" className="ui-error">
            {error}
          </p>
        )}
        <footer className="ui-dialog-actions">
          <button
            type="button"
            className="ui-button"
            disabled={blocked}
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className={`ui-button ${danger ? 'ui-button-danger' : 'ui-button-primary'}`}
            disabled={blocked}
            onClick={confirm}
          >
            {blocked ? 'Đang xử lý…' : confirmLabel}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  )
}
export function ActionDropdown({
  items,
  label = 'Thao tác',
  icon: TriggerIcon = MoreHorizontal,
  title = null,
  compact = false
}) {
  const [open, setOpen] = useState(false),
    [position, setPosition] = useState({ top: 0, left: 0 })
  const trigger = useRef(null),
    menu = useRef(null),
    id = useId()
  useLayoutEffect(() => {
    if (!open) return
    const r = trigger.current.getBoundingClientRect(),
      m = menu.current
    setPosition({
      left: Math.max(
        8,
        Math.min(r.right - m.offsetWidth, window.innerWidth - m.offsetWidth - 8)
      ),
      top:
        r.bottom + m.offsetHeight + 8 <= window.innerHeight
          ? r.bottom + 8
          : Math.max(8, r.top - m.offsetHeight - 8)
    })
    m.querySelector('button:not(:disabled)')?.focus()
  }, [open])
  useEffect(() => {
    if (!open) return
    const outside = (e) => {
      if (
        !menu.current?.contains(e.target) &&
        !trigger.current?.contains(e.target)
      )
        setOpen(false)
    }
    const close = () => setOpen(false),
      scroll = (e) => {
        if (!menu.current?.contains(e.target)) close()
      }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', scroll, true)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', scroll, true)
    }
  }, [open])
  function keydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      trigger.current.focus()
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      const nodes = [...menu.current.querySelectorAll('button:not(:disabled)')],
        i = nodes.indexOf(document.activeElement),
        n =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? nodes.length - 1
              : (i + (event.key === 'ArrowDown' ? 1 : -1) + nodes.length) %
                nodes.length
      nodes[n]?.focus()
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
      trigger.current.focus()
    }
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        title={label}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className={`ui-button ${compact ? 'ui-icon-button' : ''}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        <TriggerIcon size={16} aria-hidden="true" />
        {!compact && (
          <>
            {label}
            <ChevronDown size={14} />
          </>
        )}
      </button>
      {open &&
        createPortal(
          <div
            ref={menu}
            style={position}
            id={id}
            role="menu"
            aria-label={label}
            className="ui-action-menu"
            onKeyDown={keydown}
          >
            {title && <p className="ui-menu-title">{title}</p>}
            {items
              .filter((item) => !item.hidden)
              .map((item, i) => (
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  key={item.key || item.label || i}
                  className={`ui-menu-item ${item.danger ? 'is-danger' : ''}`}
                  onClick={() => {
                    setOpen(false)
                    trigger.current.focus()
                    item.onClick()
                  }}
                >
                  {item.icon && (
                    <span className="ui-menu-icon">
                      <item.icon size={17} />
                    </span>
                  )}
                  <span>
                    <span>{item.label}</span>
                    {item.description && <small>{item.description}</small>}
                  </span>
                </button>
              ))}
          </div>,
          document.body
        )}
    </>
  )
}
export function SortLabel({ label, direction }) {
  return (
    <>
      {label}
      {direction === 'asc' ? (
        <ArrowUp size={13} />
      ) : direction === 'desc' ? (
        <ArrowDown size={13} />
      ) : null}
    </>
  )
}
