import React from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { WorkspaceTable } from '../common/WorkspaceView.jsx'
import { ActionDropdown, StatusBadge } from '../common/ui.jsx'
export default function CourseTable({
  courses,
  statusMap: _statusMap = null,
  onView,
  onEdit,
  onDelete,
  onAddClass
}) {
  const money = (value) =>
    value == null || !Number.isFinite(Number(value))
      ? 'Chưa cập nhật'
      : new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(value)
  return (
    <section className="space-y-4">
      <h2 className="ui-section-title">Danh mục khóa học</h2>
      <WorkspaceTable
        rows={courses}
        columns={[
          [
            'name',
            'Khóa học',
            (r) => (
              <div>
                <button
                  type="button"
                  className="ui-identity-name hover:underline"
                  onClick={() => onView(r)}
                >
                  {r.name}
                </button>
                <span className="ui-identity-code">{r.code}</span>
              </div>
            )
          ],
          ['level', 'Cấp độ'],
          [
            'tuition',
            'Học phí',
            (r) => (
              <span className="font-semibold tabular-nums">
                {money(r.tuition)}
              </span>
            )
          ],
          [
            'status',
            'Trạng thái',
            (r) => <StatusBadge value={r.status} context="course" />
          ],
          [
            'actions',
            'Thao tác',
            (r) => (
              <ActionDropdown
                compact
                label={`Thao tác khóa học ${r.name}`}
                items={[
                  {
                    label: 'Xem khóa học',
                    icon: Eye,
                    onClick: () => onView(r)
                  },
                  {
                    label: 'Thêm lớp học',
                    icon: Plus,
                    onClick: () => onAddClass(r)
                  },
                  {
                    label: 'Cập nhật khóa học',
                    icon: Pencil,
                    onClick: () => onEdit(r)
                  },
                  {
                    label: 'Xóa khóa học',
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
