import { courseClasses, courses, students, teachers } from './courses.js'

const courseMap = Object.fromEntries(courses.map((item) => [item.id, item]))
const classMap = Object.fromEntries(courseClasses.map((item) => [item.id, item]))
const studentMap = Object.fromEntries(students.map((item) => [item.id, item]))
const teacherMap = Object.fromEntries(teachers.map((item) => [item.id, item]))

function buildStudentReportRow({ id, studentId, classId, branch, status, averageScore, homeworkRate, attendanceRate, progress, previous, date }) {
  const classItem = classMap[classId]
  const course = courseMap[classItem?.courseId]
  const teacher = teacherMap[classItem?.teacherId]
  const student = studentMap[studentId]

  return {
    id,
    studentId,
    studentCode: student?.code || studentId,
    studentName: student?.name || studentId,
    branch,
    courseId: course?.id || '',
    course: course?.name || '',
    classId,
    className: classItem?.name || classId,
    teacherId: teacher?.id || '',
    teacher: teacher?.name || '',
    status,
    averageScore,
    homeworkRate,
    attendanceRate,
    progress,
    previous,
    date,
  }
}

function buildTeacherReportRow({ id, classId, branch, status, hours, classes, kpi, homeworkChecked, testsChecked, rating, completion, previous, date }) {
  const classItem = classMap[classId]
  const course = courseMap[classItem?.courseId]
  const teacher = teacherMap[classItem?.teacherId]

  return {
    id,
    branch,
    courseId: course?.id || '',
    course: course?.name || '',
    classId,
    className: classItem?.name || classId,
    teacherId: teacher?.id || '',
    teacher: teacher?.name || '',
    specialty: teacher?.specialty || '',
    status,
    hours,
    classes,
    kpi,
    homeworkChecked,
    testsChecked,
    rating,
    completion,
    previous,
    date,
  }
}

function buildClassReportRow({ id, classId, branch, status, totalClasses, averageSize, fillRate, absenceRate, completionRate, previous, date }) {
  const classItem = classMap[classId]
  const course = courseMap[classItem?.courseId]
  const teacher = teacherMap[classItem?.teacherId]

  return {
    id,
    branch,
    courseId: course?.id || '',
    course: course?.name || '',
    classId,
    classCode: classItem?.code || classId,
    className: classItem?.name || classId,
    teacherId: teacher?.id || '',
    teacher: teacher?.name || '',
    currentStudents: classItem?.currentStudents || 0,
    maxStudents: classItem?.maxStudents || 0,
    status,
    totalClasses,
    averageSize,
    fillRate,
    absenceRate,
    completionRate,
    previous,
    date,
  }
}

