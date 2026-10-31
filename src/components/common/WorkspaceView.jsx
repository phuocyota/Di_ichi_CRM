import { categoryColor, chartPalette, chartStyle, statusInfo } from './presentation.js'
import React, { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { ArrowDown, ArrowUp, ChevronsUpDown, RefreshCcw } from 'lucide-react'
import { number } from '../../services/workspaceApi.js'
import PageHeader from './PageHeader.jsx'
import StatCard from './StatCard.jsx'
import {
  ChartCard,
  EmptyState,
  LoadingSkeleton,
  Pagination,
  StatusBadge
} from './ui.jsx'

export const button = 'ui-button'
export const input = 'ui-input mt-2'
export function WorkspaceState({ loading, error, reload, data }) {
  return (
    <>
      {loading && <LoadingSkeleton label="Đang tải dữ liệu từ máy chủ…" />}
      {error && (
        <div role="alert" className="ui-error">
          {error}
          {data && ' Dữ liệu hiển thị là lần tải thành công gần nhất.'}
          <button
            type="button"
            className="ml-3 font-semibold underline"
            onClick={() => reload().catch(() => {})}
          >
            Thử lại
          </button>
        </div>
      )}
    </>
  )
}
const descriptions = {
  'Quản lý phụ huynh':
    'Liên hệ gia đình, thông tin học viên và lịch sử chăm sóc phụ huynh.',
  'Quản lý tài chính':
    'Theo dõi học phí, thanh toán và công nợ từ dữ liệu thực tế.',
  'Marketing & Sale':
    'Quản lý nguồn tuyển sinh, chiến dịch và hồ sơ được phân công.',
  'Báo cáo': 'Tổng hợp dữ liệu đào tạo và vận hành của trung tâm.'
}
export function WorkspaceHeader({
  title,
  tabs,
  activeTab,
  onTabChange,
  reload,
  children
}) {
  return (
    <PageHeader
      title={title}
      description={descriptions[title]}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      actions={
        <>
          {children}
          <button
            type="button"
            className="ui-button"
            onClick={() => reload().catch(() => {})}
          >
            <RefreshCcw size={16} />
            Làm mới
          </button>
        </>
      }
    />
  )
}
export function WorkspaceStats({ items }) {
  return (
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Thống kê tổng quan"
    >
      {items.map(([label, value, color], index) => (
        <StatCard key={label} label={label} value={value} color={color || ['info', 'success', 'warning', 'purple'][index % 4]} />
      ))}
    </section>
  )
}
export function WorkspaceChart({
  title,
  rows,
  currency = false,
  statusContext = 'general'
}) {
  const values = rows.map((row, index) => ({
    fill: categoryColor(row.name, index, statusContext),
    ...row,
    name: statusInfo(row.name, statusContext)[0]
  }))
  return (
    <ChartCard title={title}>
      {values.length ? (
        <div
          className={`ui-chart-area ${values.length <= 3 ? 'is-small' : ''}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={values} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid
                stroke={chartStyle.grid}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={chartStyle.axis}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={chartStyle.axis}
                width={72}
                tickFormatter={(v) =>
                  currency ? `${number(v / 1000000)}tr` : number(v)
                }
                allowDecimals={currency}
              />
              <Tooltip
                contentStyle={chartStyle.tooltip}
                formatter={(v) => (currency ? `${number(v)} đ` : number(v))}
              />
              <Bar
                dataKey="value"
                name={currency ? 'Số tiền' : 'Số lượng'}
                fill={chartPalette[0]}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              >
                {values.map((item, index) => <Cell key={index} fill={item.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          compact
          title="Chưa có dữ liệu thống kê"
          description="Biểu đồ sẽ cập nhật khi có dữ liệu được ghi nhận."
        />
      )}
    </ChartCard>
  )
}
export function WorkspaceTable({
  columns,
  rows,
  onSelect = null,
  statusContext = 'general'
}) {
  const [page, setPage] = useState(1),
    [size, setSize] = useState(10),
    [sort, setSort] = useState({ key: '', direction: 'asc' })
  const sorted = useMemo(
    () =>
      sort.key
        ? [...rows].sort((a, b) => {
            const left = a[sort.key],
              right = b[sort.key]
            return (
              (typeof left === 'number' && typeof right === 'number'
                ? left - right
                : String(left ?? '').localeCompare(String(right ?? ''), 'vi', {
                    numeric: true
                  })) * (sort.direction === 'asc' ? 1 : -1)
            )
          })
        : rows,
    [rows, sort]
  )
  const pages = Math.max(1, Math.ceil(rows.length / size)),
    current = Math.min(page, pages)
  return (
    <section className="ui-card !p-4">
      <div className="ui-table-wrap">
        <table className="w-full whitespace-nowrap text-left">
          <thead>
            <tr>
              {columns.map(([key, label]) => {
                const sortable = !['action', 'actions'].includes(key)
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={
                      sort.key === key
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => {
                          setSort({
                            key,
                            direction:
                              sort.key === key && sort.direction === 'asc'
                                ? 'desc'
                                : 'asc'
                          })
                          setPage(1)
                        }}
                      >
                        {label}
                        {sort.key === key ? (
                          sort.direction === 'asc' ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )
                        ) : (
                          <ChevronsUpDown
                            size={12}
                            className="text-slate-300"
                          />
                        )}
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted
              .slice((current - 1) * size, current * size)
              .map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map(([key, , render]) => (
                    <td key={key}>
                      {key === columns[0][0] && onSelect ? (
                        <button
                          type="button"
                          className="font-semibold text-blue-700 hover:underline"
                          onClick={() => onSelect(row)}
                        >
                          {render ? render(row) : (row[key] ?? '—')}
                        </button>
                      ) : render ? (
                        render(row)
                      ) : key === 'status' ? (
                        <StatusBadge value={row[key]} context={statusContext} />
                      ) : (
                        (row[key] ?? '—')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    compact
                    title="Không có bản ghi phù hợp"
                    description="Thử thay đổi từ khóa hoặc bộ lọc để xem thêm dữ liệu."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={current}
        pages={pages}
        total={rows.length}
        size={size}
        onPageChange={setPage}
        onSizeChange={(n) => {
          setSize(n)
          setPage(1)
        }}
      />
    </section>
  )
}
