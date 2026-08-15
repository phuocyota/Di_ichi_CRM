import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Pencil, Search, Trash2, X } from 'lucide-react'
import PanelHeader from './PanelHeader.jsx'

const pageSize = 5

const statusStyles = {
  'Mới': 'bg-blue-50 text-blue-700',
  'Đang liên hệ': 'bg-amber-50 text-amber-700',
  'Đã tư vấn': 'bg-violet-50 text-violet-700',
  'Đã hẹn kiểm tra': 'bg-cyan-50 text-cyan-700',
  'Đã học thử': 'bg-orange-50 text-orange-700',
  'Đã chuyển thành khách hàng': 'bg-emerald-50 text-emerald-700',
  'Không có nhu cầu': 'bg-red-50 text-red-700',
}

const leadStatuses = [
  'Mới',
  'Đang liên hệ',
  'Đã tư vấn',
  'Đã hẹn kiểm tra',
  'Đã học thử',
  'Đã chuyển thành khách hàng',
  'Không có nhu cầu',
]

const leadFieldGroups = [
  {
    title: 'Thông tin học viên',
    fields: [
      ['name', 'Họ tên'],
      ['birthDate', 'Ngày sinh'],
      ['school', 'Trường'],
      ['className', 'Lớp'],
    ],
  },
  {
    title: 'Thông tin phụ huynh',
    fields: [
      ['parent', 'Họ tên'],
      ['phone', 'SĐT'],
      ['parentEmail', 'Email'],
      ['address', 'Địa chỉ'],
    ],
  },
  {
    title: 'Nhu cầu',
    fields: [
      ['interestedCourse', 'Khóa học quan tâm'],
      ['availableSchedule', 'Lịch rảnh'],
      ['note', 'Ghi chú'],
    ],
  },
  {
    title: 'Trạng thái',
    fields: [
      ['status', 'Trạng thái'],
      ['source', 'Nguồn'],
      ['sale', 'Sale phụ trách'],
      ['createdAt', 'Ngày tạo'],
    ],
  },
]

const leadKey = (lead) => `${lead.phone}-${lead.name}`

