import React from 'react'
import {
  ArrowRightLeft,
  CalendarPlus,
  Pause,
  Settings2,
  UserRoundX
} from 'lucide-react'
import { ActionDropdown } from '../common/ui.jsx'

export default function StudentActionsMenu({
  student,
  onSelect,
  extraItems = []
}) {
  const active = student.statusValue === 'active',
    ongoing = ['active', 'reserved'].includes(student.statusValue)
  const actions = [
    {
      key: 'transfer',
      label: 'Chuyển lớp',
      icon: ArrowRightLeft,
      disabled:
        !active || !student.enrollments?.some((e) => e.status === 'active')
    },
    { key: 'reserve', label: 'Bảo lưu', icon: Pause, disabled: !active },
    {
      key: 'extend',
      label: 'Gia hạn',
      icon: CalendarPlus,
      disabled: !ongoing || !student.enrollments?.length
    },
    {
      key: 'stop',
      label: 'Nghỉ học',
      icon: UserRoundX,
      disabled: !ongoing,
      danger: true
    }
  ].map((action) => ({
    ...action,
    onClick: () => onSelect(action.key, student)
  }))
  return (
    <ActionDropdown
      label="Nghiệp vụ"
      title={student.name}
      icon={Settings2}
      items={[...extraItems, ...actions]}
    />
  )
}
