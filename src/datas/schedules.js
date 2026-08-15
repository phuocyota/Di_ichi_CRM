import {
  courseClasses,
  courses as courseCatalog,
  rooms as courseRooms,
  students as courseStudents,
  teachers as courseTeachers,
} from './courses.js'

const indexById = (items) => Object.fromEntries(items.map((item) => [item.id, item]))

const courseMap = indexById(courseCatalog)
const teacherMap = indexById(courseTeachers)
const roomMap = indexById(courseRooms)
const studentMap = indexById(courseStudents)

const branchByRoomId = {
  'room-201': 'Cơ sở 1',
  'room-202': 'Cơ sở 2',
  'room-301': 'Cơ sở 1',
  'room-lab-a': 'Cơ sở 3',
}

const equipmentByRoomId = {
  'room-201': 'TV, bảng tương tác',
  'room-202': 'Máy chiếu',
  'room-301': 'TV, loa',
  'room-lab-a': 'Máy tính, tai nghe',
}

export const scheduleStatistics = [
  { label: 'Lớp hôm nay', value: 8, tone: 'blue' },
  { label: 'Đã điểm danh', value: 5, tone: 'emerald' },
  { label: 'Sắp diễn ra', value: 12, tone: 'amber' },
  { label: 'Lịch bị trùng', value: 2, tone: 'red' },
]

