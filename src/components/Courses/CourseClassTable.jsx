import { Eye, Pencil, Trash2 } from 'lucide-react'

function formatDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function CourseClassTable({ classes, courseMap, teacherMap, roomMap, statusMap, onView, onEdit, onDelete }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Danh sách lớp học</p>
        <h2 className="mt-2 text-lg font-black text-slate-950">Lớp được mở từ khóa học</h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm">
        <table className="w-full min-w-[1260px] border-collapse text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-6 py-4">Mã lớp</th>
              <th className="px-4 py-4">Tên lớp</th>
              <th className="px-4 py-4">Khóa học</th>
              <th className="px-4 py-4">Giáo viên</th>
              <th className="px-4 py-4">Phòng học</th>
              <th className="px-4 py-4">Ngày khai giảng</th>
              <th className="px-4 py-4">Ngày kết thúc</th>
              <th className="px-4 py-4">Lịch học</th>
              <th className="px-4 py-4">Sĩ số</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {classes.map((item) => {
              const status = statusMap[item.status]
              return (
                <tr key={item.id} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4 font-black text-slate-900">{item.code}</td>
                  <td className="px-4 py-4 font-bold text-slate-800">{item.name}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{courseMap[item.courseId]?.name}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{teacherMap[item.teacherId]?.name}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{roomMap[item.roomId]?.name}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{formatDate(item.startDate)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{formatDate(item.endDate)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.schedule}</td>
                  <td className="px-4 py-4 font-black text-slate-900">{item.currentStudents}/{item.maxStudents}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${status?.badgeClass || ''}`}>
                      {status?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700"
                        title="Xem lớp học"
                        onClick={() => onView(item)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700"
                        title="Sửa lớp học"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700"
                        title="Xóa lớp học"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default CourseClassTable
