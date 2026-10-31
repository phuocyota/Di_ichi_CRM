import React from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { WorkspaceTable } from '../common/WorkspaceView.jsx'
import { ActionDropdown, StatusBadge } from '../common/ui.jsx'
const date = (value) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—'
export default function CourseClassTable({
  classes,
  statusMap: _statusMap = null,
  courseMap,
  teacherMap,
  roomMap,
  onView,
  onEdit,
  onDelete
}) {
  const rows = classes.map((r) => ({
    ...r,
    courseName: courseMap[r.courseId]?.name || '—',
    teachers:
      r.teacherIds?.map((id) => teacherMap[id]?.name || id).join(', ') || '—',
    rooms: r.roomIds?.map((id) => roomMap[id]?.name || id).join(', ') || '—'
  }))
  return (
    <section className="space-y-4">
      <h2 className="ui-section-title">Danh sách lớp học</h2>
      <WorkspaceTable
        rows={rows}
        columns={[
          [
            'name',
            'Lớp học',
            (r) => (
              <div>
                <button
                  type="button"
                  className="ui-identity-name hover:underline"
                  onClick={() => onView(r)}
                >
                  {r.name}
                </button>
                <span className="ui-identity-code">
                  {r.code} · {r.courseName}
                </span>
              </div>
            )
          ],
          ['teachers', 'Giáo viên'],
          ['rooms', 'Phòng học'],
          [
            'startDate',
            'Thời gian',
            (r) => (
              <div>
                {date(r.startDate)}
                <span className="ui-identity-code">Đến {date(r.endDate)}</span>
              </div>
            )
          ],
          ['schedule', 'Lịch học'],
          [
            'currentStudents',
            'Sĩ số',
            (r) => (
              <span className="tabular-nums">
                {r.currentStudents}/{r.maxStudents}
              </span>
            )
          ],
          [
            'status',
            'Trạng thái',
            (r) => <StatusBadge value={r.status} context="class" />
          ],
          [
            'actions',
            'Thao tác',
            (r) => (
              <ActionDropdown
                compact
                label={`Thao tác lớp ${r.name}`}
                items={[
                  { label: 'Xem lớp học', icon: Eye, onClick: () => onView(r) },
                  {
                    label: 'Cập nhật lớp học',
                    icon: Pencil,
                    onClick: () => onEdit(r)
                  },
                  {
                    label: 'Xóa lớp học',
                    icon: Trash2,
                    danger: true,
                    onClick: () => onDelete(r)
                  }
                ]}
              />
            )
          ]
        ]}
      />
    </section>
  )
}
