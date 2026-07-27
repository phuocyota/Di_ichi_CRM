import {
  AlarmClock,
  Bell,
  BookCheck,
  BookOpen,
  Cake,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  GraduationCap,
  Percent,
  ReceiptText,
  School,
  UserPlus,
  Users,
} from 'lucide-react'

export const dashboardStats = [
  {
    label: 'Học viên đang học',
    value: '1,248',
    trend: '+12,4% trong tháng này',
    icon: GraduationCap,
    color: 'blue',
  },
  {
    label: 'Học viên mới tháng này',
    value: '186',
    trend: '+24 học viên mới',
    icon: UserPlus,
    color: 'emerald',
  },
  {
    label: 'Lớp đang hoạt động',
    value: '86',
    trend: '+8 khóa mới',
    icon: CalendarDays,
    color: 'amber',
  },
  {
    label: 'Giáo viên',
    value: '54',
    trend: '92% hiệu suất giảng dạy',
    icon: Users,
    color: 'rose',
  },
  {
    label: 'Doanh thu tháng',
    value: '2,06 tỷ',
    trend: '+9,2% so với tháng trước',
    icon: ReceiptText,
    color: 'violet',
  },
  {
    label: 'Công nợ học phí',
    value: '318 triệu',
    trend: '42 hồ sơ cần nhắc',
    icon: CircleDollarSign,
    color: 'orange',
  },
  {
    label: 'Tỷ lệ chuyên cần',
    value: '94%',
    trend: '+3% so với tuần trước',
    icon: Percent,
    color: 'cyan',
  },
  {
    label: 'Bài tập chưa chấm',
    value: '128',
    trend: '18 bài ưu tiên',
    icon: ClipboardCheck,
    color: 'slate',
  },
]

export const dashboardSummary = {
  todayClasses: 18,
  conversionRate: '34%',
}

export const revenuePeriods = ['Theo ngày', 'Theo tuần', 'Theo tháng', 'Theo năm']

export const revenueData = [
  { label: 'T2', revenue: 168 },
  { label: 'T3', revenue: 182 },
  { label: 'T4', revenue: 176 },
  { label: 'T5', revenue: 214 },
  { label: 'T6', revenue: 238 },
  { label: 'T7', revenue: 251 },
  { label: 'CN', revenue: 226 },
]

export const admissionFunnel = [
  { name: 'Lead', value: 620, fill: '#ef4444' },
  { name: 'Đăng ký học thử', value: 360, fill: '#f97316' },
  { name: 'Chuyển đổi thành học viên', value: 186, fill: '#2563eb' },
]

export const studentCharts = {
  levels: [
    { name: 'Starter', value: 28, fill: '#2563eb' },
    { name: 'Foundation', value: 34, fill: '#10b981' },
    { name: 'IELTS', value: 24, fill: '#f59e0b' },
    { name: 'Advanced', value: 14, fill: '#ef4444' },
  ],
  ages: [
    { name: '6-10 tuổi', value: 32, fill: '#8b5cf6' },
    { name: '11-15 tuổi', value: 38, fill: '#06b6d4' },
    { name: '16-22 tuổi', value: 21, fill: '#f97316' },
    { name: 'Người đi làm', value: 9, fill: '#64748b' },
  ],
  branches: [
    { name: 'Cơ sở 1', value: 42, fill: '#ef4444' },
    { name: 'Cơ sở 2', value: 33, fill: '#2563eb' },
    { name: 'Cơ sở 3', value: 25, fill: '#10b981' },
  ],
}

export const classStatus = [
  {
    label: 'Sắp khai giảng',
    value: 12,
    description: 'Lớp mở trong 7 ngày tới',
    icon: School,
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    label: 'Đang học',
    value: 86,
    description: 'Lớp đang vận hành',
    icon: BookOpen,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    label: 'Sắp kết thúc',
    value: 9,
    description: 'Lớp kết thúc trong tháng',
    icon: BookCheck,
    color: 'bg-amber-50 text-amber-700 border-amber-100',
  },
]

export const todayWidgets = [
  {
    label: 'Học viên sinh nhật',
    value: 7,
    note: 'Gửi lời chúc và ưu đãi chăm sóc',
    icon: Cake,
    color: 'bg-rose-50 text-rose-700',
  },
  {
    label: 'Lớp bắt đầu sau 30 phút',
    value: 4,
    note: 'Kiểm tra phòng học và giáo viên',
    icon: AlarmClock,
    color: 'bg-orange-50 text-orange-700',
  },
  {
    label: 'Bài tập cần chấm',
    value: 128,
    note: 'Ưu tiên lớp sắp trả kết quả',
    icon: ClipboardCheck,
    color: 'bg-violet-50 text-violet-700',
  },
  {
    label: 'Học phí đến hạn',
    value: 42,
    note: 'Cần nhắc trong hôm nay',
    icon: CircleDollarSign,
    color: 'bg-amber-50 text-amber-700',
  },
  {
    label: 'Lịch hẹn tuyển sinh',
    value: 18,
    note: 'Tư vấn và kiểm tra đầu vào',
    icon: CalendarCheck,
    color: 'bg-blue-50 text-blue-700',
  },
  {
    label: 'Thông báo mới',
    value: 11,
    note: 'Từ đào tạo, tài chính và chăm sóc',
    icon: Bell,
    color: 'bg-emerald-50 text-emerald-700',
  },
]