export const scheduleStatuses = [
  { value: 'active', label: 'Đang học', color: '#2563eb', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  { value: 'upcoming', label: 'Sắp diễn ra', color: '#f59e0b', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  { value: 'checked', label: 'Đã điểm danh', color: '#10b981', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { value: 'conflict', label: 'Bị trùng', color: '#ef4444', className: 'border-red-200 bg-red-50 text-red-700' },
  { value: 'cancelled', label: 'Đã hủy', color: '#64748b', className: 'border-slate-200 bg-slate-100 text-slate-700' },
  { value: 'makeup', label: 'Học bù', color: '#8b5cf6', className: 'border-violet-200 bg-violet-50 text-violet-700' },
]

export const teachers = courseTeachers.map((item) => ({
  ...item,
  shortName: item.name.split(' ').at(-1),
  status: 'available',
  branch: 'Cơ sở 1',
}))

export const classrooms = courseRooms.map((item) => ({
  ...item,
  branch: branchByRoomId[item.id] || 'Cơ sở 1',
  capacity: item.id.includes('lab') ? 18 : 24,
  equipment: equipmentByRoomId[item.id] || 'TV, bảng trắng',
}))

export const classes = courseClasses.map((item) => {
  const course = courseMap[item.courseId]
  const teacher = teacherMap[item.teacherId]
  const room = roomMap[item.roomId]

  return {
    ...item,
    course: course?.name || '',
    sessions: course?.sessions || 1,
    teacher: teacher?.name || '',
    room: room?.name || '',
    branch: branchByRoomId[item.roomId] || 'Cơ sở 1',
  }
})

const makeScheduleStudents = (classItem, checked = 0) => {
  return classItem.studentIds.map((studentId, index) => {
    const student = studentMap[studentId]
    const words = String(student?.name || '').split(' ')
    const avatar = words.slice(-2).map((word) => word[0]).join('').toUpperCase()

    return {
      id: student?.code || studentId,
      studentId,
      name: student?.name || studentId,
      avatar,
      status: index < checked ? 'Có mặt' : 'Chưa điểm danh',
    }
  })
}

const buildSchedule = ({ id, classId, start, end, status, checked = 0, lessonNote, teacherNote }) => {
  const classItem = classes.find((item) => item.id === classId)
  const attendanceChecked = Math.min(checked, classItem?.studentIds.length || 0)
  const pending = Math.max((classItem?.studentIds.length || 0) - attendanceChecked, 0)

  return {
    id,
    classId: classItem.id,
    classCode: classItem.code,
    className: classItem.name,
    courseId: classItem.courseId,
    course: classItem.course,
    teacherId: classItem.teacherId,
    teacher: classItem.teacher,
    roomId: classItem.roomId,
    room: classItem.room,
    branch: classItem.branch,
    start,
    end,
    status,
    attendance: { checked: attendanceChecked, pending, excused: 0, absent: 0 },
    students: makeScheduleStudents(classItem, attendanceChecked),
    homework: [],
    lessonNote,
    teacherNote,
  }
}

export const schedules = [
  buildSchedule({
    id: 'SCH001',
    classId: 'class-ielts-fd-01',
    start: '2026-08-13T18:00:00',
    end: '2026-08-13T20:00:00',
    status: 'active',
    checked: 1,
    lessonNote: 'Listening Foundation và chữa lỗi phát âm cuối.',
    teacherNote: 'Theo dõi thêm phần Speaking của Gia Bảo.',
  }),
  buildSchedule({
    id: 'SCH002',
    classId: 'class-ielts-fd-02',
    start: '2026-08-14T19:00:00',
    end: '2026-08-14T21:00:00',
    status: 'upcoming',
    lessonNote: 'Grammar review và mini test đầu vào.',
    teacherNote: 'Chuẩn bị đề kiểm tra 20 phút.',
  }),
  buildSchedule({
    id: 'SCH003',
    classId: 'class-toeic-500-01',
    start: '2026-08-15T19:30:00',
    end: '2026-08-15T21:00:00',
    status: 'upcoming',
    lessonNote: 'TOEIC Listening Part 3, Part 4.',
    teacherNote: 'Chuẩn bị audio warm-up.',
  }),
  buildSchedule({
    id: 'SCH004',
    classId: 'class-kids-starter-01',
    start: '2026-08-16T08:00:00',
    end: '2026-08-16T10:00:00',
    status: 'checked',
    checked: 2,
    lessonNote: 'Phonics và hoạt động phản xạ từ vựng.',
    teacherNote: 'Gửi nhận xét ngắn cho phụ huynh sau buổi học.',
  }),
]

export const todaySchedules = schedules.filter((schedule) => schedule.start.startsWith('2026-08-13'))

export const upcomingSchedules = schedules.filter((schedule) => schedule.start > '2026-08-13T23:59:59')

export const conflictSchedules = schedules.filter((schedule) => schedule.status === 'conflict')

export const teacherLeaves = [
  { id: 'LV001', teacher: 'Trần Thị B', teacherId: 'teacher-002', time: '14/08/2026 16:00 - 20:00', reason: 'Nghỉ phép cá nhân' },
  { id: 'LV002', teacher: 'Nguyễn Văn A', teacherId: 'teacher-001', time: '17/08/2026 buổi sáng', reason: 'Đào tạo nội bộ' },
]

export const scheduleFilters = {
  branches: [...new Set(classrooms.map((item) => item.branch))],
  courses: courseCatalog.map((item) => item.name),
  classes: classes.map((item) => item.name),
  teachers: teachers.map((item) => item.name),
  rooms: classrooms.map((item) => item.name),
  statuses: scheduleStatuses,
  ranges: ['Hôm nay', '7 ngày tới', 'Tháng này', 'Tùy chỉnh'],
}

export const scheduleModalConfigs = {
  create: { title: 'Tạo lịch học', submitText: 'Tạo lịch học', intent: 'form' },
  edit: { title: 'Chỉnh sửa lịch học', submitText: 'Cập nhật', intent: 'form' },
  changeTime: { title: 'Đổi giờ học', submitText: 'Đổi giờ', intent: 'time' },
  changeRoom: { title: 'Đổi phòng học', submitText: 'Đổi phòng', intent: 'room' },
  changeTeacher: { title: 'Đổi giáo viên', submitText: 'Đổi giáo viên', intent: 'teacher' },
  cancel: { title: 'Hủy buổi học', submitText: 'Hủy buổi học', intent: 'danger' },
  makeup: { title: 'Tạo buổi học bù', submitText: 'Tạo học bù', intent: 'form' },
  confirm: { title: 'Xác nhận thay đổi lịch', submitText: 'Xác nhận', intent: 'confirm' },
  delete: { title: 'Xóa lịch học', submitText: 'Xóa lịch học', intent: 'danger' },
  duplicate: { title: 'Sao chép lịch học', submitText: 'Sao chép', intent: 'confirm' },
  recurring: { title: 'Lặp lịch theo tuần', submitText: 'Tạo lịch lặp', intent: 'recurring' },
  homework: { title: 'Giao Homework', submitText: 'Giao bài', intent: 'homework' },
  notify: { title: 'Gửi thông báo cho lớp', submitText: 'Gửi thông báo', intent: 'notify' },
  attendance: { title: 'Bắt đầu điểm danh', submitText: 'Mở điểm danh', intent: 'confirm' },
  export: { title: 'Export lịch học', submitText: 'Export', intent: 'export' },
}
