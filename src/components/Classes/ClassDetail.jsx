import { useState } from 'react'
import { Eye, Trash2, Upload } from 'lucide-react'

function ClassDetail({
  classItem,
  tabs,
  students,
  schedules,
  attendanceSessions,
  homeworkItems,
  scoreItems,
  notificationItems,
  documentItems,
}) {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [selectedItems, setSelectedItems] = useState({})
  const [documentLessons, setDocumentLessons] = useState(documentItems)
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'PDF',
    fileName: '',
  })

  const infoRows = {
    'Thông tin lớp': [
      ['Mã lớp', classItem.code],
      ['Tên lớp', classItem.name],
      ['Khóa học', classItem.course],
      ['Giáo viên', classItem.teacher],
      ['Phòng học', classItem.room],
      ['Cơ sở', classItem.branch],
      ['Sĩ số', `${classItem.currentSize}/${classItem.maxSize}`],
      ['Trạng thái', classItem.status],
    ],
    'Điểm danh': [['Tỷ lệ chuyên cần', '94%'], ['Buổi đã học', '18 buổi'], ['Buổi vắng', '6 lượt']],
    Homework: [['Bài đã giao', '24 bài'], ['Bài cần chấm', '12 bài'], ['Tỷ lệ nộp', '88%']],
    'Điểm số': [['Điểm trung bình', '7.8'], ['Bài kiểm tra gần nhất', 'Mock Test'], ['Cần hỗ trợ', '4 học viên']],
    'Thông báo': [['Thông báo mới', '3'], ['Đã gửi phụ huynh', '18'], ['Chờ xác nhận', '2']],
    'Tài liệu': [['Tài liệu đã tải', '16'], ['Bài giảng', '8 file'], ['Bài tập', '8 file']],
  }
  const selectableData = {
    'Điểm danh': attendanceSessions,
    Homework: homeworkItems,
    'Điểm số': scoreItems,
    'Thông báo': notificationItems,
    'Tài liệu': documentLessons,
  }
  const selectedItem = selectableData[activeTab]?.find((item) => item.id === selectedItems[activeTab]) || selectableData[activeTab]?.[0]

  const handleViewDocument = (document) => {
    if (document.url) {
      window.open(document.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDeleteDocument = (documentId) => {
    setDocumentLessons((current) =>
      current.map((lesson) =>
        lesson.id === selectedItem.id
          ? {
              ...lesson,
              documents: lesson.documents.filter((document) => document.id !== documentId),
            }
          : lesson,
      ),
    )
  }

  const handleAddDocument = (event) => {
    event.preventDefault()

    if (!newDocument.title || !newDocument.fileName) {
      return
    }

    setDocumentLessons((current) =>
      current.map((lesson) =>
        lesson.id === selectedItem.id
          ? {
              ...lesson,
              documents: [
                ...lesson.documents,
                {
                  id: `document-${Date.now()}`,
                  title: newDocument.title,
                  type: newDocument.type,
                  fileName: newDocument.fileName,
                  updatedAt: 'Hôm nay',
                  owner: 'Quản trị viên',
                  url: '',
                },
              ],
            }
          : lesson,
      ),
    )
    setNewDocument({ title: '', type: 'PDF', fileName: '' })
  }

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
                {item.date || item.deadline || item.sentAt || item.updatedAt}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-300 bg-slate-50 p-5">
          <h3 className="text-lg font-black text-slate-950">{selectedItem?.title}</h3>

          {activeTab === 'Điểm danh' ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-300 bg-white">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Mã học viên</th>
                    <th className="px-4 py-3">Họ tên</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedItem.students.map((student) => {
                    const isAbsent = student.status === 'Vắng'

                    return (
                      <tr key={student.id} className={isAbsent ? 'bg-red-50 text-red-800' : 'bg-white'}>
                        <td className="px-4 py-3 font-bold">{student.id}</td>
                        <td className="px-4 py-3 font-bold">{student.name}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${isAbsent ? 'border-red-200 bg-red-100 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{student.note}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === 'Homework' ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-gray-300 bg-white p-4">
                <p className="text-xs font-black uppercase text-slate-500">Hạn nộp</p>
                <p className="mt-2 font-bold text-slate-950">{selectedItem.deadline}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                <p className="text-xs font-black uppercase">Đã nộp</p>
                <p className="mt-2 text-xl font-black">{selectedItem.submitted}</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="text-xs font-black uppercase">Chưa nộp</p>
                <p className="mt-2 font-bold">{selectedItem.missing.join(', ')}</p>
              </div>
            </div>
          ) : null}

          {activeTab === 'Điểm số' ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
              <div className="grid gap-3">
                {[
                  ['Trung bình', selectedItem.average],
                  ['Cao nhất', selectedItem.highest],
                  ['Thấp nhất', selectedItem.lowest],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-300 bg-white p-4">
                    <p className="text-xs font-black uppercase text-slate-500">{label}</p>
                    <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-300 bg-white p-4">
                {selectedItem.students.map((student) => (
                  <div key={student.name} className="flex items-center justify-between border-b border-gray-200 py-3 last:border-0">
                    <span className="font-bold text-slate-700">{student.name}</span>
                    <span className="font-black text-blue-700">{student.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === 'Thông báo' ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ['Thời gian gửi', selectedItem.sentAt],
                ['Đối tượng', selectedItem.audience],
                ['Trạng thái', selectedItem.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-300 bg-white p-4">
                  <p className="text-xs font-black uppercase text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'Tài liệu' ? (
            <>
              <form className="mt-4 rounded-xl border border-gray-300 bg-white p-4" onSubmit={handleAddDocument}>
                <div className="grid gap-3 lg:grid-cols-[1fr_150px_1fr_auto] lg:items-end">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">Tên tài liệu</span>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm font-semibold outline-none"
                      placeholder="Nhập tên tài liệu"
                      value={newDocument.title}
                      onChange={(event) => setNewDocument((current) => ({ ...current, title: event.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">Loại file</span>
                    <select
                      className="mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm font-semibold outline-none"
                      value={newDocument.type}
                      onChange={(event) => setNewDocument((current) => ({ ...current, type: event.target.value }))}
                    >
                      <option value="Word">Word</option>
                      <option value="PDF">PDF</option>
                      <option value="PPT">PPT</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">File</span>
                    <input
                      type="file"
                      accept=".doc,.docx,.pdf,.ppt,.pptx"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
                      onChange={(event) =>
                        setNewDocument((current) => ({
                          ...current,
                          fileName: event.target.files?.[0]?.name || '',
                        }))
                      }
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Upload size={17} aria-hidden="true" />
                    Thêm
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Chỉ hỗ trợ 3 dạng tài liệu: Word, PDF và PowerPoint.
                </p>
              </form>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-300 bg-white">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tên tài liệu</th>
                      <th className="px-4 py-3">Loại</th>
                      <th className="px-4 py-3">Tên file</th>
                      <th className="px-4 py-3">Cập nhật</th>
                      <th className="px-4 py-3">Người phụ trách</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedItem.documents.map((document) => (
                      <tr key={document.id}>
                        <td className="px-4 py-3 font-bold text-slate-950">{document.title}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                            {document.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">{document.fileName}</td>
                        <td className="px-4 py-3 font-medium text-slate-600">{document.updatedAt}</td>
                        <td className="px-4 py-3 font-medium text-slate-600">{document.owner}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Xem ${document.title}`}
                              disabled={!document.url}
                              onClick={() => handleViewDocument(document)}
                            >
                              <Eye size={17} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700"
                              aria-label={`Xóa ${document.title}`}
                              onClick={() => handleDeleteDocument(document.id)}
                            >
                              <Trash2 size={17} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-700">{classItem.code}</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{classItem.name}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {classItem.course} / {classItem.teacher} / {classItem.room}
          </p>
        </div>
        <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
          Chi tiết lớp
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

      {activeTab === 'Danh sách học viên' ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-300">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã học viên</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Chuyên cần</th>
                <th className="px-4 py-3">Điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-3 font-bold text-blue-700">{student.id}</td>
                  <td className="px-4 py-3 font-bold text-slate-950">{student.name}</td>
                  <td className="px-4 py-3">{student.status}</td>
                  <td className="px-4 py-3">{student.attendance}</td>
                  <td className="px-4 py-3">{student.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {activeTab === 'Lịch học' ? (
        <div className="mt-5 grid gap-3">
          {schedules.map((item) => (
            <div key={`${item.date}-${item.time}`} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
              <p className="font-black text-slate-950">{item.lesson}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {item.date} / {item.time} / {item.room} / {item.teacher}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {renderSelectableDetail()}

      {activeTab !== 'Danh sách học viên' && activeTab !== 'Lịch học' && !selectableData[activeTab] ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(infoRows[activeTab] || []).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default ClassDetail
