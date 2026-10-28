import { useEffect, useState } from 'react'
import { getStudentProfile, initials } from '../../services/crmApi.js'
import { studentStatus } from '../../datas/students.js'

const sections = { 'Thông tin': 'overview', 'Phụ huynh': 'overview', 'Khóa học': 'overview', 'Điểm danh': 'attendance', 'Điểm số': 'scores', Homework: 'homework', 'Học phí': 'tuition', 'Lịch sử': 'history', 'Chứng chỉ': 'certificates' }
const labels = { active: 'Đang học', reserved: 'Bảo lưu', stopped: 'Nghỉ học', transferred: 'Đã chuyển lớp', submitted: 'Đã nộp', missing: 'Chưa nộp', late: 'Nộp muộn', paid: 'Đã thanh toán', unpaid: 'Chưa thanh toán', partial: 'Thanh toán một phần', overdue: 'Quá hạn', issued: 'Đã cấp', pending: 'Đang chờ' }
const label = (value) => labels[value] || value
const date = (value) => {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().join('/')
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })
}
const money = (value) => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? '—' : `${Number(value).toLocaleString('vi-VN')} ₫`
const score = (value, maximum) => value === null || value === undefined ? '—' : maximum === null || maximum === undefined ? value : `${value}/${maximum}`
const rows = (page, mapper) => ({ total: page?.total ?? 0, items: (page?.items || []).map(mapper) })

function profileGroups(tab, data) {
  switch (tab) {
    case 'Thông tin': return [{ title: 'Thông tin học viên', total: 1, items: [{ id: data.student.id, title: data.student.name, fields: [
      ['Mã học viên', data.student.code], ['Giới tính', { male: 'Nam', female: 'Nữ' }[data.student.gender] || data.student.gender], ['Ngày sinh', date(data.student.birthDate)], ['Số điện thoại', data.student.phone], ['Email', data.student.email], ['Cơ sở', data.student.branch?.name], ['Trạng thái', studentStatus.find((item) => item.value === data.student.status)?.label || data.student.status], ['Sale phụ trách', data.sale?.name || 'Chưa có Sale'],
    ] }] }]
    case 'Phụ huynh': return [{ title: 'Phụ huynh', ...rows(data.guardians, (item) => ({ id: item.id, title: item.name, fields: [['Số điện thoại', item.phone], ['Quan hệ', item.relationship], ['Liên hệ chính', item.isPrimary ? 'Có' : 'Không']] })) }]
    case 'Khóa học': return [{ title: 'Ghi danh khóa học / lớp học', ...rows(data.enrollments, (item) => ({ id: item.id, title: item.class?.name, fields: [['Khóa học', item.class?.course?.name], ['Giáo viên', (data.classStaff || []).filter((link) => link.classId === item.classId).map((link) => link.staff?.name).filter(Boolean).join(', ')], ['Trạng thái', label(item.status)], ['Ngày nhập học', date(item.enrolledAt)], ['Hạn học riêng', date(item.expiresAt)], ['Ngày kết thúc thực tế', date(item.endedAt)], ['Lý do', item.reason]] })) }]
    case 'Điểm danh': return [{ title: 'Bản ghi điểm danh', ...rows(data.attendance, (item) => ({ id: item.id, title: item.schedule?.class?.name, fields: [['Buổi học', date(item.schedule?.startAt)], ['Giáo viên', item.schedule?.teacher?.name], ['Giờ vào lớp', date(item.checkedInAt)], ['Bài học', item.schedule?.lessonNote]] })) }]
    case 'Điểm số': return [{ title: 'Điểm số', ...rows(data.scores, (item) => ({ id: item.id, title: item.title, fields: [['Ngày kiểm tra', date(item.scoreDate)], ['Môn kiểm tra', item.subject], ['Lớp', item.class?.name], ['Điểm', score(item.score, item.maxScore)], ['Thứ hạng', item.rank], ['Giáo viên', item.teacher?.name], ['Nhận xét', item.note]] })) }]
    case 'Homework': return [{ title: 'Tình trạng bài tập', ...rows(data.submissions, (item) => ({ id: item.id, title: item.homework?.title, fields: [['Lớp', item.homework?.class?.name], ['Hạn nộp', date(item.homework?.deadline)], ['Trạng thái', label(item.status)], ['Ngày nộp', date(item.submittedAt)], ['Điểm', score(item.score, item.maxScore)], ['Ghi chú', item.note]] })) }]
    case 'Học phí': return [
      { title: 'Khoản phải thu', ...rows(data.transactions, (item) => ({ id: item.id, title: item.code, fields: [['Lớp', item.class?.name], ['Phải thu', money(item.payableAmount)], ['Đã thanh toán', money(item.paidAmount)], ['Còn nợ', money(item.debtAmount)], ['Hạn thanh toán', date(item.dueDate)], ['Trạng thái', label(item.status)], ['Ghi chú', item.note]] })) },
      { title: 'Thanh toán', ...rows(data.payments, (item) => ({ id: item.id, title: date(item.paidAt), fields: [['Số tiền', money(item.amount)], ['Phương thức', item.method], ['Trạng thái', label(item.status)], ['Ghi chú', item.note]] })) },
      { title: 'Lịch trả nợ', ...rows(data.debtSchedules, (item) => ({ id: item.id, title: date(item.dueDate), fields: [['Số tiền', money(item.amount)], ['Trạng thái', label(item.status)], ['Ghi chú', item.note]] })) },
    ]
    case 'Lịch sử': return [
      { title: 'Lịch sử trạng thái', ...rows(data.statusHistory, (item) => ({ id: item.id, title: `${label(item.fromStatus) || '—'} → ${label(item.toStatus) || '—'}`, fields: [['Ngày có hiệu lực', date(item.fromDate)], ['Người thực hiện', item.actorId], ['Lý do', item.reason]] })) },
      { title: 'Nhật ký hoạt động', ...rows(data.activities, (item) => ({ id: item.id, title: item.action, fields: [['Ngày ghi nhận', date(item.createdAt)], ['Người thực hiện', item.actorUserId], ['Nội dung', item.note]] })) },
    ]
    case 'Chứng chỉ': return [{ title: 'Chứng chỉ', ...rows(data.certificates, (item) => ({ id: item.id, title: item.title, fields: [['Khóa học', item.course?.name], ['Ngày cấp', date(item.issuedAt)], ['Dự kiến cấp', date(item.expectedAt)], ['Đơn vị cấp', item.issuer], ['Kết quả', item.score], ['Trạng thái', label(item.status)], ['Ghi chú', item.note]] })) }]
    default: return []
  }
}

