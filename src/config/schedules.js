import { statusColor } from '../components/common/presentation.js'
export const scheduleStatistics = [
  { label: 'Lớp hôm nay', tone: 'blue' },
  { label: 'Đã điểm danh', tone: 'emerald' },
  { label: 'Sắp diễn ra', tone: 'amber' },
  { label: 'Lịch bị trùng', tone: 'red' }
]

export const scheduleStatuses = [
  {
    value: 'active',
    label: 'Đang học',
    color: statusColor('active', 'schedule'),
    className: 'border-blue-200 bg-blue-50 text-blue-700'
  },
  {
    value: 'upcoming',
    label: 'Sắp diễn ra',
    color: statusColor('upcoming', 'schedule'),
    className: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  {
    value: 'checked',
    label: 'Đã điểm danh',
    color: statusColor('checked', 'schedule'),
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  {
    value: 'conflict',
    label: 'Bị trùng',
    color: statusColor('conflict', 'schedule'),
    className: 'border-red-200 bg-red-50 text-red-700'
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    color: statusColor('cancelled', 'schedule'),
    className: 'border-slate-200 bg-slate-100 text-slate-700'
  },
  {
    value: 'makeup',
    label: 'Học bù',
    color: statusColor('makeup', 'schedule'),
    className: 'border-violet-200 bg-violet-50 text-violet-700'
  }
]

export const scheduleFilters = {
  branches: [],
  courses: [],
  classes: [],
  teachers: [],
  rooms: [],
  statuses: scheduleStatuses,
  ranges: ['Hôm nay', '7 ngày tới', 'Tháng này']
}

export const scheduleModalConfigs = {
  create: { title: 'Tạo lịch học', submitText: 'Tạo lịch học', intent: 'form' },
  edit: { title: 'Chỉnh sửa lịch học', submitText: 'Cập nhật', intent: 'form' },
  changeTime: { title: 'Đổi giờ học', submitText: 'Đổi giờ', intent: 'time' },
  changeRoom: {
    title: 'Đổi phòng học',
    submitText: 'Đổi phòng',
    intent: 'room'
  },
  changeTeacher: {
    title: 'Đổi giáo viên',
    submitText: 'Đổi giáo viên',
    intent: 'teacher'
  },
  cancel: {
    title: 'Hủy buổi học',
    submitText: 'Hủy buổi học',
    intent: 'danger'
  },
  makeup: {
    title: 'Tạo buổi học bù',
    submitText: 'Tạo học bù',
    intent: 'form'
  },
  confirm: {
    title: 'Xác nhận thay đổi lịch',
    submitText: 'Xác nhận',
    intent: 'confirm'
  },
  delete: {
    title: 'Xóa lịch học',
    submitText: 'Xóa lịch học',
    intent: 'danger'
  },
  duplicate: {
    title: 'Sao chép lịch học',
    submitText: 'Sao chép',
    intent: 'confirm'
  },
  recurring: {
    title: 'Lặp lịch theo tuần',
    submitText: 'Tạo lịch lặp',
    intent: 'recurring'
  },
  homework: {
    title: 'Giao Homework',
    submitText: 'Giao bài',
    intent: 'homework'
  },
  notify: {
    title: 'Gửi thông báo cho lớp',
    submitText: 'Gửi thông báo',
    intent: 'notify'
  },
  attendance: {
    title: 'Bắt đầu điểm danh',
    submitText: 'Mở điểm danh',
    intent: 'confirm'
  },
  export: { title: 'Export lịch học', submitText: 'Export', intent: 'export' }
}
