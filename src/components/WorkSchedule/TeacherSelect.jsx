import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

const searchText = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
const teacherLabel = person => person ? `${person.name}${person.phone ? ` - ${person.phone}` : ''}` : 'Chọn giáo viên'

export default function TeacherSelect({ people, value, onChange, id, placeholder = 'Chọn giáo viên', searchLabel = 'Tìm giáo viên', searchPlaceholder = 'Tìm giáo viên...', emptyMessage = 'Không tìm thấy giáo viên.', required = true, disabled = false, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy }) {
  const listId = useId()
  const trigger = useRef(null), search = useRef(null), options = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const selected = people.find(person => person.id === value)
  const filtered = people.filter(person => searchText(teacherLabel(person)).includes(searchText(query)))
  const choices = query ? filtered : [{ id: '', name: placeholder }, ...filtered]
  const close = () => { setOpen(false); setQuery('') }
  const show = () => {
    if (disabled) return
    setQuery('')
    setActive(Math.max(0, people.findIndex(person => person.id === value) + 1))
    setOpen(true)
  }
  const choose = person => { onChange(person.id); close(); trigger.current?.focus() }
  useEffect(() => { if (open) search.current?.focus() }, [open])
  useEffect(() => { if (open) options.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' }) }, [active, open])
  return <div className="work-teacher-select" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) close()
  }} onKeyDown={event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) show()
      else setActive(index => Math.max(0, Math.min(choices.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))))
    } else if (event.key === 'Enter' && open) {
      event.preventDefault(); if (choices[active]) choose(choices[active])
    } else if (event.key === 'Escape' && open) {
      event.preventDefault(); event.stopPropagation(); close(); trigger.current?.focus()
    }
  }}>
    <button ref={trigger} id={id} type="button" disabled={disabled} role="combobox" aria-label={ariaLabel} aria-labelledby={labelledBy} aria-expanded={open} aria-haspopup="listbox" aria-controls={listId} aria-required={required}
      className={`work-teacher-trigger ${open ? 'is-open' : ''} ${selected ? '' : 'is-placeholder'}`} onClick={() => open ? close() : show()}>
      <span>{selected ? teacherLabel(selected) : placeholder}</span><ChevronDown size={16} aria-hidden="true" />
    </button>
    {open && <div className="work-teacher-dropdown">
      <div className="work-teacher-search"><Search size={17} aria-hidden="true" />
        <input ref={search} type="search" aria-label={searchLabel} aria-controls={listId} aria-activedescendant={choices[active] ? `${listId}-${choices[active].id || 'empty'}` : undefined}
          autoComplete="off" placeholder={searchPlaceholder} value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} />
      </div>
      <ul ref={options} id={listId} role="listbox" aria-label={ariaLabel} aria-labelledby={labelledBy} className="work-teacher-options">
        {choices.map((person, index) => <li key={person.id} role="presentation"><button type="button" tabIndex={-1} id={`${listId}-${person.id || 'empty'}`} role="option" aria-selected={person.id === (value || '')} data-index={index}
          className={`${active === index ? 'is-highlighted' : ''} ${person.id === (value || '') ? 'is-selected' : ''}`}
          onMouseDown={event => event.preventDefault()} onMouseMove={() => setActive(index)} onClick={() => choose(person)}>
          <span>{teacherLabel(person)}</span>{person.id === (value || '') && <Check size={17} aria-hidden="true" />}
        </button></li>)}
        {!filtered.length && <li className="work-teacher-empty" role="presentation">{emptyMessage}</li>}
      </ul>
      <div className="work-teacher-count">{filtered.length} mục</div>
    </div>}
  </div>
}
