import { X } from 'lucide-react'

export default function LearningResultDetailModal({ result, studentMap, classMap, courseMap, teacherMap, onClose }) {
  if (!result) return null
  const fields = [
    ['Học viên', studentMap[result.studentId]?.name || result.studentId],
    ['Lớp học', classMap[result.classId]?.name || result.classId],
    ['Khóa học', courseMap[result.courseId]?.name],
    ['Bài kiểm tra', result.title], ['Môn', result.subject], ['Ngày kiểm tra', result.scoreDate?.slice(0, 10)],
    ['Điểm', result.score + '/' + result.maxScore], ['Thứ hạng', result.rank],
    ['Giáo viên', teacherMap[result.teacherId]?.name || result.teacherId], ['Nhận xét', result.note],
  ]
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <div role="dialog" aria-modal="true" aria-label="Chi tiết kết quả học tập" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between"><h3 className="text-xl font-black">Chi tiết kết quả học tập</h3><button type="button" aria-label="Đóng" onClick={onClose}><X size={20} /></button></div>
      <dl className="grid gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase text-slate-500">{label}</dt><dd className="mt-2 whitespace-pre-wrap font-semibold text-slate-800">{value ?? '—'}</dd></div>)}</dl>
    </div>
  </div>
}