export const reportStatistics = [
  { key: 'revenue', label: 'Tổng doanh thu', value: 486000000, displayValue: '486M', trend: 12.4, description: 'Tăng so với kỳ trước', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'students', label: 'Tổng học viên', value: 1248, displayValue: '1.248', trend: 8.1, description: 'Đang theo học', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { key: 'classes', label: 'Tổng lớp học', value: 86, displayValue: '86', trend: 5.6, description: 'Lớp đang vận hành', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { key: 'teachers', label: 'Tổng giáo viên', value: 42, displayValue: '42', trend: 3.2, description: 'Giáo viên cơ hữu và thỉnh giảng', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { key: 'conversion', label: 'Tỷ lệ chuyển đổi', value: 38.6, displayValue: '38.6%', trend: 4.7, description: 'Lead sang đăng ký chính thức', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  { key: 'attendance', label: 'Tỷ lệ chuyên cần', value: 91.2, displayValue: '91.2%', trend: 2.3, description: 'Trung bình toàn trung tâm', color: 'bg-violet-50 text-violet-700 border-violet-100' },
  { key: 'completion', label: 'Tỷ lệ hoàn thành khóa', value: 84.8, displayValue: '84.8%', trend: -1.8, description: 'Hoàn thành đúng lộ trình', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  { key: 'profit', label: 'Lợi nhuận', value: 168000000, displayValue: '168M', trend: 9.9, description: 'Sau chi phí vận hành', color: 'bg-lime-50 text-lime-700 border-lime-100' },
]

export const reportCharts = {
  revenueByMonth: [
    { month: 'T1', revenue: 310000000, cost: 198000000, profit: 112000000 },
    { month: 'T2', revenue: 338000000, cost: 207000000, profit: 131000000 },
    { month: 'T3', revenue: 364000000, cost: 224000000, profit: 140000000 },
    { month: 'T4', revenue: 392000000, cost: 235000000, profit: 157000000 },
    { month: 'T5', revenue: 421000000, cost: 248000000, profit: 173000000 },
    { month: 'T6', revenue: 448000000, cost: 269000000, profit: 179000000 },
    { month: 'T7', revenue: 486000000, cost: 318000000, profit: 168000000 },
  ],
  admissionByMonth: [
    { month: 'T1', leads: 420, trials: 176, enrollments: 112 },
    { month: 'T2', leads: 458, trials: 193, enrollments: 128 },
    { month: 'T3', leads: 510, trials: 218, enrollments: 142 },
    { month: 'T4', leads: 536, trials: 244, enrollments: 156 },
    { month: 'T5', leads: 572, trials: 261, enrollments: 174 },
    { month: 'T6', leads: 619, trials: 286, enrollments: 192 },
    { month: 'T7', leads: 648, trials: 302, enrollments: 211 },
  ],
  studentStatus: [
    { name: 'Đang học', value: 72, fill: '#2563eb' },
    { name: 'Bảo lưu', value: 9, fill: '#f59e0b' },
    { name: 'Chờ lớp', value: 11, fill: '#06b6d4' },
    { name: 'Hoàn thành', value: 8, fill: '#10b981' },
  ],
  teacherPerformance: [
    { teacher: 'Ms. Linh', kpi: 94, rating: 4.8 },
    { teacher: 'Mr. Minh', kpi: 91, rating: 4.7 },
    { teacher: 'Ms. Hana', kpi: 88, rating: 4.6 },
    { teacher: 'Mr. David', kpi: 86, rating: 4.5 },
    { teacher: 'Ms. Trang', kpi: 84, rating: 4.4 },
  ],
  courseCompletion: [
    { course: 'Starter', completion: 88 },
    { course: 'Mover', completion: 83 },
    { course: 'Flyer', completion: 81 },
    { course: 'IELTS Foundation', completion: 79 },
    { course: 'IELTS Intensive', completion: 86 },
  ],
}

export const admissionReports = {
  label: 'Báo cáo tuyển sinh',
  summary: [
    { label: 'Tổng Lead', value: '3.763', trend: 14.2 },
    { label: 'Đăng ký học thử', value: '1.680', trend: 10.5 },
    { label: 'Đăng ký chính thức', value: '1.115', trend: 8.8 },
    { label: 'Đóng học phí', value: '963', trend: 7.4 },
    { label: 'Tỷ lệ chuyển đổi', value: '38.6%', trend: 4.7 },
    { label: 'Nguồn Lead tốt nhất', value: 'Facebook Ads', trend: 11.3 },
    { label: 'NV tuyển sinh nổi bật', value: 'Nguyễn Thu', trend: 9.1 },
  ],
  funnel: [
    { stage: 'Lead mới', value: 3763, fill: '#2563eb' },
    { stage: 'Tư vấn', value: 2450, fill: '#06b6d4' },
    { stage: 'Học thử', value: 1680, fill: '#f59e0b' },
    { stage: 'Đăng ký', value: 1115, fill: '#10b981' },
    { stage: 'Đóng phí', value: 963, fill: '#84cc16' },
  ],
  leadSources: [
    { name: 'Facebook Ads', leads: 1260, enrollments: 398 },
    { name: 'Referral', leads: 820, enrollments: 321 },
    { name: 'Website', leads: 610, enrollments: 174 },
    { name: 'School event', leads: 456, enrollments: 132 },
    { name: 'Walk-in', leads: 617, enrollments: 90 },
  ],
  monthly: reportCharts.admissionByMonth,
  details: [
    { id: 'ADM-001', branch: 'Cơ sở Quận 1', course: 'IELTS Foundation', className: 'IELTS-F07', staff: 'Nguyễn Thu', source: 'Facebook Ads', status: 'Đóng học phí', leads: 186, trials: 86, enrollments: 52, revenue: 72800000, conversion: 27.9, previous: 24.2, date: '2026-07-31' },
    { id: 'ADM-002', branch: 'Cơ sở Bình Thạnh', course: 'Starter', className: 'ST-K12', staff: 'Trần Long', source: 'Referral', status: 'Đăng ký chính thức', leads: 142, trials: 71, enrollments: 48, revenue: 51200000, conversion: 33.8, previous: 30.4, date: '2026-07-28' },
    { id: 'ADM-003', branch: 'Cơ sở Thủ Đức', course: 'Mover', className: 'MV-K09', staff: 'Lê Mai', source: 'Website', status: 'Học thử', leads: 121, trials: 54, enrollments: 31, revenue: 33400000, conversion: 25.6, previous: 28.1, date: '2026-07-24' },
    { id: 'ADM-004', branch: 'Cơ sở Quận 7', course: 'Flyer', className: 'FL-K05', staff: 'Phạm Vy', source: 'School event', status: 'Đóng học phí', leads: 168, trials: 79, enrollments: 55, revenue: 69400000, conversion: 32.7, previous: 29.9, date: '2026-07-20' },
    { id: 'ADM-005', branch: 'Cơ sở Quận 1', course: 'IELTS Intensive', className: 'IELTS-I03', staff: 'Nguyễn Thu', source: 'Walk-in', status: 'Tư vấn', leads: 94, trials: 38, enrollments: 21, revenue: 43800000, conversion: 22.3, previous: 20.8, date: '2026-07-16' },
  ],
}

export const studentReports = {
  label: 'Báo cáo học viên',
  details: [
    buildStudentReportRow({ id: 'STD-RPT-001', studentId: 'student-001', classId: 'class-ielts-fd-01', branch: 'Cơ sở Quận 1', status: 'Đạt tiến độ', averageScore: 8.3, homeworkRate: 92, attendanceRate: 96, progress: 16.2, previous: 12.4, date: '2026-07-31' }),
    buildStudentReportRow({ id: 'STD-RPT-002', studentId: 'student-002', classId: 'class-ielts-fd-01', branch: 'Cơ sở Quận 1', status: 'Cần theo dõi', averageScore: 7.8, homeworkRate: 84, attendanceRate: 88, progress: 9.6, previous: 10.8, date: '2026-07-29' }),
    buildStudentReportRow({ id: 'STD-RPT-003', studentId: 'student-003', classId: 'class-toeic-500-01', branch: 'Cơ sở Thủ Đức', status: 'Cần hỗ trợ', averageScore: 7.1, homeworkRate: 78, attendanceRate: 82, progress: 7.4, previous: 8.9, date: '2026-07-26' }),
    buildStudentReportRow({ id: 'STD-RPT-004', studentId: 'student-004', classId: 'class-kids-starter-01', branch: 'Cơ sở Quận 7', status: 'Xuất sắc', averageScore: 8.7, homeworkRate: 95, attendanceRate: 94, progress: 18.5, previous: 14.1, date: '2026-07-22' }),
    buildStudentReportRow({ id: 'STD-RPT-005', studentId: 'student-005', classId: 'class-toeic-500-01', branch: 'Cơ sở Thủ Đức', status: 'Đạt tiến độ', averageScore: 7.3, homeworkRate: 88, attendanceRate: 100, progress: 12.2, previous: 9.8, date: '2026-07-18' }),
  ],
}

export const teacherReports = {
  label: 'Báo cáo giáo viên',
  summary: [
    { label: 'Tổng giờ giảng dạy', value: '3.284h', trend: 7.5 },
    { label: 'Số lớp phụ trách', value: '86', trend: 5.6 },
    { label: 'KPI trung bình', value: '88.6%', trend: 3.1 },
    { label: 'Homework đã chấm', value: '9.842', trend: 12.7 },
    { label: 'Bài kiểm tra đã chấm', value: '1.376', trend: 8.4 },
    { label: 'Điểm đánh giá', value: '4.6/5', trend: 2.9 },
    { label: 'Hoàn thành công việc', value: '92.4%', trend: 4.2 },
  ],
  kpiByMonth: [
    { month: 'T3', kpi: 82, completed: 88 },
    { month: 'T4', kpi: 84, completed: 89 },
    { month: 'T5', kpi: 87, completed: 91 },
    { month: 'T6', kpi: 89, completed: 93 },
    { month: 'T7', kpi: 91, completed: 94 },
  ],
  teachingHoursByWeek: [
    { week: 'W27', hours: 712 },
    { week: 'W28', hours: 748 },
    { week: 'W29', hours: 781 },
    { week: 'W30', hours: 804 },
  ],
  rating: reportCharts.teacherPerformance,
  details: [
    buildTeacherReportRow({ id: 'TCH-001', classId: 'class-ielts-fd-01', branch: 'Cơ sở Quận 1', status: 'Vượt KPI', hours: 126, classes: 6, kpi: 94, homeworkChecked: 384, testsChecked: 54, rating: 4.8, completion: 96, previous: 91, date: '2026-07-31' }),
    buildTeacherReportRow({ id: 'TCH-002', classId: 'class-toeic-500-01', branch: 'Cơ sở Thủ Đức', status: 'Đạt KPI', hours: 118, classes: 5, kpi: 91, homeworkChecked: 346, testsChecked: 48, rating: 4.7, completion: 94, previous: 89, date: '2026-07-27' }),
    buildTeacherReportRow({ id: 'TCH-003', classId: 'class-ielts-fd-02', branch: 'Cơ sở Bình Thạnh', status: 'Đạt KPI', hours: 112, classes: 5, kpi: 88, homeworkChecked: 318, testsChecked: 45, rating: 4.6, completion: 91, previous: 87, date: '2026-07-24' }),
    buildTeacherReportRow({ id: 'TCH-004', classId: 'class-kids-starter-01', branch: 'Cơ sở Quận 7', status: 'Cần theo dõi', hours: 104, classes: 4, kpi: 86, homeworkChecked: 292, testsChecked: 42, rating: 4.5, completion: 89, previous: 90, date: '2026-07-19' }),
    buildTeacherReportRow({ id: 'TCH-005', classId: 'class-ielts-fd-01', branch: 'Cơ sở Quận 1', status: 'Đạt KPI', hours: 109, classes: 4, kpi: 84, homeworkChecked: 301, testsChecked: 39, rating: 4.4, completion: 90, previous: 86, date: '2026-07-15' }),
  ],
}

export const financeReports = {
  label: 'Báo cáo tài chính',
  summary: [
    { label: 'Doanh thu', value: '486M', trend: 12.4 },
    { label: 'Lợi nhuận', value: '168M', trend: 9.9 },
    { label: 'Chi phí', value: '318M', trend: 6.8 },
    { label: 'Công nợ', value: '74M', trend: -4.6 },
    { label: 'Học phí đã thu', value: '412M', trend: 11.1 },
    { label: 'Học phí chưa thu', value: '74M', trend: -4.6 },
  ],
  monthly: reportCharts.revenueByMonth,
  debtStatus: [
    { name: 'Trong hạn', value: 39000000, fill: '#2563eb' },
    { name: 'Sắp đến hạn', value: 21000000, fill: '#f59e0b' },
    { name: 'Quá hạn', value: 14000000, fill: '#ef4444' },
  ],
  revenueByBranch: [
    { branch: 'Quận 1', revenue: 184000000 },
    { branch: 'Bình Thạnh', revenue: 126000000 },
    { branch: 'Thủ Đức', revenue: 98000000 },
    { branch: 'Quận 7', revenue: 78000000 },
  ],
  details: [
    { id: 'FIN-001', branch: 'Cơ sở Quận 1', course: 'IELTS Foundation', className: 'IELTS-F07', teacher: 'Ms. Linh', status: 'Đã thu', revenue: 142000000, cost: 83000000, profit: 59000000, debt: 12000000, collected: 130000000, uncollected: 12000000, previous: 128000000, date: '2026-07-31' },
    { id: 'FIN-002', branch: 'Cơ sở Bình Thạnh', course: 'Starter', className: 'ST-K12', teacher: 'Ms. Hana', status: 'Đã thu', revenue: 96000000, cost: 61000000, profit: 35000000, debt: 9000000, collected: 87000000, uncollected: 9000000, previous: 88000000, date: '2026-07-28' },
    { id: 'FIN-003', branch: 'Cơ sở Thủ Đức', course: 'Mover', className: 'MV-K09', teacher: 'Mr. Minh', status: 'Còn công nợ', revenue: 82000000, cost: 56000000, profit: 26000000, debt: 18000000, collected: 64000000, uncollected: 18000000, previous: 79000000, date: '2026-07-24' },
    { id: 'FIN-004', branch: 'Cơ sở Quận 7', course: 'Flyer', className: 'FL-K05', teacher: 'Ms. Trang', status: 'Đã thu', revenue: 78000000, cost: 51000000, profit: 27000000, debt: 11000000, collected: 67000000, uncollected: 11000000, previous: 70000000, date: '2026-07-20' },
    { id: 'FIN-005', branch: 'Cơ sở Quận 1', course: 'IELTS Intensive', className: 'IELTS-I03', teacher: 'Mr. David', status: 'Còn công nợ', revenue: 88000000, cost: 67000000, profit: 21000000, debt: 24000000, collected: 64000000, uncollected: 24000000, previous: 76000000, date: '2026-07-17' },
  ],
}

export const classReports = {
  label: 'Báo cáo lớp học',
  summary: [
    { label: 'Tổng số lớp', value: '86', trend: 5.6 },
    { label: 'Sĩ số trung bình', value: '16.8', trend: 2.4 },
    { label: 'Tỷ lệ đầy lớp', value: '78.5%', trend: 6.7 },
    { label: 'Tỷ lệ nghỉ học', value: '6.8%', trend: -2.1 },
    { label: 'Hoàn thành khóa', value: '84.8%', trend: -1.8 },
    { label: 'Sĩ số cao nhất', value: 'IELTS-I03', trend: 4.3 },
    { label: 'Nghỉ nhiều nhất', value: 'MV-K09', trend: -3.2 },
  ],
  sizeByClass: [
    { className: 'ST-K12', current: 18, max: 20 },
    { className: 'MV-K09', current: 15, max: 20 },
    { className: 'FL-K05', current: 17, max: 20 },
    { className: 'IELTS-F07', current: 16, max: 18 },
    { className: 'IELTS-I03', current: 19, max: 20 },
  ],
  status: [
    { name: 'Đang học', value: 64, fill: '#2563eb' },
    { name: 'Sắp khai giảng', value: 12, fill: '#06b6d4' },
    { name: 'Hoàn thành', value: 8, fill: '#10b981' },
    { name: 'Tạm dừng', value: 2, fill: '#ef4444' },
  ],
  completion: reportCharts.courseCompletion,
  details: [
    buildClassReportRow({ id: 'CLS-001', classId: 'class-ielts-fd-01', branch: 'Cơ sở Quận 1', status: 'Đang học', totalClasses: 6, averageSize: 16, fillRate: 88, absenceRate: 5.8, completionRate: 83, previous: 80, date: '2026-07-31' }),
    buildClassReportRow({ id: 'CLS-002', classId: 'class-ielts-fd-02', branch: 'Cơ sở Bình Thạnh', status: 'Đã đủ sĩ số', totalClasses: 8, averageSize: 18, fillRate: 90, absenceRate: 4.9, completionRate: 88, previous: 84, date: '2026-07-27' }),
    buildClassReportRow({ id: 'CLS-003', classId: 'class-toeic-500-01', branch: 'Cơ sở Thủ Đức', status: 'Sắp khai giảng', totalClasses: 7, averageSize: 15, fillRate: 75, absenceRate: 9.6, completionRate: 79, previous: 82, date: '2026-07-24' }),
    buildClassReportRow({ id: 'CLS-004', classId: 'class-kids-starter-01', branch: 'Cơ sở Quận 7', status: 'Đang học', totalClasses: 5, averageSize: 17, fillRate: 85, absenceRate: 6.4, completionRate: 81, previous: 78, date: '2026-07-19' }),
    buildClassReportRow({ id: 'CLS-005', classId: 'class-ielts-fd-01', branch: 'Cơ sở Quận 1', status: 'Đang học', totalClasses: 4, averageSize: 19, fillRate: 95, absenceRate: 4.2, completionRate: 86, previous: 83, date: '2026-07-16' }),
  ],
}
