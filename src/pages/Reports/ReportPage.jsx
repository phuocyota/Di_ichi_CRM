import React, { useMemo, useState } from 'react'
import {
  useWorkspace,
  money,
  number,
  nameOf,
  date,
  exportRows
} from '../../services/workspaceApi.js'
import {
  WorkspaceChart,
  WorkspaceHeader,
  WorkspaceState,
  WorkspaceStats,
  WorkspaceTable,
  button,
  input
} from '../../components/common/WorkspaceView.jsx'

export default function ReportPage() {
  const workspace = useWorkspace('reports')
  const [tab, setTab] = useState('dashboard'),
    [keyword, setKeyword] = useState(''),
    [branch, setBranch] = useState('')
  const [from, setFrom] = useState(''),
    [to, setTo] = useState('')
  const data = workspace.data?.data
  const rows = useMemo(() => {
    if (!data) return []
    const lookup = (key, id) => nameOf(data[key], id)
    if (tab === 'finance')
      return data.financeTransaction.map((r) => ({
        ...r,
        name: lookup('student', r.studentId),
        branch: lookup('branch', r.branchId),
        className: lookup('class', r.classId),
        payable: money(r.payableAmount),
        paid: money(r.paidAmount),
        debt: money(r.debtAmount),
        date: r.dueDate
      }))
    if (tab === 'teachers')
      return data.staff
        .filter((s) => s.type.toLowerCase() === 'teacher')
        .map((s) => {
          const sessions = data.schedule.filter(
            (r) => r.teacherId === s.id && r.status !== 'cancelled'
          )
          return {
            ...s,
            branch: lookup('branch', s.branchId),
            classes: new Set(
              data.classStaff
                .filter((r) => r.staffId === s.id)
                .map((r) => r.classId)
            ).size,
            sessions: sessions.length,
            hours: number(
              sessions.reduce(
                (n, r) =>
                  n + (new Date(r.endAt) - new Date(r.startAt)) / 3600000,
                0
              )
            ),
            date: s.createdAt
          }
        })
    if (tab === 'classes')
      return data.class.map((c) => ({
        ...c,
        course: lookup('course', c.courseId),
        students: data.enrollment.filter(
          (r) => r.classId === c.id && r.isCurrent
        ).length,
        sessions: data.schedule.filter(
          (r) => r.classId === c.id && r.status !== 'cancelled'
        ).length,
        date: c.startDate
      }))
    return data.student
      .filter(
        (s) => tab !== 'admissions' || ['trial', 'potential'].includes(s.status)
      )
      .map((s) => {
        const scores = data.score.filter(
          (r) => r.studentId === s.id && Number(r.maxScore) > 0
        )
        return {
          ...s,
          branch: lookup('branch', s.branchId),
          average: scores.length
            ? number(
                scores.reduce(
                  (n, r) => n + (Number(r.score) / Number(r.maxScore)) * 10,
                  0
                ) / scores.length
              )
            : '—',
          enrolled: data.enrollment.filter(
            (r) => r.studentId === s.id && r.isCurrent
          ).length,
          date: s.createdAt
        }
      })
  }, [data, tab])
  const filtered = rows.filter(
    (r) =>
      (!keyword ||
        `${r.code} ${r.name} ${r.branch || ''}`
          .toLowerCase()
          .includes(keyword.toLowerCase())) &&
      (!branch || r.branchId === branch) &&
      (!from || String(r.date).slice(0, 10) >= from) &&
      (!to || String(r.date).slice(0, 10) <= to)
  )
  const columns =
    tab === 'finance'
      ? [
          ['code', 'Mã khoản thu'],
          ['name', 'Học viên'],
          ['className', 'Lớp'],
          ['payable', 'Phải thu'],
          ['paid', 'Đã thu'],
          ['debt', 'Còn nợ'],
          ['status', 'Trạng thái']
        ]
      : tab === 'teachers'
        ? [
            ['code', 'Mã giáo viên'],
            ['name', 'Họ tên'],
            ['branch', 'Cơ sở'],
            ['classes', 'Lớp phụ trách'],
            ['sessions', 'Buổi đã lên lịch'],
            ['hours', 'Giờ đã lên lịch']
          ]
        : tab === 'classes'
          ? [
              ['code', 'Mã lớp'],
              ['name', 'Lớp học'],
              ['course', 'Khóa học'],
              ['students', 'Học viên hiện tại'],
              ['sessions', 'Buổi đã lên lịch'],
              ['status', 'Trạng thái']
            ]
          : [
              ['code', 'Mã học viên'],
              ['name', 'Họ tên'],
              ['branch', 'Cơ sở'],
              ['status', 'Trạng thái'],
              ['enrolled', 'Lớp đang học'],
              ['average', 'Điểm trung bình /10'],
              ['date', 'Ngày tạo', (r) => date(r.date)]
            ]
  const s = workspace.data?.statistics,
    charts = workspace.data?.charts
  return (
    <div className="min-w-0 space-y-5">
      <WorkspaceHeader
        title="Báo cáo"
        tabs={[
          ['dashboard', 'Tổng quan'],
          ['admissions', 'Tuyển sinh'],
          ['students', 'Học viên'],
          ['teachers', 'Giáo viên'],
          ['finance', 'Tài chính'],
          ['classes', 'Lớp học']
        ]}
        activeTab={tab}
        onTabChange={setTab}
        reload={workspace.reload}
      >
        <button
          className={button}
          disabled={!data}
          onClick={() =>
            exportRows(
              tab === 'dashboard'
                ? Object.entries(s).map(([name, value]) => ({ name, value }))
                : filtered,
              'bao-cao'
            )
          }
        >
          Xuất Excel
        </button>
        <button className={button} onClick={() => window.print()}>
          In / lưu PDF
        </button>
      </WorkspaceHeader>
      <WorkspaceState {...workspace} />
      {data &&
        (tab === 'dashboard' ? (
          <>
            <WorkspaceStats
              items={[
                ['Học viên', s.students],
                ['Giáo viên', s.teachers],
                ['Lớp học', s.classes],
                ['Tiền thu thành công', money(s.revenue)]
              ]}
            />
            <div className="grid gap-5 xl:grid-cols-2">
              <WorkspaceChart
                title="Học viên theo tháng tạo hồ sơ"
                rows={charts.monthlyStudents}
              />
              <WorkspaceChart
                title="Tiền thu thành công theo tháng"
                rows={charts.monthlyRevenue}
                currency
              />
              <WorkspaceChart
                title="Trạng thái học viên"
                rows={charts.studentStatus}
              />
              <WorkspaceChart
                title="Tiền thu theo cơ sở"
                rows={charts.branchRevenue}
                currency
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs font-semibold text-slate-500">
                Tìm kiếm
                <input
                  className={input}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Mã, tên"
                />
              </label>
              {tab !== 'classes' && (
                <label className="text-xs font-semibold text-slate-500">
                  Cơ sở
                  <select
                    className={input}
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    {data.branch.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="text-xs font-semibold text-slate-500">
                Từ ngày
                <input
                  className={input}
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Đến ngày
                <input
                  className={input}
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
            </div>
            <p className="text-sm text-slate-500">
              {filtered.length} bản ghi · Thời gian lọc theo ngày tạo hồ sơ,
              ngày mở lớp hoặc hạn thanh toán.
            </p>
            <WorkspaceTable columns={columns} rows={filtered} />
          </>
        ))}
    </div>
  )
}
