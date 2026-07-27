function TodayWidgets({ widgets }) {
  return (
    <section className="rounded-md border border-violet-100 bg-white p-5 shadow-enterprise">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Công việc hôm nay</p>
        <h2 className="mt-1 text-lg font-bold text-ink-900">Widget cần theo dõi</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {widgets.map((item) => {
          const Icon = item.icon

          return (
            <article key={item.label} className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${item.color}`}>
                  <Icon size={21} aria-hidden="true" />
                </span>
                <p className="text-2xl font-bold text-ink-900">{item.value}</p>
              </div>
              <p className="mt-4 text-sm font-bold text-ink-900">{item.label}</p>
              <p className="mt-1 text-xs font-medium leading-5 text-ink-500">{item.note}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default TodayWidgets
