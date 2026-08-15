import { useMemo, useState } from 'react'
import { Eye, Search, X } from 'lucide-react'
import PanelHeader from './PanelHeader.jsx'

const detailSections = [
  {
    title: 'Thông tin phụ huynh',
    rows: [
      ['parent.name', 'Họ tên'],
      ['parent.phone', 'SĐT'],
      ['parent.email', 'Email'],
      ['parent.address', 'Địa chỉ'],
    ],
  },
  {
    title: 'Học phí',
    rows: [
      ['tuition.package', 'Gói học'],
      ['tuition.total', 'Tổng học phí'],
      ['tuition.paid', 'Đã thanh toán'],
      ['tuition.debt', 'Còn nợ'],
      ['tuition.nextDue', 'Hạn thanh toán tiếp theo'],
    ],
  },
  {
    title: 'Hợp đồng',
    rows: [
      ['contract.code', 'Mã hợp đồng'],
      ['contract.status', 'Trạng thái'],
      ['contract.signedAt', 'Ngày ký'],
      ['contract.expireAt', 'Ngày hết hạn'],
    ],
  },
  {
    title: 'Tiến độ học',
    rows: [
      ['progress.className', 'Lớp học'],
      ['progress.completed', 'Tiến độ'],
      ['progress.attendance', 'Chuyên cần'],
      ['progress.teacherNote', 'Nhận xét giáo viên'],
    ],
  },
]

const getValue = (item, path) => path.split('.').reduce((value, key) => value?.[key], item) || '—'

function CustomerDetailModal({ customer, onClose }) {
  const [activeSection, setActiveSection] = useState(detailSections[0].title)

  if (!customer) return null

  const currentSection = detailSections.find((section) => section.title === activeSection) || detailSections[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <section className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">Chi tiết khách hàng</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {customer.name} · {customer.course}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-100"
            aria-label="Đóng popup"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="grid max-h-[76vh] overflow-hidden md:grid-cols-[230px_1fr]">
          <aside className="space-y-2 border-b border-slate-200 bg-slate-50 p-4 md:border-b-0 md:border-r">
            {detailSections.map((section) => (
              <button
                key={section.title}
                type="button"
                className={[
                  'w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition',
                  activeSection === section.title ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100',
                ].join(' ')}
                onClick={() => setActiveSection(section.title)}
              >
                {section.title}
              </button>
            ))}
            <button
              type="button"
              className={[
                'w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition',
                activeSection === 'Lịch sử chăm sóc' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100',
              ].join(' ')}
              onClick={() => setActiveSection('Lịch sử chăm sóc')}
            >
              Lịch sử chăm sóc
            </button>
          </aside>

          <div className="overflow-y-auto p-5">
            {activeSection === 'Lịch sử chăm sóc' ? (
              <section className="rounded-xl border border-blue-100 bg-white">
                <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
                  <h3 className="text-sm font-black text-blue-700">Lịch sử chăm sóc</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {(customer.careHistory || []).map((item) => (
                    <article key={`${item.date}-${item.content}`} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[120px_1fr_120px]">
                      <p className="font-bold text-slate-900">{item.date}</p>
                      <p className="font-medium text-slate-600">{item.content}</p>
                      <p className="font-semibold text-blue-700">{item.staff}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-blue-100 bg-white">
                <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
                  <h3 className="text-sm font-black text-blue-700">{currentSection.title}</h3>
                </div>
                <div className="grid gap-4 p-4 md:grid-cols-2">
                  {currentSection.rows.map(([path, label]) => (
                    <div key={path} className={path.includes('Note') || path.includes('address') ? 'md:col-span-2' : ''}>
                      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                      <p className="mt-1 min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900">
                        {getValue(customer, path)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function NewestCustomerTable({ rows, showAll = false, onTabChange }) {
  const [keyword, setKeyword] = useState('')
  const [saleFilter, setSaleFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const saleOptions = useMemo(
    () => Array.from(new Set(rows.map((customer) => customer.sale))),
    [rows],
  )
  const courseOptions = useMemo(
    () => Array.from(new Set(rows.map((customer) => customer.course))),
    [rows],
  )
  const visibleRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return rows.filter((customer) => {
      const matchesKeyword = !normalizedKeyword || customer.name.toLowerCase().includes(normalizedKeyword)
      const matchesSale = !saleFilter || customer.sale === saleFilter
      const matchesCourse = !courseFilter || customer.course === courseFilter
      return matchesKeyword && matchesSale && matchesCourse
    })
  }, [courseFilter, keyword, rows, saleFilter])

  return (
    <section className="rounded-md border border-blue-100 bg-white p-5 shadow-enterprise">
      <PanelHeader
        eyebrow={showAll ? 'Danh sách khách hàng' : 'Khách hàng mới'}
        title={showAll ? 'Khách hàng đã chuyển đổi' : 'Chuyển đổi thành công'}
        actionTab={showAll ? null : 'customers'}
        actionLabel="Xem tất cả"
        onTabChange={onTabChange}
      />

      {showAll ? (
        <div className="mb-5 rounded-xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_62%,#fff1f2_100%)] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="block min-w-0 flex-1">
              <span className="text-xs font-bold uppercase text-slate-500">Tìm kiếm</span>
              <div className="mt-1 flex h-11 min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 shadow-sm">
                <Search size={18} className="shrink-0 text-blue-600" aria-hidden="true" />
                <input
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Tìm theo họ tên khách hàng"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </div>
            </label>
            <label className="block lg:w-52">
              <span className="text-xs font-bold uppercase text-slate-500">Sale</span>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-blue-500"
                value={saleFilter}
                onChange={(event) => setSaleFilter(event.target.value)}
              >
                <option value="">Tất cả Sale</option>
                {saleOptions.map((sale) => (
                  <option key={sale} value={sale}>
                    {sale}
                  </option>
                ))}
              </select>
            </label>
            <label className="block lg:w-60">
              <span className="text-xs font-bold uppercase text-slate-500">Khóa học</span>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-blue-500"
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
              >
                <option value="">Tất cả khóa học</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      <div className="max-w-full overflow-hidden rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
        <div className="max-w-full overflow-x-auto pb-2">
          <table className="w-full min-w-[980px] overflow-hidden rounded-lg border-collapse text-left text-sm">
            <thead className="bg-blue-600 text-white">
              <tr className="text-xs uppercase">
                <th className="py-4 pl-12 pr-6 font-black">Họ tên</th>
                <th className="px-6 py-4 font-black">Khóa học</th>
                <th className="px-6 py-4 font-black">Ngày đăng ký</th>
                <th className="px-6 py-4 font-black">Sale</th>
                <th className="py-4 pl-6 pr-12 text-right font-black">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 bg-white">
              {visibleRows.map((customer) => (
                <tr key={`${customer.name}-${customer.course}`} className="transition hover:bg-blue-50/60">
                  <td className="py-4 pl-12 pr-6 font-bold text-ink-900">{customer.name}</td>
                  <td className="px-6 py-4 font-medium text-ink-600">{customer.course}</td>
                  <td className="px-6 py-4 font-medium text-ink-600">{customer.registeredAt}</td>
                  <td className="px-6 py-4 font-semibold text-ink-700">{customer.sale}</td>
                  <td className="py-4 pl-6 pr-12">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-blue-700 transition hover:bg-blue-50"
                        aria-label={`Xem ${customer.name}`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleRows.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm font-bold text-slate-500">
                    Không có khách hàng phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </section>
  )
}

export default NewestCustomerTable