function LeadModal({ modal, lead, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(lead || {})

  useEffect(() => {
    setDraft(lead || {})
  }, [lead])

  if (!modal || !lead) return null

  const isView = modal === 'view'
  const isEdit = modal === 'edit'
  const isDelete = modal === 'delete'
  const title = isView ? 'Chi tiết Lead' : isEdit ? 'Sửa Lead' : 'Xóa Lead'

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isEdit) onSave(draft)
    if (isDelete) onDelete(lead)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <section className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{lead.name}</p>
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

        <form className="space-y-5 p-5" onSubmit={handleSubmit}>
          {isDelete ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800">
                Bạn có chắc muốn xóa Lead {lead.name} khỏi danh sách?
              </p>
              <p className="mt-1 text-sm font-medium text-red-700">
                Thao tác này sẽ cập nhật ngay trên bảng hiện tại.
              </p>
            </div>
          ) : (
            <div className="max-h-[68vh] space-y-5 overflow-y-auto pr-1">
              {leadFieldGroups.map((group) => (
                <section key={group.title} className="rounded-xl border border-blue-100 bg-slate-50 p-4">
                  <h3 className="text-sm font-black text-blue-700">{group.title}</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {group.fields.map(([field, label]) => (
                      <label key={field} className={field === 'note' || field === 'address' ? 'block md:col-span-2' : 'block'}>
                        <span className="text-xs font-bold uppercase text-slate-500">{label}</span>
                        {isView ? (
                          <p className="mt-1 min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900">
                            {draft[field] || '—'}
                          </p>
                        ) : field === 'status' ? (
                          <select
                            className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                            value={draft[field] || ''}
                            onChange={(event) => updateDraft(field, event.target.value)}
                          >
                            {leadStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : field === 'note' || field === 'address' ? (
                          <textarea
                            className="mt-1 min-h-24 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                            value={draft[field] || ''}
                            onChange={(event) => updateDraft(field, event.target.value)}
                          />
                        ) : (
                          <input
                            className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                            value={draft[field] || ''}
                            onChange={(event) => updateDraft(field, event.target.value)}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              onClick={onClose}
            >
              Đóng
            </button>
            {isEdit ? (
              <button
                type="submit"
                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Lưu thay đổi
              </button>
            ) : null}
            {isDelete ? (
              <button
                type="submit"
                className="h-10 rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-red-700"
              >
                Xóa Lead
              </button>
            ) : null}
          </footer>
        </form>
      </section>
    </div>
  )
}

function LatestLeadTable({ rows, showAll = false, onTabChange }) {
  const [leadItems, setLeadItems] = useState(rows)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [modal, setModal] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)

  useEffect(() => {
    setLeadItems(rows)
    setPageIndex(0)
  }, [rows])

  const visibleRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return leadItems.filter((lead) => {
      const matchesKeyword = !normalizedKeyword || lead.name.toLowerCase().includes(normalizedKeyword)
      const matchesStatus = !statusFilter || lead.status === statusFilter
      return matchesKeyword && matchesStatus
    })
  }, [keyword, leadItems, statusFilter])
  const pageCount = Math.max(Math.ceil(visibleRows.length / pageSize), 1)
  const paginatedRows = visibleRows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)

  useEffect(() => {
    setPageIndex(0)
  }, [keyword, statusFilter])

  useEffect(() => {
    if (pageIndex > pageCount - 1) setPageIndex(pageCount - 1)
  }, [pageCount, pageIndex])

  const openModal = (type, lead) => {
    setSelectedLead(lead)
    setModal(type)
  }

  const closeModal = () => {
    setModal(null)
    setSelectedLead(null)
  }

  const saveLead = (updatedLead) => {
    setLeadItems((current) => current.map((lead) => (
      leadKey(lead) === leadKey(selectedLead) ? updatedLead : lead
    )))
    closeModal()
  }

  const deleteLead = (leadToDelete) => {
    setLeadItems((current) => current.filter((lead) => leadKey(lead) !== leadKey(leadToDelete)))
    closeModal()
  }

  return (
    <section className="rounded-md border border-blue-100 bg-white p-5 shadow-enterprise">
      <PanelHeader
        eyebrow={showAll ? 'Danh sách Lead' : 'Lead mới nhất'}
        title={showAll ? 'Quản lý Lead CRM' : 'Lead vừa được tạo'}
        actionTab={showAll ? null : 'leads'}
        actionLabel="Xem tất cả"
        onTabChange={onTabChange}
      />

      {showAll ? (
        <div className="mb-5 rounded-xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_62%,#ecfdf5_100%)] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <label className="block min-w-0 flex-1">
              <span className="text-xs font-bold uppercase text-slate-500">Tìm kiếm</span>
              <div className="mt-1 flex h-11 min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 shadow-sm">
                <Search size={18} className="shrink-0 text-blue-600" aria-hidden="true" />
                <input
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Tìm theo họ tên Lead"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </div>
            </label>
            <label className="block lg:w-72">
              <span className="text-xs font-bold uppercase text-slate-500">Trạng thái</span>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-blue-500"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      <div className="max-w-full overflow-hidden rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
        <div className="max-w-full overflow-x-auto pb-2">
          <table className="w-full min-w-[1480px] overflow-hidden rounded-lg border-collapse text-left text-sm">
            <thead className="bg-blue-600 text-white">
              <tr className="text-xs uppercase">
                <th className="py-4 pl-12 pr-6 font-black">Họ tên</th>
                <th className="px-6 py-4 font-black">SĐT</th>
                <th className="px-6 py-4 font-black">Phụ huynh</th>
                <th className="px-6 py-4 font-black">Khóa học quan tâm</th>
                <th className="px-6 py-4 font-black">Nguồn</th>
                <th className="px-6 py-4 font-black">Sale phụ trách</th>
                <th className="px-6 py-4 font-black">Trạng thái</th>
                <th className="px-6 py-4 font-black">Ngày tạo</th>
                <th className="py-4 pl-6 pr-12 text-right font-black">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 bg-white">
              {paginatedRows.map((lead) => (
                <tr key={leadKey(lead)} className="transition hover:bg-blue-50/60">
                  <td className="py-4 pl-12 pr-6 font-bold text-ink-900">{lead.name}</td>
                  <td className="px-6 py-4 font-medium text-ink-600">{lead.phone}</td>
                  <td className="px-6 py-4 font-medium text-ink-600">{lead.parent}</td>
                  <td className="px-6 py-4 font-medium text-ink-600">{lead.interestedCourse}</td>
                  <td className="px-6 py-4 font-medium text-ink-600">{lead.source}</td>
                  <td className="px-6 py-4 font-semibold text-ink-700">{lead.sale}</td>
                  <td className="py-4 pl-6 pr-12">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[lead.status] || 'bg-slate-100 text-slate-700'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-ink-600">{lead.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-blue-700"
                        aria-label={`Xem ${lead.name}`}
                        onClick={() => openModal('view', lead)}
                      >
                        <Eye size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100"
                        aria-label={`Sửa ${lead.name}`}
                        onClick={() => openModal('edit', lead)}
                      >
                        <Pencil size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                        aria-label={`Xóa ${lead.name}`}
                        onClick={() => openModal('delete', lead)}
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!paginatedRows.length ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-sm font-bold text-slate-500">
                    Không có Lead phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-500">
          Hiển thị {visibleRows.length ? pageIndex * pageSize + 1 : 0}-{Math.min((pageIndex + 1) * pageSize, visibleRows.length)} / {visibleRows.length} Lead
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Trước
          </button>
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            {pageIndex + 1} / {pageCount}
          </span>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-600 disabled:opacity-50"
            disabled={pageIndex >= pageCount - 1}
            onClick={() => setPageIndex((current) => Math.min(current + 1, pageCount - 1))}
          >
            Sau
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <LeadModal
        modal={modal}
        lead={selectedLead}
        onClose={closeModal}
        onSave={saveLead}
        onDelete={deleteLead}
      />
    </section>
  )
}

export default LatestLeadTable
