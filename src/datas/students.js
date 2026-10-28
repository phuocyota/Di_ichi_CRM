import { PauseCircle, UserCheck, UserRoundX, Users, GraduationCap } from 'lucide-react'

export const studentStatus = [
  { label: 'Đang học', value: 'active', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Bảo lưu', value: 'reserved', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Nghỉ học', value: 'stopped', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'Học thử', value: 'trial', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Tiềm năng', value: 'potential', badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
]

// Presentation only. All values are supplied by the API.
export const studentStatistics = [
  { field: 'totalStudents', label: 'Tổng học viên', description: 'Toàn bộ hồ sơ học viên', icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { field: 'activeStudents', label: 'Đang học', description: 'Học viên đang theo lớp', icon: UserCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { field: 'reservedStudents', label: 'Bảo lưu', description: 'Hồ sơ đang tạm dừng', icon: PauseCircle, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { field: 'stoppedStudents', label: 'Nghỉ học', description: 'Học viên đã ngừng học', icon: UserRoundX, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { field: 'trialStudents', label: 'Học thử', description: 'Học viên có trạng thái học thử', icon: GraduationCap, color: 'bg-violet-50 text-violet-700 border-violet-200' },
]

export const studentFilters = { courses: [], classes: [], teachers: [], branches: [], statuses: studentStatus }
export const profileTabs = ['Thông tin', 'Phụ huynh', 'Khóa học', 'Điểm danh', 'Điểm số', 'Homework', 'Học phí', 'Lịch sử', 'Chứng chỉ']
export const modalConfigs = {
  add: { title: 'Thêm học viên', submitText: 'Lưu học viên' },
  edit: { title: 'Cập nhật học viên', submitText: 'Cập nhật' },
  transfer: { title: 'Chuyển lớp', submitText: 'Xác nhận chuyển lớp' },
  reserve: { title: 'Bảo lưu', submitText: 'Xác nhận bảo lưu' },
  stop: { title: 'Nghỉ học', submitText: 'Xác nhận nghỉ học' },
  extend: { title: 'Gia hạn khóa học', submitText: 'Gia hạn' },
  import: { title: 'Import Excel', submitText: 'Tải lên' },
  delete: { title: 'Xác nhận xóa', submitText: 'Xóa học viên' },
}
