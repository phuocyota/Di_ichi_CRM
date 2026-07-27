import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  DoorOpen,
  FileDown,
  FileSpreadsheet,
  GitMerge,
  GraduationCap,
  PlayCircle,
  Printer,
  RefreshCcw,
  Trash2,
  UserPlus,
  MoveRight,
  XCircle,
} from 'lucide-react'

export const classStatus = [
  { label: 'Đang học', value: 'active', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Sắp khai giảng', value: 'upcoming', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Đã kết thúc', value: 'finished', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  { label: 'Tạm dừng', value: 'paused', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
]

export const classStatistics = [
  { label: 'Tổng lớp học', value: '124', description: 'Toàn bộ lớp trong hệ thống', icon: BookOpen, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Đang học', value: '86', description: 'Lớp đang vận hành', icon: PlayCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Sắp khai giảng', value: '18', description: 'Lớp mở trong 14 ngày tới', icon: CalendarCheck, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Đã kết thúc', value: '20', description: 'Lớp đã hoàn tất chương trình', icon: CheckCircle2, color: 'bg-violet-50 text-violet-700 border-violet-200' },
]

export const classCharts = {
  monthly: [
    { month: 'T1', classes: 12 },
    { month: 'T2', classes: 15 },
    { month: 'T3', classes: 18 },
    { month: 'T4', classes: 22 },
    { month: 'T5', classes: 19 },
    { month: 'T6', classes: 26 },
    { month: 'T7', classes: 24 },
    { month: 'T8', classes: 31 },
  ],
  status: [
    { name: 'Đang học', value: 69, fill: '#10b981' },
    { name: 'Sắp khai giảng', value: 15, fill: '#2563eb' },
    { name: 'Đã kết thúc', value: 16, fill: '#8b5cf6' },
  ],
}

export const classFilters = {
  courses: ['IELTS Foundation', 'Kids Starter', 'Communication', 'Teen Grammar', 'IELTS Intensive'],
  teachers: ['Nguyễn Hoàng Long', 'Trần Thị Mai', 'Lê Quốc Huy', 'Phạm Minh Châu'],
  rooms: ['P.201', 'P.202', 'P.301', 'Lab A', 'Lab B'],
  branches: ['Cơ sở 1', 'Cơ sở 2', 'Cơ sở 3'],
  statuses: classStatus,
}

export const classes = [
  { id: 'CLS001', code: 'CLS001', name: 'IELTS Foundation A12', course: 'IELTS Foundation', teacher: 'Nguyễn Hoàng Long', room: 'P.201', branch: 'Cơ sở 1', currentSize: 18, maxSize: 22, schedule: 'T2-T4 18:00', startDate: '01/08/2026', endDate: '30/10/2026', status: 'Đang học', statusValue: 'active' },
  { id: 'CLS002', code: 'CLS002', name: 'Kids Starter K08', course: 'Kids Starter', teacher: 'Trần Thị Mai', room: 'P.202', branch: 'Cơ sở 2', currentSize: 16, maxSize: 18, schedule: 'T3-T5 17:30', startDate: '05/08/2026', endDate: '05/11/2026', status: 'Sắp khai giảng', statusValue: 'upcoming' },
  { id: 'CLS003', code: 'CLS003', name: 'Communication C05', course: 'Communication', teacher: 'Lê Quốc Huy', room: 'P.301', branch: 'Cơ sở 1', currentSize: 20, maxSize: 24, schedule: 'T2-T6 19:30', startDate: '12/07/2026', endDate: '12/10/2026', status: 'Đang học', statusValue: 'active' },
  { id: 'CLS004', code: 'CLS004', name: 'IELTS Intensive I03', course: 'IELTS Intensive', teacher: 'Phạm Minh Châu', room: 'Lab A', branch: 'Cơ sở 3', currentSize: 14, maxSize: 16, schedule: 'T7-CN 08:00', startDate: '20/06/2026', endDate: '20/09/2026', status: 'Đang học', statusValue: 'active' },
  { id: 'CLS005', code: 'CLS005', name: 'Teen Grammar T11', course: 'Teen Grammar', teacher: 'Trần Thị Mai', room: 'Lab B', branch: 'Cơ sở 2', currentSize: 21, maxSize: 24, schedule: 'T3-T5 19:00', startDate: '10/05/2026', endDate: '10/08/2026', status: 'Đã kết thúc', statusValue: 'finished' },
  { id: 'CLS006', code: 'CLS006', name: 'Kids Starter K09', course: 'Kids Starter', teacher: 'Nguyễn Hoàng Long', room: 'P.201', branch: 'Cơ sở 1', currentSize: 12, maxSize: 18, schedule: 'T2-T4 17:30', startDate: '15/08/2026', endDate: '15/11/2026', status: 'Sắp khai giảng', statusValue: 'upcoming' },
]

export const classStudents = [
  { id: 'HV001248', name: 'Nguyễn Minh Anh', status: 'Đang học', attendance: '96%', score: '8.1' },
  { id: 'HV001247', name: 'Trần Gia Bảo', status: 'Học thử', attendance: '100%', score: 'Khởi động' },
  { id: 'HV001246', name: 'Lê Hoàng Nam', status: 'Bảo lưu', attendance: '88%', score: '7.4' },
  { id: 'HV001245', name: 'Phạm Thảo Vy', status: 'Đang học', attendance: '94%', score: '8.4' },
]

export const classSchedules = [
  { date: '29/07/2026', time: '18:00 - 20:00', lesson: 'Listening Practice', room: 'P.201', teacher: 'Nguyễn Hoàng Long' },
  { date: '31/07/2026', time: '18:00 - 20:00', lesson: 'Speaking Workshop', room: 'P.201', teacher: 'Nguyễn Hoàng Long' },
  { date: '03/08/2026', time: '18:00 - 20:00', lesson: 'Mock Test', room: 'Lab A', teacher: 'Nguyễn Hoàng Long' },
]

export const classAttendanceSessions = [
  {
    id: 'attendance-01',
    title: 'Buổi 1',
    date: '29/07/2026',
    lesson: 'Listening Practice',
    students: [
      { id: 'HV001248', name: 'Nguyễn Minh Anh', status: 'Có mặt', note: 'Đúng giờ' },
      { id: 'HV001247', name: 'Trần Gia Bảo', status: 'Vắng', note: 'Phụ huynh xin nghỉ' },
      { id: 'HV001246', name: 'Lê Hoàng Nam', status: 'Có mặt', note: 'Hoàn thành bài tập' },
      { id: 'HV001245', name: 'Phạm Thảo Vy', status: 'Vắng', note: 'Chưa rõ lý do' },
    ],
  },
  {
    id: 'attendance-02',
    title: 'Buổi 2',
    date: '31/07/2026',
    lesson: 'Speaking Workshop',
    students: [
      { id: 'HV001248', name: 'Nguyễn Minh Anh', status: 'Có mặt', note: 'Tích cực phát biểu' },
      { id: 'HV001247', name: 'Trần Gia Bảo', status: 'Có mặt', note: 'Đi muộn 5 phút' },
      { id: 'HV001246', name: 'Lê Hoàng Nam', status: 'Vắng', note: 'Bảo lưu tạm thời' },
      { id: 'HV001245', name: 'Phạm Thảo Vy', status: 'Có mặt', note: 'Hoàn thành tốt' },
    ],
  },
  {
    id: 'attendance-03',
    title: 'Buổi 3',
    date: '03/08/2026',
    lesson: 'Mock Test',
    students: [
      { id: 'HV001248', name: 'Nguyễn Minh Anh', status: 'Có mặt', note: 'Làm bài đủ thời gian' },
      { id: 'HV001247', name: 'Trần Gia Bảo', status: 'Vắng', note: 'Chờ liên hệ phụ huynh' },
      { id: 'HV001246', name: 'Lê Hoàng Nam', status: 'Có mặt', note: 'Cần luyện speaking' },
      { id: 'HV001245', name: 'Phạm Thảo Vy', status: 'Có mặt', note: 'Điểm tốt' },
    ],
  },
]

export const classHomeworkItems = [
  {
    id: 'homework-01',
    title: 'Bài tập Listening Unit 3',
    deadline: '02/08/2026',
    submitted: 16,
    missing: ['Trần Gia Bảo', 'Lê Hoàng Nam'],
  },
  {
    id: 'homework-02',
    title: 'Speaking Recording',
    deadline: '05/08/2026',
    submitted: 14,
    missing: ['Nguyễn Minh Anh', 'Phạm Thảo Vy', 'Trần Gia Bảo'],
  },
]

export const classScoreItems = [
  {
    id: 'score-01',
    title: 'Placement Test',
    average: '7.8',
    highest: '8.6',
    lowest: '6.2',
    students: [
      { name: 'Nguyễn Minh Anh', score: '8.1' },
      { name: 'Trần Gia Bảo', score: '6.8' },
      { name: 'Lê Hoàng Nam', score: '7.4' },
      { name: 'Phạm Thảo Vy', score: '8.6' },
    ],
  },
  {
    id: 'score-02',
    title: 'Mock Test 01',
    average: '8.0',
    highest: '8.8',
    lowest: '6.9',
    students: [
      { name: 'Nguyễn Minh Anh', score: '8.4' },
      { name: 'Trần Gia Bảo', score: '6.9' },
      { name: 'Lê Hoàng Nam', score: '7.9' },
      { name: 'Phạm Thảo Vy', score: '8.8' },
    ],
  },
]

export const classNotificationItems = [
  {
    id: 'notice-01',
    title: 'Nhắc lịch Mock Test',
    sentAt: '27/07/2026 09:00',
    audience: 'Toàn bộ học viên và phụ huynh',
    status: 'Đã gửi',
  },
  {
    id: 'notice-02',
    title: 'Thông báo đổi phòng học',
    sentAt: '28/07/2026 15:30',
    audience: 'Học viên lớp IELTS Foundation A12',
    status: 'Chờ xác nhận',
  },
]

export const classDocumentItems = [
  {
    id: 'lesson-doc-01',
    title: 'Buổi 1 - Listening Practice',
    updatedAt: '29/07/2026',
    documents: [
      {
        id: 'document-01',
        title: 'Tài liệu thực hành vẽ trên Paint',
        type: 'Word',
        fileName: 'CDS_K1_TH11_T1 THỰC HÀNH VẼ TRÊN PAINT (TIẾT 2).docx',
        updatedAt: '26/07/2026',
        owner: 'Nguyễn Hoàng Long',
        url: '/files/paint-practice.docx',
      },
      {
        id: 'document-02',
        title: 'Bản PDF thực hành vẽ trên Paint',
        type: 'PDF',
        fileName: 'CDS_K1_TH11_T1 THỰC HÀNH VẼ TRÊN PAINT (TIẾT 2).pdf',
        updatedAt: '26/07/2026',
        owner: 'Phòng đào tạo',
        url: '/files/paint-practice.pdf',
      },
    ],
  },
  {
    id: 'lesson-doc-02',
    title: 'Buổi 2 - Speaking Workshop',
    updatedAt: '31/07/2026',
    documents: [
      {
        id: 'document-03',
        title: 'Falling Apples',
        type: 'PPT',
        fileName: 'Falling Apples.pptx',
        updatedAt: '27/07/2026',
        owner: 'Nguyễn Hoàng Long',
        url: '/files/falling-apples.pptx',
      },
    ],
  },
]

export const classDetailTabs = ['Thông tin lớp', 'Danh sách học viên', 'Lịch học', 'Điểm danh', 'Homework', 'Điểm số', 'Thông báo', 'Tài liệu']

export const classActions = [
  { label: 'Tạo lớp', type: 'create', icon: BookOpen },
  { label: 'Cập nhật lớp', type: 'edit', icon: RefreshCcw },
  { label: 'Xóa lớp', type: 'delete', icon: Trash2 },
  { label: 'Ghép lớp', type: 'merge', icon: GitMerge },
  { label: 'Chuyển lớp', type: 'transfer', icon: MoveRight },
  { label: 'Phân công giáo viên', type: 'assignTeacher', icon: GraduationCap },
  { label: 'Đổi phòng học', type: 'changeRoom', icon: DoorOpen },
  { label: 'Thêm học viên', type: 'addStudent', icon: UserPlus },
  { label: 'Khai giảng lớp', type: 'startClass', icon: PlayCircle },
  { label: 'Kết thúc lớp', type: 'finishClass', icon: XCircle },
  { label: 'Export Excel', type: 'exportExcel', icon: FileSpreadsheet },
  { label: 'Export PDF', type: 'exportPdf', icon: FileDown },
  { label: 'In danh sách lớp', type: 'printList', icon: Printer },
]

export const classModalConfigs = {
  create: { title: 'Tạo lớp', submitText: 'Tạo lớp' },
  edit: { title: 'Cập nhật lớp', submitText: 'Cập nhật' },
  merge: { title: 'Ghép lớp', submitText: 'Ghép lớp' },
  transfer: { title: 'Chuyển lớp', submitText: 'Chuyển lớp' },
  assignTeacher: { title: 'Phân công giáo viên', submitText: 'Phân công' },
  changeRoom: { title: 'Đổi phòng học', submitText: 'Đổi phòng' },
  addStudent: { title: 'Thêm học viên', submitText: 'Thêm học viên' },
  delete: { title: 'Xác nhận xóa', submitText: 'Xóa lớp' },
}
