import { X } from 'lucide-react'

function Metric({ label, value, tone = 'slate' }) {
  const toneClass = {
    slate: 'bg-slate-50 text-slate-800 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }[tone]

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase text-current/70">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  )
}

function LearningResultDetailModal({ result, studentMap, classMap, courseMap, teacherMap, onClose }) {
  if (!result) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Bảng điểm học viên</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">{studentMap[result.studentId]?.name}</h3>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {classMap[result.classId]?.name} - {courseMap[result.courseId]?.name}
            </p>
          </div>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Giữa kỳ" value={result.scores.midterm} tone="blue" />
            <Metric label="Cuối kỳ" value={result.scores.final} tone="blue" />
            <Metric label="Trung bình" value={result.scores.average} tone="emerald" />
            <Metric label="Xếp loại" value={result.scores.rank} tone="emerald" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-sm font-black uppercase text-slate-700">Chuyên cần</h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Metric label="Số buổi" value={result.attendance.totalSessions} />
                <Metric label="Có mặt" value={result.attendance.present} tone="emerald" />
                <Metric label="Nghỉ phép" value={result.attendance.excusedAbsent} tone="amber" />
                <Metric label="Nghỉ KP" value={result.attendance.unexcusedAbsent} tone="red" />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-sm font-black uppercase text-slate-700">Đánh giá kỹ năng</h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Metric label="Listening" value={result.skills.listening} tone="blue" />
                <Metric label="Speaking" value={result.skills.speaking} tone="blue" />
                <Metric label="Reading" value={result.skills.reading} tone="blue" />
                <Metric label="Writing" value={result.skills.writing} tone="blue" />
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-black uppercase text-slate-700">Nhận xét giáo viên</h4>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-700 md:grid-cols-2">
              <p><span className="font-black text-slate-950">Tiến bộ:</span> {result.progress}</p>
              <p><span className="font-black text-slate-950">Điểm mạnh:</span> {result.strength}</p>
              <p><span className="font-black text-slate-950">Cần cải thiện:</span> {result.improvement}</p>
              <p><span className="font-black text-slate-950">Đề xuất:</span> {result.recommendation}</p>
              <p><span className="font-black text-slate-950">Giáo viên:</span> {teacherMap[result.teacherId]?.name}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default LearningResultDetailModal
