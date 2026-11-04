import { cloneElement, useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export default function WorkScheduleDialog({ title, onClose, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const dialog = ref.current
    dialog.showModal()
    return () => { dialog.close(); previous?.focus() }
  }, [])
  return <dialog ref={ref} className="work-dialog" onCancel={onClose} aria-label={title}>
    <header><h2>{title}</h2><button type="button" className="ui-button ui-icon-button" aria-label="Đóng" onClick={onClose}><X size={18} /></button></header>
    {children}
  </dialog>
}

export function Field({ label, children }) {
  const id = useId()
  return <label className="work-field" htmlFor={id}><span id={`${id}-label`}>{label}</span>{cloneElement(children, { id, 'aria-labelledby': `${id}-label` })}</label>
}
