import { Eye, FileDown } from 'lucide-react'

export default function LearningResultTable({ results, studentMap, classMap, courseMap, teacherMap, onView, onExport }) {
  return <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-black text-slate-950">Kết quả từng bài kiểm tra</h2>
      <button type="button" disabled={!results.length} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 font-bold text-blue-700 disabled:opacity-50" onClick={onExport}><FileDown size={17} />Xuất bảng điểm</button>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm">
      <thead className="bg-blue-600 text-white"><tr>{['Học viên', 'Lớp học', 'Khóa học', 'Bài kiểm tra', 'Môn', 'Ngày', 'Điểm', 'Thứ hạng', 'Giáo viên', 'Thao tác'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-200">
        {!results.length ? <tr><td colSpan={10} className="p-6 text-center text-slate-500">Không có kết quả phù hợp.</td></tr> : null}
        {results.map((item) => <tr key={item.id} className="hover:bg-blue-50/50">
          {[studentMap[item.studentId]?.name || item.studentId, classMap[item.classId]?.name || item.classId, courseMap[item.courseId]?.name || '—', item.title, item.subject, item.scoreDate?.slice(0, 10), item.score + '/' + item.maxScore, item.rank ?? '—', teacherMap[item.teacherId]?.name || item.teacherId].map((value, index) => <td key={index} className="px-4 py-3 font-semibold text-slate-700">{value}</td>)}
          <td className="px-4 py-3"><button type="button" title="Xem kết quả học tập" onClick={() => onView(item)} className="rounded-lg bg-blue-50 p-2 text-blue-700"><Eye size={17} /></button></td>
        </tr>)}
      </tbody>
    </table></div>
  </section>
}
