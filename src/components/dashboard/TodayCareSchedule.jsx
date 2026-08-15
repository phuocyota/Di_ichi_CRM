import { useMemo, useState } from 'react'
import { CalendarClock, Search } from 'lucide-react'
import PanelHeader from './PanelHeader.jsx'

function TodayCareSchedule({ rows, showAll = false }) {
  const [keyword, setKeyword] = useState('')

  const visibleRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) return rows
    return rows.filter((item) => item.customer.toLowerCase().includes(normalizedKeyword))
  }, [keyword, rows])

  return (
    <section className="rounded-md border border-blue-100 bg-white p-5 shadow-enterprise">
      <PanelHeader
        eyebrow="Lịch chăm sóc hôm nay"
        title={showAll ? 'Toàn bộ công việc cần thực hiện' : 'Công việc cần thực hiện'}
      />

      {showAll ? (
        <div className="mb-5 rounded-xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_62%,#fff7ed_100%)] p-4">
          <label className="block min-w-0">
            <span className="text-xs font-bold uppercase text-slate-500">Tìm kiếm</span>
            <div className="mt-1 flex h-11 min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 shadow-sm lg:max-w-2xl">
              <Search size={18} className="shrink-0 text-blue-600" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Tìm theo tên khách hàng"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
          </label>
        </div>
      ) : null}

      <div className="max-w-full overflow-hidden rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
        <div className="max-w-full overflow-x-auto pb-2">
          <table className="w-full min-w-[720px] overflow-hidden rounded-lg border-collapse text-left text-sm">
            <thead className="bg-blue-600 text-white">
              <tr className="text-xs uppercase">
                <th className="py-4 pl-12 pr-6 font-black">Thời gian</th>
                <th className="px-6 py-4 font-black">Khách hàng</th>
                <th className="py-4 pl-6 pr-12 font-black">Nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 bg-white">
              {visibleRows.map((item) => (
                <tr key={`${item.time}-${item.customer}`} className="transition hover:bg-blue-50/60">
                  <td className="py-4 pl-12 pr-6">
                    <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-2.5 py-1 font-bold text-amber-700">
                      <CalendarClock size={15} aria-hidden="true" />
                      {item.time}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-ink-900">{item.customer}</td>
                  <td className="py-4 pl-6 pr-12 font-medium text-ink-600">{item.content}</td>
                </tr>
              ))}
              {!visibleRows.length ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm font-bold text-slate-500">
                    Không có lịch chăm sóc phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default TodayCareSchedule
