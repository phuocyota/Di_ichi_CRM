import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(value)
}

function CourseTable({ courses, statusMap, onView, onEdit, onDelete, onAddClass }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Khóa học</p>
        <h2 className="mt-2 text-lg font-black text-slate-950">Chương trình đào tạo đang quản lý</h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm">
        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-6 py-4">Mã khóa học</th>
              <th className="px-4 py-4">Tên khóa học</th>
              <th className="px-4 py-4">Cấp độ</th>
              <th className="px-4 py-4">Thời lượng</th>
              <th className="px-4 py-4">Số buổi</th>
              <th className="px-4 py-4">Học phí</th>
              <th className="px-4 py-4">Mô tả</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {courses.map((item) => {
              const status = statusMap[item.status]
              return (
                <tr key={item.id} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4 font-black text-slate-900">{item.code}</td>
                  <td className="px-4 py-4 font-bold text-slate-800">{item.name}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.level}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.duration}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.sessions}</td>
                  <td className="px-4 py-4 font-black text-slate-900">{formatCurrency(item.tuition)}</td>
                  <td className="max-w-[280px] px-4 py-4 font-semibold text-slate-600">{item.description}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${status?.badgeClass || ''}`}>
                      {status?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700"
                        title="Thêm lớp cho khóa học"
                        onClick={() => onAddClass(item)}
                      >
                        <Plus size={17} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700"
                        title="Xem khóa học"
                        onClick={() => onView(item)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700"
                        title="Sửa khóa học"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700"
                        title="Xóa khóa học"
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

export default CourseTable
