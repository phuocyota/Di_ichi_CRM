import { Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from 'recharts'

function AdmissionFunnelChart({ data }) {
  return (
    <section className="rounded-md border border-orange-100 bg-white p-5 shadow-enterprise">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Tuyển sinh</p>
        <h2 className="mt-1 text-lg font-bold text-ink-900">Lead đến học viên</h2>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={data} isAnimationActive>
              <LabelList position="right" fill="#172033" dataKey="name" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {data.map((item) => (
          <div key={item.name} className="rounded-md bg-slate-50 p-3">
            <div className="mb-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
            <p className="text-sm font-bold text-ink-900">{item.value}</p>
            <p className="text-xs font-medium text-ink-500">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AdmissionFunnelChart
