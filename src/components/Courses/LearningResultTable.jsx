import React from 'react'
import { Eye, FileDown } from 'lucide-react'
import { WorkspaceTable } from '../common/WorkspaceView.jsx'
export default function LearningResultTable({
  results,
  studentMap,
  classMap,
  courseMap,
  teacherMap,
  onView,
  onExport
}) {
  const rows = results.map((r) => ({
    ...r,
    studentName: studentMap[r.studentId]?.name || r.studentId,
    className: classMap[r.classId]?.name || r.classId,
    courseName: courseMap[r.courseId]?.name || '—',
    teacherName: teacherMap[r.teacherId]?.name || r.teacherId
  }))
  return (
    <section className="space-y-4">
      <header className="ui-section-heading">
        <h2 className="ui-section-title">Kết quả từng bài kiểm tra</h2>
        <button
          type="button"
          className="ui-button"
          disabled={!results.length}
          onClick={onExport}
        >
          <FileDown size={16} />
          Xuất bảng điểm
        </button>
      </header>
      <WorkspaceTable
        rows={rows}
        columns={[
          ['studentName', 'Học viên'],
          [
            'className',
            'Lớp / khóa học',
            (r) => (
              <div>
                {r.className}
                <span className="ui-identity-code">{r.courseName}</span>
              </div>
            )
          ],
          [
            'title',
            'Bài kiểm tra',
            (r) => (
              <div>
                {r.title}
                <span className="ui-identity-code">{r.subject}</span>
              </div>
            )
          ],
          [
            'scoreDate',
            'Ngày kiểm tra',
            (r) =>
              r.scoreDate
                ? new Date(r.scoreDate).toLocaleDateString('vi-VN')
                : '—'
          ],
          [
            'score',
            'Điểm',
            (r) => (
              <span className="font-semibold tabular-nums">
                {r.score}/{r.maxScore}
              </span>
            )
          ],
          ['rank', 'Thứ hạng'],
          ['teacherName', 'Giáo viên'],
          [
            'actions',
            'Thao tác',
            (r) => (
              <button
                type="button"
                className="ui-button ui-icon-button"
                title="Xem kết quả học tập"
                aria-label={`Xem kết quả của ${r.studentName}`}
                onClick={() => onView(r)}
              >
                <Eye size={16} />
              </button>
            )
          ]
        ]}
      />
    </section>
  )
}
