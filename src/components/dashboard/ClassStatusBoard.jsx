function ClassStatusBoard({ items }) {
  return (
    <section className="rounded-md border border-emerald-100 bg-white p-5 shadow-enterprise">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Lớp học</p>
        <h2 className="mt-1 text-lg font-bold text-ink-900">Hiển thị trạng thái lớp</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <article key={item.label} className={`rounded-md border p-4 ${item.color}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold">{item.value}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white/70">
                  <Icon size={22} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-xs font-medium opacity-80">{item.description}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ClassStatusBoard
