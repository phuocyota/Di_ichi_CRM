import {
  BarChart3,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Users,
} from 'lucide-react'

export const navigationItems = [
  {
    label: 'Tổng quan',
    path: '/dashboard',
    icon: LayoutDashboard,
    color: 'bg-blue-50 text-blue-700 ring-blue-100',
    activeColor: 'bg-blue-600 text-white shadow-blue-200',
  },
  {
    label: 'Học viên',
    path: '/students',
    icon: GraduationCap,
    color: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    activeColor: 'bg-emerald-600 text-white shadow-emerald-200',
  },
  {
    label: 'Lớp học',
    path: '/classes',
    icon: BookOpen,
    color: 'bg-amber-50 text-amber-700 ring-amber-100',
    activeColor: 'bg-amber-500 text-white shadow-amber-200',
  },
  {
    label: 'Lịch học',
    path: '/schedule',
    icon: CalendarDays,
    color: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    activeColor: 'bg-cyan-600 text-white shadow-cyan-200',
  },
  {
    label: 'Nhân sự',
    path: '/staff',
    icon: Users,
    color: 'bg-violet-50 text-violet-700 ring-violet-100',
    activeColor: 'bg-violet-600 text-white shadow-violet-200',
  },
  {
    label: 'Tài chính',
    path: '/finance',
    icon: ReceiptText,
    color: 'bg-rose-50 text-rose-700 ring-rose-100',
    activeColor: 'bg-rose-600 text-white shadow-rose-200',
  },
  {
    label: 'Báo cáo',
    path: '/reports',
    icon: BarChart3,
    color: 'bg-orange-50 text-orange-700 ring-orange-100',
    activeColor: 'bg-orange-500 text-white shadow-orange-200',
  },
  {
    label: 'Cài đặt',
    path: '/settings',
    icon: Settings,
    color: 'bg-slate-100 text-slate-700 ring-slate-200',
    activeColor: 'bg-slate-700 text-white shadow-slate-200',
  },
]