function StudentProfile({ student, tabs }) {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  const section = sections[activeTab]
  const studentId = student?.id
  const requestKey = `${studentId}/${section}/${page}`

  useEffect(() => {
    let cancelled = false
    setResult(null)
    setError('')
    setLoading(true)
    if (!studentId) { setLoading(false); return }
    getStudentProfile(studentId, { section, page, size: 20 })
      .then((data) => {
        if (data?.student?.id !== studentId) throw new Error('Hồ sơ trả về không đúng học viên')
        if (!cancelled) setResult({ key: requestKey, data })
      })
      .catch((cause) => { if (!cancelled) setError(cause.message || 'Không thể tải hồ sơ học viên') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [studentId, section, page, requestKey, version])

  if (!student) return <section className="rounded-xl border border-gray-300 bg-white p-6 text-slate-500">Chưa có học viên để xem hồ sơ. Hãy chọn học viên trong danh sách.</section>
  const data = result?.key === requestKey ? result.data : null
  const groups = data ? profileGroups(activeTab, data) : []
  const pageCount = Math.max(1, ...groups.map((group) => Math.ceil(group.total / 20)))

  return (
    <section className="space-y-5 rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">{initials(student.name)}</span>
        <div><h2 className="text-xl font-black text-slate-950">{student.name}</h2><p className="mt-1 text-sm font-bold text-blue-700">{student.code}</p></div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); setPage(1) }} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab}</button>)}
      </div>
      {loading || (!data && !error) ? <p role="status" className="py-5 text-sm text-slate-500">Đang tải hồ sơ…</p> : null}
      {error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} <button type="button" className="ml-3 underline" onClick={() => setVersion((value) => value + 1)}>Thử lại</button></div> : null}
      {data && !loading && !error ? <>
        {groups.map((group) => <div key={group.title}>
          <h3 className="mb-3 font-bold text-slate-800">{group.title}</h3>
          {!group.items.length ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Chưa có dữ liệu.</p> : <div className="space-y-3">{group.items.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 p-4">
            <h4 className="mb-3 font-bold text-blue-700">{item.title || '—'}</h4>
            <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{item.fields.map(([name, value]) => <div key={name}><dt className="text-xs font-semibold text-slate-500">{name}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value === null || value === undefined || value === '' ? '—' : value}</dd></div>)}</dl>
          </article>)}</div>}
        </div>)}
        {activeTab !== 'Thông tin' ? <div className="flex items-center justify-between text-sm">
          <span>Trang {page}/{pageCount}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Trước</button><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Sau</button></div>
        </div> : null}
      </> : null}
    </section>
  )
}

export default StudentProfile
