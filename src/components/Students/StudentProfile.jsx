import { useState } from 'react'

function StudentProfile({
  student,
  tabs,
  attendanceSessions,
  scoreItems,
  homeworkItems,
  tuitionItems,
  historyItems,
  certificateItems,
}) {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [selectedItems, setSelectedItems] = useState({})

  const profileRows = {
    'Thông tin': [
      ['Mã học viên', student.code],
      ['Họ tên', student.name],
      ['Giới tính', student.gender],
      ['Ngày sinh', student.birthDate],
      ['Số điện thoại', student.phone],
      ['Email', student.email],
      ['Cơ sở', student.branch],
      ['Trạng thái', student.status],
    ],
    'Phụ huynh': [
      ['Phụ huynh', student.parent],
      ['SĐT phụ huynh', student.parentPhone],
      ['Liên hệ ưu tiên', 'Gọi điện và SMS'],
    ],
    'Khóa học': [
      ['Khóa học', student.course],
      ['Lớp học', student.className],
      ['Giáo viên', student.teacher],
      ['Ngày nhập học', student.enrollmentDate],
    ],
  }

  const selectableData = {
    'Điểm danh': attendanceSessions,
    'Điểm số': scoreItems,
    Homework: homeworkItems,
    'Học phí': tuitionItems,
    'Lịch sử': historyItems,
    'Chứng chỉ': certificateItems,
  }

  const selectedItem =
    selectableData[activeTab]?.find((item) => item.id === selectedItems[activeTab]) || selectableData[activeTab]?.[0]

  const getStatusClass = (status) => {
    if (['Vắng', 'Chưa nộp', 'Quá hạn', 'Nghỉ học'].includes(status)) {
      return 'border-red-200 bg-red-50 text-red-700'
    }

    if (['Đi muộn', 'Nộp muộn', 'Đến hạn', 'Bảo lưu'].includes(status)) {
      return 'border-amber-200 bg-amber-50 text-amber-700'
    }

    if (['Đã thanh toán', 'Đã nộp', 'Đã cấp', 'Có mặt'].includes(status)) {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }

    return 'border-blue-200 bg-blue-50 text-blue-700'
  }

  const renderInfoCards = (rows) => (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
        </div>
      ))}
    </div>
  )

  const renderDetailCards = (rows) => (
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, value, status]) => (
        <div
          key={label}
          className={[
            'rounded-xl border p-4',
            status ? getStatusClass(status) : 'border-gray-300 bg-white text-slate-950',
          ].join(' ')}
        >
          <p className="text-xs font-black uppercase opacity-70">{label}</p>
          <p className="mt-2 text-sm font-bold">{value}</p>
        </div>
      ))}
    </div>
  )

  const renderSelectableDetail = () => {
    if (!selectableData[activeTab]) return null

    return (
      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {selectableData[activeTab].map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                'w-full rounded-xl border p-4 text-left shadow-sm transition',
                selectedItem?.id === item.id
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-slate-700 hover:bg-slate-50',
              ].join(' ')}
              onClick={() => setSelectedItems((current) => ({ ...current, [activeTab]: item.id }))}
            >
              <p className="text-sm font-black">{item.title}</p>
              <p className="mt-1 text-xs font-semibold opacity-75">
                {item.date || item.deadline || item.dueDate}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-300 bg-slate-50 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">{selectedItem?.title}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {selectedItem?.date || selectedItem?.deadline || selectedItem?.dueDate}
              </p>
            </div>
            {selectedItem?.status ? (
              <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(selectedItem.status)}`}>
                {selectedItem.status}
              </span>
            ) : null}
          </div>

          {activeTab === 'Điểm danh'
            ? renderDetailCards([
                ['Lớp học', selectedItem.className],
                ['Bài học', selectedItem.lesson],
                ['Giáo viên', selectedItem.teacher],
                ['Giờ vào lớp', selectedItem.checkIn, selectedItem.status],
                ['Trạng thái', selectedItem.status, selectedItem.status],
                ['Ghi chú', selectedItem.note, selectedItem.status === 'Vắng' ? selectedItem.status : null],
              ])
            : null}

          {activeTab === 'Điểm số'
            ? renderDetailCards([
                ['Môn kiểm tra', selectedItem.subject],
                ['Điểm số', selectedItem.score],
                ['Xếp loại', selectedItem.rank],
                ['Giáo viên chấm', selectedItem.teacher],
                ['Nhận xét', selectedItem.note],
              ])
            : null}

          {activeTab === 'Homework'
            ? renderDetailCards([
                ['Hạn nộp', selectedItem.deadline],
                ['Trạng thái', selectedItem.status, selectedItem.status],
                ['Thời gian nộp', selectedItem.submittedAt, selectedItem.status],
                ['Điểm bài tập', selectedItem.score],
                ['Ghi chú', selectedItem.note, selectedItem.status],
              ])
            : null}

          {activeTab === 'Học phí'
            ? renderDetailCards([
                ['Số tiền phải thu', selectedItem.amount],
                ['Đã thanh toán', selectedItem.paidAmount],
                ['Hạn thanh toán', selectedItem.dueDate, selectedItem.status],
                ['Phương thức', selectedItem.method],
                ['Trạng thái', selectedItem.status, selectedItem.status],
                ['Ghi chú', selectedItem.note],
              ])
            : null}

          {activeTab === 'Lịch sử'
            ? renderDetailCards([
                ['Ngày ghi nhận', selectedItem.date],
                ['Người thực hiện', selectedItem.actor],
                ['Loại hoạt động', selectedItem.type],
                ['Nội dung', selectedItem.note],
              ])
            : null}

          {activeTab === 'Chứng chỉ'
            ? renderDetailCards([
                ['Ngày cấp', selectedItem.date],
                ['Đơn vị cấp', selectedItem.issuer],
                ['Kết quả', selectedItem.score],
                ['Trạng thái', selectedItem.status, selectedItem.status],
                ['Ghi chú', selectedItem.note],
              ])
            : null}
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">
            {student.avatar}
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-950">{student.name}</h2>
            <p className="mt-1 text-sm font-bold text-blue-700">{student.code}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {student.course} / {student.className}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
          Hồ sơ đang xem
        </span>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
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

      {selectableData[activeTab] ? renderSelectableDetail() : renderInfoCards(profileRows[activeTab] || [])}
    </section>
  )
}

export default StudentProfile
