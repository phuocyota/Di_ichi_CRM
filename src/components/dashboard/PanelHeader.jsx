import { ArrowRight } from 'lucide-react'

function PanelHeader({ eyebrow, title, actionTab, actionLabel, onTabChange }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-bold text-ink-900">{title}</h2>
      </div>
      {actionTab ? (
        <button
          type="button"
          onClick={() => onTabChange(actionTab)}
          className="inline-flex items-center gap-2 self-start rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-600 hover:text-white"
        >
          {actionLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export default PanelHeader
