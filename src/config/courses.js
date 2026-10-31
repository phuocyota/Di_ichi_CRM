export const courseTabs = [
  { key: 'courses', label: 'Khóa học' },
  { key: 'classes', label: 'Lớp học' },
  { key: 'results', label: 'Kết quả học tập' }
]

export const courseStatuses = [
  {
    value: 'recruiting',
    label: 'Đang tuyển sinh',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    value: 'paused',
    label: 'Tạm dừng',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    value: 'finished',
    label: 'Kết thúc',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  }
]

export const classStatuses = [
  {
    value: 'upcoming',
    label: 'Sắp khai giảng',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    value: 'active',
    label: 'Đang học',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    value: 'full',
    label: 'Đã đủ sĩ số',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  {
    value: 'finished',
    label: 'Kết thúc',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  }
]
