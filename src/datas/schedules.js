export const scheduleStatistics = [
  { label: 'Lớp hôm nay', value: 8, tone: 'blue' },
  { label: 'Đã điểm danh', value: 5, tone: 'emerald' },
  { label: 'Sắp diễn ra', value: 12, tone: 'amber' },
  { label: 'Lịch bị trùng', value: 2, tone: 'red' },
]

export const scheduleStatuses = [
  {
    value: 'active',
    label: 'Đang học',
    color: '#2563eb',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    value: 'upcoming',
    label: 'Sắp diễn ra',
    color: '#f59e0b',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    value: 'checked',
    label: 'Đã điểm danh',
    color: '#10b981',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'conflict',
    label: 'Bị trùng',
    color: '#ef4444',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    color: '#64748b',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  {
    value: 'makeup',
    label: 'Học bù',
    color: '#8b5cf6',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
  },
]

export const teachers = [
  { id: 'T001', name: 'Nguyễn Hoàng Long', shortName: 'Long', status: 'available', branch: 'Cơ sở 1' },
  { id: 'T002', name: 'Trần Thị Mai', shortName: 'Mai', status: 'leave', branch: 'Cơ sở 2' },
  { id: 'T003', name: 'Lê Quốc Huy', shortName: 'Huy', status: 'available', branch: 'Cơ sở 1' },
  { id: 'T004', name: 'Phạm Minh Châu', shortName: 'Châu', status: 'available', branch: 'Cơ sở 3' },
  { id: 'T005', name: 'Đỗ Anh Khoa', shortName: 'Khoa', status: 'available', branch: 'Cơ sở 2' },
]

export const classrooms = [
  { id: 'R201', name: 'P.201', branch: 'Cơ sở 1', capacity: 22, equipment: 'TV, bảng tương tác' },
  { id: 'R202', name: 'P.202', branch: 'Cơ sở 2', capacity: 18, equipment: 'Máy chiếu' },
  { id: 'R301', name: 'P.301', branch: 'Cơ sở 1', capacity: 24, equipment: 'TV, loa' },
  { id: 'LABA', name: 'Lab A', branch: 'Cơ sở 3', capacity: 16, equipment: 'Máy tính, tai nghe' },
  { id: 'LABB', name: 'Lab B', branch: 'Cơ sở 2', capacity: 24, equipment: 'Máy tính, bảng thông minh' },
]

export const classes = [
  { id: 'CLS001', code: 'CLS001', name: 'IELTS Foundation A12', course: 'IELTS Foundation', teacher: 'Nguyễn Hoàng Long', room: 'P.201', branch: 'Cơ sở 1' },
  { id: 'CLS002', code: 'CLS002', name: 'Kids Starter K08', course: 'Kids Starter', teacher: 'Trần Thị Mai', room: 'P.202', branch: 'Cơ sở 2' },
  { id: 'CLS003', code: 'CLS003', name: 'Communication C05', course: 'Communication', teacher: 'Lê Quốc Huy', room: 'P.301', branch: 'Cơ sở 1' },
  { id: 'CLS004', code: 'CLS004', name: 'IELTS Intensive I03', course: 'IELTS Intensive', teacher: 'Phạm Minh Châu', room: 'Lab A', branch: 'Cơ sở 3' },
  { id: 'CLS005', code: 'CLS005', name: 'Teen Grammar T11', course: 'Teen Grammar', teacher: 'Đỗ Anh Khoa', room: 'Lab B', branch: 'Cơ sở 2' },
]

export const schedules = [
  {
    id: 'SCH001',
    classId: 'CLS001',
    classCode: 'CLS001',
    className: 'IELTS Foundation A12',
    course: 'IELTS Foundation',
    teacher: 'Nguyễn Hoàng Long',
    room: 'P.201',
    branch: 'Cơ sở 1',
    start: '2026-07-28T18:00:00',
    end: '2026-07-28T20:00:00',
    status: 'active',
    attendance: { checked: 16, pending: 2, excused: 1, absent: 1 },
    students: [
      { id: 'HV001248', name: 'Nguyễn Minh Anh', avatar: 'MA', status: 'Có mặt' },
      { id: 'HV001247', name: 'Trần Gia Bảo', avatar: 'GB', status: 'Chưa điểm danh' },
      { id: 'HV001246', name: 'Lê Hoàng Nam', avatar: 'HN', status: 'Nghỉ phép' },
      { id: 'HV001245', name: 'Phạm Thảo Vy', avatar: 'TV', status: 'Có mặt' },
    ],
    homework: [
      { id: 'HW001', title: 'Listening Unit 3', deadline: '2026-08-02', status: 'Đã giao' },
      { id: 'HW002', title: 'Speaking Recording', deadline: '2026-08-05', status: 'Nháp' },
    ],
    lessonNote: 'Luyện nghe dạng multiple choice, sửa lỗi phát âm cuối.',
    teacherNote: 'Gia Bảo cần được nhắc nộp recording trước buổi sau.',
  },
  {
    id: 'SCH002',
    classId: 'CLS002',
    classCode: 'CLS002',
    className: 'Kids Starter K08',
    course: 'Kids Starter',
    teacher: 'Trần Thị Mai',
    room: 'P.202',
    branch: 'Cơ sở 2',
    start: '2026-07-28T17:30:00',
    end: '2026-07-28T19:00:00',
    status: 'conflict',
    attendance: { checked: 0, pending: 16, excused: 0, absent: 0 },
    students: [
      { id: 'HV001260', name: 'Đặng Bảo An', avatar: 'BA', status: 'Chưa điểm danh' },
      { id: 'HV001261', name: 'Lâm Minh Khôi', avatar: 'MK', status: 'Chưa điểm danh' },
      { id: 'HV001262', name: 'Vũ Hà Linh', avatar: 'HL', status: 'Chưa điểm danh' },
    ],
    homework: [{ id: 'HW003', title: 'Phonics worksheet', deadline: '2026-07-31', status: 'Đã giao' }],
    lessonNote: 'Ôn bảng chữ cái và màu sắc.',
    teacherNote: 'Trùng ca nghỉ của giáo viên Mai, cần phân công thay thế.',
  },
  {
    id: 'SCH003',
    classId: 'CLS003',
    classCode: 'CLS003',
    className: 'Communication C05',
    course: 'Communication',
    teacher: 'Lê Quốc Huy',
    room: 'P.301',
    branch: 'Cơ sở 1',
    start: '2026-07-29T19:30:00',
    end: '2026-07-29T21:00:00',
    status: 'upcoming',
    attendance: { checked: 0, pending: 20, excused: 0, absent: 0 },
    students: [
      { id: 'HV001270', name: 'Hoàng Ngọc Hà', avatar: 'NH', status: 'Chưa điểm danh' },
      { id: 'HV001271', name: 'Bùi Quốc Việt', avatar: 'QV', status: 'Chưa điểm danh' },
      { id: 'HV001272', name: 'Phan Nhật Minh', avatar: 'NM', status: 'Chưa điểm danh' },
    ],
    homework: [{ id: 'HW004', title: 'Role-play preparation', deadline: '2026-08-01', status: 'Chờ giao' }],
    lessonNote: 'Role-play chủ đề đặt phòng khách sạn.',
    teacherNote: 'Chuẩn bị audio warm-up.',
  },
  {
    id: 'SCH004',
    classId: 'CLS004',
    classCode: 'CLS004',
    className: 'IELTS Intensive I03',
    course: 'IELTS Intensive',
    teacher: 'Phạm Minh Châu',
    room: 'Lab A',
    branch: 'Cơ sở 3',
    start: '2026-07-30T08:00:00',
    end: '2026-07-30T11:00:00',
    status: 'checked',
    attendance: { checked: 13, pending: 0, excused: 1, absent: 0 },
    students: [
      { id: 'HV001280', name: 'Lê Gia Hân', avatar: 'GH', status: 'Có mặt' },
      { id: 'HV001281', name: 'Ngô Đức Anh', avatar: 'DA', status: 'Có mặt' },
      { id: 'HV001282', name: 'Trịnh Mai Chi', avatar: 'MC', status: 'Nghỉ phép' },
    ],
    homework: [{ id: 'HW005', title: 'Writing Task 2 outline', deadline: '2026-08-03', status: 'Đã giao' }],
    lessonNote: 'Mock Speaking Part 2 và chữa writing outline.',
    teacherNote: 'Hân có tiến bộ tốt ở coherence.',
  },
  {
    id: 'SCH005',
    classId: 'CLS005',
    classCode: 'CLS005',
    className: 'Teen Grammar T11',
    course: 'Teen Grammar',
    teacher: 'Đỗ Anh Khoa',
    room: 'Lab B',
    branch: 'Cơ sở 2',
    start: '2026-08-01T19:00:00',
    end: '2026-08-01T20:30:00',
    status: 'makeup',
    attendance: { checked: 0, pending: 21, excused: 0, absent: 0 },
    students: [
      { id: 'HV001290', name: 'Mai Tuấn Kiệt', avatar: 'TK', status: 'Chưa điểm danh' },
      { id: 'HV001291', name: 'Chu Bảo Ngọc', avatar: 'BN', status: 'Chưa điểm danh' },
      { id: 'HV001292', name: 'Đinh Quang Huy', avatar: 'QH', status: 'Chưa điểm danh' },
    ],
    homework: [{ id: 'HW006', title: 'Past perfect practice', deadline: '2026-08-04', status: 'Đã giao' }],
    lessonNote: 'Buổi học bù phần past perfect.',
    teacherNote: 'Gửi thông báo cho phụ huynh trước 24 giờ.',
  },
  {
    id: 'SCH006',
    classId: 'CLS001',
    classCode: 'CLS001',
    className: 'IELTS Foundation A12',
    course: 'IELTS Foundation',
    teacher: 'Nguyễn Hoàng Long',
    room: 'P.201',
    branch: 'Cơ sở 1',
    start: '2026-08-03T18:00:00',
    end: '2026-08-03T20:00:00',
    status: 'upcoming',
    attendance: { checked: 0, pending: 18, excused: 0, absent: 0 },
    students: [
      { id: 'HV001248', name: 'Nguyễn Minh Anh', avatar: 'MA', status: 'Chưa điểm danh' },
      { id: 'HV001247', name: 'Trần Gia Bảo', avatar: 'GB', status: 'Chưa điểm danh' },
      { id: 'HV001246', name: 'Lê Hoàng Nam', avatar: 'HN', status: 'Chưa điểm danh' },
    ],
    homework: [{ id: 'HW007', title: 'Reading Passage 1', deadline: '2026-08-06', status: 'Chờ giao' }],
    lessonNote: 'Reading skimming and scanning.',
    teacherNote: 'Chuẩn bị mini test 20 phút.',
  },
]

export const todaySchedules = schedules.filter((schedule) => schedule.start.startsWith('2026-07-28'))

export const upcomingSchedules = schedules.filter((schedule) => schedule.start > '2026-07-28T23:59:59')

export const conflictSchedules = schedules.filter((schedule) => schedule.status === 'conflict')

export const teacherLeaves = [
  { id: 'LV001', teacher: 'Trần Thị Mai', time: '28/07/2026 16:00 - 20:00', reason: 'Nghỉ phép cá nhân' },
  { id: 'LV002', teacher: 'Nguyễn Hoàng Long', time: '02/08/2026 buổi sáng', reason: 'Đào tạo nội bộ' },
]

export const scheduleFilters = {
  branches: ['Cơ sở 1', 'Cơ sở 2', 'Cơ sở 3'],
  courses: ['IELTS Foundation', 'Kids Starter', 'Communication', 'Teen Grammar', 'IELTS Intensive'],
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
