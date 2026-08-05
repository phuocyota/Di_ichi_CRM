import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Eye,
  FileDown,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Phone,
  Search,
  UserRoundPlus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { parentCareActivities, parentCharts, parentFilters, parentStatistics, parents } from '../../datas/parents.js'

const formatCurrency = (value) => value ? `${Math.round(value / 1000000)}M` : '0'

function ParentPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [keyword, setKeyword] = useState('')
  const [selectedParent, setSelectedParent] = useState(parents[0])
  const [modal, setModal] = useState(null)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [filterValues, setFilterValues] = useState({ branch: '', course: '', className: '', careLevel: '', statusValue: '' })

  const updateFilter = (id, value) => {
    setFilterValues((current) => ({ ...current, [id]: value }))
    setColumnFilters((current) => {
      const next = current.filter((item) => item.id !== id)
      return value ? [...next, { id, value }] : next
    })
  }

  const handleOpenDetail = (parent) => {
    setSelectedParent(parent)
    setModal('detail')
  }

  const notify = (message) => toast.success(message)

  const columns = useMemo(
    () => [
      { accessorKey: 'code', header: 'Mã PH' },
      {
        accessorKey: 'avatar',
        header: 'Avatar',
        cell: ({ row }) => <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">{row.original.avatar}</span>,
      },
      { accessorKey: 'name', header: 'Phụ huynh' },
      { accessorKey: 'phone', header: 'SĐT' },
      { accessorKey: 'student', header: 'Học viên' },
      { accessorKey: 'relation', header: 'Quan hệ' },
      { accessorKey: 'course', header: 'Khóa học' },
      { accessorKey: 'className', header: 'Lớp' },
      { accessorKey: 'branch', header: 'Cơ sở' },
      { accessorKey: 'careLevel', header: 'Mức chăm sóc' },
      {
        accessorKey: 'debt',
        header: 'Công nợ',
        cell: ({ getValue }) => <span className={Number(getValue()) > 0 ? 'font-black text-rose-700' : 'font-bold text-emerald-700'}>{Number(getValue()).toLocaleString('vi-VN')} đ</span>,
      },
      {
        accessorKey: 'statusValue',
        header: 'Trạng thái',
        filterFn: 'equalsString',
        cell: ({ row }) => {
          const status = parentFilters.statuses.find((item) => item.value === row.original.statusValue)
          return <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status?.badgeClass || ''}`}>{row.original.status}</span>
        },
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700" aria-label={`Xem ${row.original.name}`} onClick={() => handleOpenDetail(row.original)}>
              <Eye size={17} aria-hidden="true" />
            </button>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700" aria-label={`Gọi ${row.original.name}`} onClick={() => notify(`Đã tạo lịch gọi cho ${row.original.name}`)}>
              <Phone size={17} aria-hidden="true" />
            </button>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700" aria-label={`Nhắn ${row.original.name}`} onClick={() => notify(`Đã gửi tin nhắn chăm sóc đến ${row.original.name}`)}>
              <MessageSquare size={17} aria-hidden="true" />
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: parents,
    columns,
    state: { sorting, globalFilter: keyword, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setKeyword,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  const filteredRows = table.getFilteredRowModel().rows

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <nav className="text-sm font-semibold text-slate-500">Admin Portal / <span className="text-blue-700">Quản lý Phụ huynh</span></nav>
            <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý Phụ huynh</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">Theo dõi liên hệ, công nợ, phản hồi học tập và lịch chăm sóc phụ huynh theo từng học viên.</p>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-[560px]">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3">
                <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
                <input className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" placeholder="Tìm phụ huynh, học viên, SĐT" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
              </div>
              <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700" onClick={() => setModal('add')}>
                <UserRoundPlus size={18} aria-hidden="true" />
                Thêm phụ huynh
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-emerald-700" onClick={() => notify('Đã export Excel phụ huynh')}>
                <FileSpreadsheet size={17} aria-hidden="true" /> Excel
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-red-700" onClick={() => notify('Đã export PDF phụ huynh')}>
                <FileDown size={17} aria-hidden="true" /> PDF
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-blue-700" onClick={() => notify('Đã gửi email cho nhóm phụ huynh đã lọc')}>
                <Mail size={17} aria-hidden="true" /> Email
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:text-amber-700" onClick={() => notify('Đã gửi thông báo đến phụ huynh')}>
                <Bell size={17} aria-hidden="true" /> Thông báo
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ['dashboard', 'Dashboard phụ huynh'],
            ['list', 'Danh sách phụ huynh'],
          ].map(([key, label]) => (
            <button key={key} type="button" className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === key ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'dashboard' ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {parentStatistics.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.label} className={`rounded-xl border p-5 shadow-sm ${item.color}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold opacity-80">{item.label}</p>
                      <p className="mt-2 text-3xl font-black">{item.value}</p>
                    </div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/75 shadow-sm"><Icon size={23} aria-hidden="true" /></span>
                  </div>
                  <p className="mt-4 text-sm font-semibold opacity-75">{item.description}</p>
                </article>
              )
            })}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Tương tác phụ huynh theo tháng</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Cuộc gọi, tin nhắn và lịch hẹn chăm sóc.</p>
              <div className="mt-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={parentCharts.communication} margin={{ left: 0, right: 16, top: 8 }}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="calls" name="Cuộc gọi" stroke="#2563eb" strokeWidth={3} />
                    <Line type="monotone" dataKey="messages" name="Tin nhắn" stroke="#10b981" strokeWidth={3} />
                    <Line type="monotone" dataKey="meetings" name="Lịch hẹn" stroke="#f59e0b" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Trạng thái phụ huynh</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Nhóm chăm sóc hiện tại.</p>
              <div className="mt-5 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                    <Pie data={parentCharts.status} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                      {parentCharts.status.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Thanh toán theo cơ sở</h2>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={parentCharts.payment} margin={{ left: 0, right: 12, top: 8 }}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="branch" axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                    <Bar dataKey="paid" name="Đã thu" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="debt" name="Công nợ" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Hoạt động chăm sóc gần đây</h2>
              <div className="mt-4 space-y-3">
                {parentCareActivities.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.id} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={18} aria-hidden="true" /></span>
                        <div>
                          <p className="text-sm font-black text-slate-950">{item.title}</p>
                          <p className="mt-1 text-xs font-bold text-slate-500">{item.parent} · {item.time}</p>
                          <p className="mt-2 text-xs font-black text-blue-700">{item.status}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'list' ? (
        <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">Danh sách phụ huynh</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Đang hiển thị {filteredRows.length} hồ sơ theo bộ lọc hiện tại.</p>
              </div>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3 xl:w-96">
                <Search size={18} className="text-slate-500" aria-hidden="true" />
                <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder="Từ khóa, phụ huynh, học viên, SĐT" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {[
                ['branch', 'Cơ sở', parentFilters.branches],
                ['course', 'Khóa học', parentFilters.courses],
                ['className', 'Lớp học', parentFilters.classes],
                ['careLevel', 'Mức chăm sóc', parentFilters.careLevels],
              ].map(([id, label, options]) => (
                <label key={id} className="block">
                  <span className="text-xs font-bold text-slate-500">{label}</span>
                  <select className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none" value={filterValues[id]} onChange={(event) => updateFilter(id, event.target.value)}>
                    <option value="">Tất cả</option>
                    {options.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              ))}
              <label className="block">
                <span className="text-xs font-bold text-slate-500">Trạng thái</span>
                <select className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold outline-none" value={filterValues.statusValue} onChange={(event) => updateFilter('statusValue', event.target.value)}>
                  <option value="">Tất cả</option>
                  {parentFilters.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-300">
            <table className="min-w-[1360px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3">
                        {header.isPlaceholder ? null : (
                          <button type="button" className="inline-flex items-center gap-1" onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() ? (header.column.getIsSorted() ? <ChevronDown size={14} /> : <ChevronsUpDown size={14} />) : null}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 font-medium text-slate-700">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</p>
            <div className="flex items-center gap-2">
              <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft size={16} /> Trước</button>
              <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Sau <ChevronRight size={16} /></button>
            </div>
          </div>
        </section>
      ) : null}

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[1px]">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-gray-300 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-black text-slate-950">{modal === 'add' ? 'Thêm phụ huynh' : 'Chi tiết phụ huynh'}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{modal === 'add' ? 'Nhập thông tin liên hệ phụ huynh và liên kết học viên.' : selectedParent.name}</p>
              </div>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50" aria-label="Đóng modal" onClick={() => setModal(null)}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-[calc(92vh-88px)] overflow-y-auto bg-slate-50 p-5">
              {modal === 'add' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {['Họ tên phụ huynh', 'Số điện thoại', 'Email', 'Học viên liên kết', 'Quan hệ', 'Ghi chú chăm sóc'].map((label) => (
                    <label key={label} className="block">
                      <span className="text-sm font-black text-slate-700">{label}</span>
                      <input className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder={label} />
                    </label>
                  ))}
                  <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <button type="button" className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm" onClick={() => setModal(null)}>Hủy</button>
                    <button type="button" className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm" onClick={() => { setModal(null); notify('Đã lưu phụ huynh mới') }}>Lưu phụ huynh</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-bold text-blue-700">{selectedParent.code}</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">{selectedParent.name}</h3>
                    <p className="mt-2 text-sm font-semibold text-slate-600">{selectedParent.student} · {selectedParent.className} · {selectedParent.branch}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      ['Số điện thoại', selectedParent.phone],
                      ['Email', selectedParent.email],
                      ['Quan hệ', selectedParent.relation],
                      ['Khóa học', selectedParent.course],
                      ['Công nợ', `${selectedParent.debt.toLocaleString('vi-VN')} đ`],
                      ['Mức chăm sóc', selectedParent.careLevel],
                      ['Cảnh báo chuyên cần', selectedParent.attendanceAlert],
                      ['Liên hệ gần nhất', selectedParent.lastContact],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-gray-300 bg-white p-4">
                        <p className="text-xs font-black uppercase text-slate-500">{label}</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-gray-300 bg-white p-4">
                    <p className="text-xs font-black uppercase text-slate-500">Ghi chú học tập</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{selectedParent.learningNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ParentPage
