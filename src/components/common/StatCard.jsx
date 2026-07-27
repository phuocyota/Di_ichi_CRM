function StatCard({ label, value, trend, icon: Icon, color = 'blue' }) {
  const palettes = {
    blue: {
      card: 'border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_100%)]',
      icon: 'bg-blue-600 text-white shadow-blue-100',
      trend: 'text-blue-700 bg-blue-50',
    },
    emerald: {
      card: 'border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#ecfdf5_100%)]',
      icon: 'bg-emerald-600 text-white shadow-emerald-100',
      trend: 'text-emerald-700 bg-emerald-50',
    },
    amber: {
      card: 'border-amber-100 bg-[linear-gradient(135deg,#ffffff_0%,#fffbeb_100%)]',
      icon: 'bg-amber-500 text-white shadow-amber-100',
      trend: 'text-amber-700 bg-amber-50',
    },
    rose: {
      card: 'border-rose-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff1f2_100%)]',
      icon: 'bg-rose-600 text-white shadow-rose-100',
      trend: 'text-rose-700 bg-rose-50',
    },
    violet: {
      card: 'border-violet-100 bg-[linear-gradient(135deg,#ffffff_0%,#f5f3ff_100%)]',
      icon: 'bg-violet-600 text-white shadow-violet-100',
      trend: 'text-violet-700 bg-violet-50',
    },
    orange: {
      card: 'border-orange-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff7ed_100%)]',
      icon: 'bg-orange-500 text-white shadow-orange-100',
      trend: 'text-orange-700 bg-orange-50',
    },
    cyan: {
      card: 'border-cyan-100 bg-[linear-gradient(135deg,#ffffff_0%,#ecfeff_100%)]',
      icon: 'bg-cyan-600 text-white shadow-cyan-100',
      trend: 'text-cyan-700 bg-cyan-50',
    },
    slate: {
      card: 'border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)]',
      icon: 'bg-slate-700 text-white shadow-slate-100',
      trend: 'text-slate-700 bg-slate-100',
    },
  }
  const palette = palettes[color] || palettes.blue

  return (
    <article className={`rounded-md border p-5 shadow-enterprise ${palette.card}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{value}</p>
        </div>
        {Icon ? (
          <div className={`flex h-12 w-12 items-center justify-center rounded-md shadow-md ${palette.icon}`}>
            <Icon size={22} aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {trend ? (
        <p className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${palette.trend}`}>
          {trend}
        </p>
      ) : null}
    </article>
  )
}

export default StatCard
