import { useMemo, useState } from 'react'
import { Download, RefreshCcw } from 'lucide-react'
import * as XLSX from 'xlsx'

const pageSizeOptions = [10, 20, 50, 100]

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN')
}

function formatValue(value, type) {
  if (type === 'currency') return formatCurrency(value)
  if (type === 'percent') return `${value || 0}%`
  return value || value === 0 ? value : '-'
}

function uniqueOptions(rows, key, labelKey = key) {
  const map = new Map()
  rows.forEach((row) => {
    if (row[key]) map.set(row[key], row[labelKey] || row[key])
  })
  return [...map.entries()].map(([value, label]) => ({ value, label }))
}

function MarketingReportTable({ title, subtitle, rows, columns, filters, keyword, searchKeys, exportFileName, onRefresh }) {
  const [filterValues, setFilterValues] = useState({})
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const filterOptions = useMemo(() => filters.map((filter) => ({
    ...filter,
    options: filter.options || uniqueOptions(rows, filter.key, filter.labelKey),
  })), [filters, rows])

  const filteredRows = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesFilters = filterOptions.every((filter) => !filterValues[filter.key] || row[filter.key] === filterValues[filter.key])
      const matchesSearch = !search || searchKeys.some((key) => String(row[key] || '').toLowerCase().includes(search))
      return matchesFilters && matchesSearch
    })
  }, [filterOptions, filterValues, keyword, rows, searchKeys])

  const totals = useMemo(() => {
    return columns.reduce((sum, column) => {
      if (column.total === 'sum') {
        sum[column.key] = filteredRows.reduce((value, row) => value + Number(row[column.key] || 0), 0)
      }
      if (column.total === 'avg') {
        const count = filteredRows.length || 1
        sum[column.key] = filteredRows.reduce((value, row) => value + Number(row[column.key] || 0), 0) / count
      }
      return sum
    }, {})
  }, [columns, filteredRows])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  const updateFilter = (key, value) => {
    setFilterValues((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const refresh = () => {
    setFilterValues({})
    setPage(1)
    onRefresh()
  }

  const exportExcel = () => {
    const exportRows = filteredRows.map((row, index) => {
      const item = { STT: index + 1 }
      columns.forEach((column) => {
        item[column.label] = row[column.key]
      })
      return item
    })

    const totalRow = { STT: '', [columns[0].label]: 'Tổng kết' }
    columns.forEach((column) => {
      if (column.total) totalRow[column.label] = column.total === 'avg' ? Number((totals[column.key] || 0).toFixed(1)) : totals[column.key]
    })
    exportRows.push(totalRow)

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 28))
    XLSX.writeFile(workbook, exportFileName)
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Marketing & Sale</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={refresh}>
            <RefreshCcw size={16} aria-hidden="true" /> Làm mới
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700" onClick={exportExcel}>
            <Download size={16} aria-hidden="true" /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-200/70 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm shadow-blue-100/60">
        <p className="text-sm font-black text-slate-950">Bộ lọc</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filterOptions.map((filter) => (
            <label key={filter.key} className="block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">{filter.label}</span>
              <select className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={filterValues[filter.key] || ''} onChange={(event) => updateFilter(filter.key, event.target.value)}>
                <option value="">Tất cả</option>
                {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full min-w-[1500px] text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-4 py-4">STT</th>
              {columns.map((column) => <th key={column.key} className="px-4 py-4">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pagedRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50/50">
                <td className="px-4 py-4 font-bold text-slate-700">{(safePage - 1) * pageSize + index + 1}</td>
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-4 ${column.strong ? 'font-black text-slate-950' : 'font-semibold text-slate-700'}`}>
                    {column.badge ? (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{formatValue(row[column.key], column.type)}</span>
                    ) : formatValue(row[column.key], column.type)}
                  </td>
                ))}
              </tr>
            ))}
            {!pagedRows.length ? (
              <tr>
                <td className="px-6 py-8 text-center text-sm font-bold text-slate-500" colSpan={columns.length + 1}>Không tìm thấy dữ liệu phù hợp.</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot className="bg-slate-50 text-sm font-black text-slate-900">
            <tr>
              <td className="px-4 py-4" colSpan={2}>Tổng kết</td>
              {columns.slice(1).map((column) => (
                <td key={column.key} className="px-4 py-4">
                  {column.total ? formatValue(column.total === 'avg' ? Number((totals[column.key] || 0).toFixed(1)) : totals[column.key], column.type) : ''}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Hiển thị {pagedRows.length ? (safePage - 1) * pageSize + 1 : 0}-{Math.min(safePage * pageSize, filteredRows.length)} / {filteredRows.length} bản ghi
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm font-bold text-slate-700" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>
            {pageSizeOptions.map((value) => <option key={value} value={value}>{value}/trang</option>)}
          </select>
          <button type="button" className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-700 disabled:opacity-50" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Trước</button>
          <span className="text-sm font-black text-slate-700">Trang {safePage}/{pageCount}</span>
          <button type="button" className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-slate-700 disabled:opacity-50" disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Sau</button>
        </div>
      </div>
    </section>
  )
}

export default MarketingReportTable
