import { useState } from 'react'
import dayjs from 'dayjs'
import { Bell, Building2, Pencil, Printer } from 'lucide-react'

function StaffDetail({
  staff,
  tabs = [],
  managedClasses,
  teachingSchedules,
  attendanceData,
  teacherKPIs,
  certificates,
  onOpenModal,
}) {
  const detailTabs = tabs.length ? tabs : ['Thông tin', 'Chuyên môn', 'Lớp phụ trách', 'Lịch giảng dạy', 'Chấm công', 'KPI']
  const [activeTab, setActiveTab] = useState(detailTabs[0])
  const staffClasses = managedClasses.filter((item) => item.staffId === staff.id)
  const staffSchedules = teachingSchedules.filter((item) => item.staffId === staff.id)
  const staffAttendances = attendanceData.filter((item) => item.staffId === staff.id)
  const staffCertificates = certificates.filter((item) => item.staffId === staff.id)
  const staffKpi = teacherKPIs.find((item) => item.staffId === staff.id)
  const renderInfoCards = (rows) => (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-sm font-bold text-slate-950">{value || 'Chưa cập nhật'}</p>
        </div>
      ))}
    </div>
  )

  const renderSimpleTable = (columns, rows, emptyText) => (
    <div className="mt-5 overflow-x-auto rounded-xl border border-gray-300">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
          <tr>
            {columns.map((column) => <th key={column.key} className="px-4 py-3">{column.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length ? rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 font-semibold text-slate-700">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-6 text-center text-sm font-semibold text-slate-500" colSpan={columns.length}>{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">
            {staff.avatar}
          </span>
          <div>
            <p className="text-sm font-bold text-blue-700">{staff.code}</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{staff.name}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {staff.position} / {staff.department}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('edit', staff)}>
            <Pencil size={16} /> Cập nhật
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('assignClass', staff)}>
            <Building2 size={16} /> Phân công lớp
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('notify', staff)}>
            <Bell size={16} /> Thông báo
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => onOpenModal('printProfile', staff)}>
            <Printer size={16} /> In hồ sơ
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {detailTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={[
              'shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition',
              activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Thông tin' ? renderInfoCards([
        ['Họ tên', staff.name],
        ['Ngày sinh', dayjs(staff.birthDate).format('DD/MM/YYYY')],
        ['Giới tính', staff.gender],
        ['CCCD', staff.citizenId],
        ['Địa chỉ', staff.address],
        ['Điện thoại', staff.phone],
        ['Email', staff.email],
        ['Chức vụ', staff.position],
        ['Bộ phận', staff.department],
        ['Ngày vào làm', dayjs(staff.startDate).format('DD/MM/YYYY')],
        ['Trạng thái', staff.status],
      ]) : null}

      {activeTab === 'Chuyên môn' ? (
        <>
          {renderInfoCards([
            ['Chuyên ngành', staff.major],
            ['Trình độ', staff.degree],
            ['Kinh nghiệm', staff.experience],
            ['Ngoại ngữ', staff.languages],
            ['Kỹ năng', staff.skills.join(', ')],
          ])}
          {renderSimpleTable(
            [
              { key: 'title', label: 'Chứng chỉ' },
              { key: 'issuer', label: 'Đơn vị cấp' },
              { key: 'issuedAt', label: 'Ngày cấp', render: (row) => dayjs(row.issuedAt).format('DD/MM/YYYY') },
              { key: 'expiresAt', label: 'Hết hạn' },
              { key: 'status', label: 'Trạng thái' },
            ],
            staffCertificates,
            'Chưa có chứng chỉ.',
          )}
        </>
      ) : null}

      {activeTab === 'Lớp phụ trách' ? renderSimpleTable(
        [
          { key: 'className', label: 'Lớp đang dạy' },
          { key: 'course', label: 'Khóa học' },
          { key: 'students', label: 'Sĩ số' },
          { key: 'schedule', label: 'Lịch học' },
        ],
        staffClasses,
        'Chưa phân công lớp.',
      ) : null}

      {activeTab === 'Lịch giảng dạy' ? (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Theo ngày', 'Theo tuần', 'Theo tháng'].map((view) => (
              <span key={view} className="rounded-xl border border-gray-300 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">{view}</span>
            ))}
          </div>
          {renderSimpleTable(
            [
              { key: 'title', label: 'Lớp học' },
              { key: 'course', label: 'Khóa học' },
              { key: 'date', label: 'Ngày', render: (row) => dayjs(row.date).format('DD/MM/YYYY') },
              { key: 'time', label: 'Thời gian' },
              { key: 'room', label: 'Phòng' },
            ],
            staffSchedules,
            'Chưa có lịch giảng dạy.',
          )}
        </>
      ) : null}

      {activeTab === 'Chấm công' ? (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Theo ngày', 'Theo tuần', 'Theo tháng'].map((view) => (
              <span key={view} className="rounded-xl border border-gray-300 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">{view}</span>
            ))}
          </div>
          {renderSimpleTable(
            [
              { key: 'date', label: 'Ngày', render: (row) => dayjs(row.date).format('DD/MM/YYYY') },
              { key: 'checkIn', label: 'Giờ vào' },
              { key: 'checkOut', label: 'Giờ ra' },
              { key: 'totalHours', label: 'Tổng giờ làm' },
              { key: 'status', label: 'Trạng thái' },
            ],
            staffAttendances,
            'Chưa có dữ liệu chấm công.',
          )}
        </>
      ) : null}

      {activeTab === 'KPI' ? renderInfoCards([
        ['Số giờ giảng dạy', staffKpi?.teachingHours],
        ['Số lớp phụ trách', staffKpi?.classes],
        ['Tổng số học viên', staffKpi?.students],
        ['Homework đã chấm', staffKpi?.homeworkMarked],
        ['Bài kiểm tra đã chấm', staffKpi?.testsMarked],
        ['Điểm trung bình học viên', staffKpi?.averageScore],
        ['Tỷ lệ chuyên cần học viên', staffKpi?.attendanceRate],
        ['Đánh giá của học viên', staffKpi?.studentRating],
        ['Đánh giá của quản lý', staffKpi?.managerRating],
      ]) : null}
    </section>
  )
}

export default StaffDetail
