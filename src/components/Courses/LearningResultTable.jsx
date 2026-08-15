import { Eye, FileDown } from 'lucide-react'

function LearningResultTable({ results, studentMap, classMap, courseMap, teacherMap, onView, onExport }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Kết quả học tập</p>
          <h2 className="mt-2 text-lg font-black text-slate-950">Theo dõi điểm, chuyên cần và nhận xét</h2>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-700 hover:bg-blue-100"
          onClick={onExport}
        >
          <FileDown size={17} />
          Xuất bảng điểm
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm">
        <table className="w-full min-w-[1460px] border-collapse text-left text-sm">
          <thead className="bg-blue-600 text-xs font-black uppercase text-white">
            <tr>
              <th className="px-6 py-4">Học viên</th>
              <th className="px-4 py-4">Lớp học</th>
              <th className="px-4 py-4">Khóa học</th>
              <th className="px-4 py-4">Chuyên cần</th>
              <th className="px-4 py-4">Có mặt</th>
              <th className="px-4 py-4">Nghỉ phép</th>
              <th className="px-4 py-4">Nghỉ KP</th>
              <th className="px-4 py-4">Giữa kỳ</th>
              <th className="px-4 py-4">Cuối kỳ</th>
              <th className="px-4 py-4">TB</th>
              <th className="px-4 py-4">Xếp loại</th>
              <th className="px-4 py-4">Kỹ năng</th>
              <th className="px-4 py-4">Nhận xét</th>
              <th className="px-4 py-4">Giáo viên</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {results.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50">
                <td className="px-6 py-4 font-black text-slate-900">{studentMap[item.studentId]?.name}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{classMap[item.classId]?.name}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{courseMap[item.courseId]?.name}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{item.attendance.totalSessions} buổi</td>
                <td className="px-4 py-4 font-black text-emerald-700">{item.attendance.present}</td>
                <td className="px-4 py-4 font-bold text-amber-700">{item.attendance.excusedAbsent}</td>
                <td className="px-4 py-4 font-bold text-red-700">{item.attendance.unexcusedAbsent}</td>
                <td className="px-4 py-4 font-black text-slate-900">{item.scores.midterm}</td>
                <td className="px-4 py-4 font-black text-slate-900">{item.scores.final}</td>
                <td className="px-4 py-4 font-black text-blue-700">{item.scores.average}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {item.scores.rank}
                  </span>
                </td>
                <td className="px-4 py-4 font-semibold text-slate-700">
                  L:{item.skills.listening} S:{item.skills.speaking} R:{item.skills.reading} W:{item.skills.writing}
                </td>
                <td className="max-w-[280px] px-4 py-4 font-semibold text-slate-600">{item.progress}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">{teacherMap[item.teacherId]?.name}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700"
                      title="Xem kết quả học tập"
                      onClick={() => onView(item)}
                    >
                      <Eye size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default LearningResultTable
