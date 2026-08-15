import { courseClasses, courses, students } from './courses.js'

const courseMap = Object.fromEntries(courses.map((item) => [item.id, item]))
const classMap = Object.fromEntries(courseClasses.map((item) => [item.id, item]))
const studentMap = Object.fromEntries(students.map((item) => [item.id, item]))

export const financeTabs = ['Học phí', 'Lịch sử thu tiền', 'Công nợ', 'Doanh thu']

export const tuitionStatuses = [
  { value: 'unpaid', label: 'Chưa thanh toán', badgeClass: 'border-slate-200 bg-slate-100 text-slate-700' },
  { value: 'partial', label: 'Đã thanh toán một phần', badgeClass: 'border-amber-200 bg-amber-50 text-amber-700' },
  { value: 'paid', label: 'Đã thanh toán', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { value: 'overdue', label: 'Quá hạn', badgeClass: 'border-red-200 bg-red-50 text-red-700' },
]

export const debtStatuses = [
  { value: 'not_due', label: 'Chưa đến hạn', badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' },
  { value: 'due_soon', label: 'Sắp đến hạn', badgeClass: 'border-amber-200 bg-amber-50 text-amber-700' },
  { value: 'overdue', label: 'Quá hạn', badgeClass: 'border-red-200 bg-red-50 text-red-700' },
]

export const paymentMethods = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'transfer', label: 'Chuyển khoản' },
  { value: 'qr', label: 'QR Code' },
]

export const collectors = [
  { id: 'collector-001', name: 'Võ Thanh Tùng' },
  { id: 'collector-002', name: 'Hoàng Bảo Ngọc' },
  { id: 'collector-003', name: 'Nguyễn Minh Châu' },
]

export const tuitionTimeFilters = [
  { value: '', label: 'Tất cả thời gian' },
  { value: 'due_7_days', label: 'Hạn trong 7 ngày' },
  { value: 'due_this_month', label: 'Hạn trong tháng' },
  { value: 'overdue', label: 'Đã quá hạn' },
]

export const tuitionFees = [
  {
    id: 'tuition-001',
    code: 'HP0001',
    studentId: 'student-001',
    courseId: 'course-ielts-foundation',
    classId: 'class-ielts-fd-01',
    totalFee: 12000000,
    discount: 1000000,
    scholarship: 0,
    voucher: 500000,
    dueDate: '2026-08-20',
    status: 'paid',
  },
  {
    id: 'tuition-002',
    code: 'HP0002',
    studentId: 'student-002',
    courseId: 'course-ielts-foundation',
    classId: 'class-ielts-fd-01',
    totalFee: 12000000,
    discount: 0,
    scholarship: 0,
    voucher: 0,
    dueDate: '2026-08-25',
    status: 'partial',
  },
  {
    id: 'tuition-003',
    code: 'HP0003',
    studentId: 'student-003',
    courseId: 'course-toeic-500',
    classId: 'class-toeic-500-01',
    totalFee: 8000000,
    discount: 500000,
    scholarship: 0,
    voucher: 0,
    dueDate: '2026-08-16',
    status: 'overdue',
  },
  {
    id: 'tuition-004',
    code: 'HP0004',
    studentId: 'student-004',
    courseId: 'course-starter-kids',
    classId: 'class-kids-starter-01',
    totalFee: 10000000,
    discount: 0,
    scholarship: 1500000,
    voucher: 300000,
    dueDate: '2026-09-02',
    status: 'partial',
  },
  {
    id: 'tuition-005',
    code: 'HP0005',
    studentId: 'student-005',
    courseId: 'course-toeic-500',
    classId: 'class-toeic-500-01',
    totalFee: 8000000,
    discount: 0,
    scholarship: 0,
    voucher: 0,
    dueDate: '2026-09-10',
    status: 'unpaid',
  },
]

export const payments = [
  {
    id: 'payment-001',
    receiptNo: 'PT0001',
    tuitionId: 'tuition-001',
    studentId: 'student-001',
    amount: 10500000,
    method: 'transfer',
    paidAt: '2026-08-13',
    collectorId: 'collector-001',
    payer: 'Phạm Thu Hương',
    transactionCode: 'VCB250813001',
    proofName: 'bien-lai-hp0001.pdf',
    note: 'Thanh toán đủ sau ưu đãi nhập học.',
    status: 'active',
  },
  {
    id: 'payment-002',
    receiptNo: 'PT0002',
    tuitionId: 'tuition-002',
    studentId: 'student-002',
    amount: 5000000,
    method: 'qr',
    paidAt: '2026-08-13',
    collectorId: 'collector-001',
    payer: 'Nguyễn Văn Hùng',
    transactionCode: 'QR250813112',
    proofName: 'qr-nguyen-hoang-nam.png',
    note: 'Đợt 1 khi đăng ký khóa IELTS Foundation.',
    status: 'active',
  },
  {
    id: 'payment-003',
    receiptNo: 'PT0003',
    tuitionId: 'tuition-002',
    studentId: 'student-002',
    amount: 3000000,
    method: 'cash',
    paidAt: '2026-08-15',
    collectorId: 'collector-002',
    payer: 'Nguyễn Văn Hùng',
    transactionCode: '',
    proofName: '',
    note: 'Đợt 2, phụ huynh nộp tại quầy.',
    status: 'active',
  },
  {
    id: 'payment-004',
    receiptNo: 'PT0004',
    tuitionId: 'tuition-004',
    studentId: 'student-004',
    amount: 4500000,
    method: 'transfer',
    paidAt: '2026-08-12',
    collectorId: 'collector-003',
    payer: 'Lê Quốc Bảo',
    transactionCode: 'TCB250812778',
    proofName: 'chuyen-khoan-le-gia-huy.jpg',
    note: 'Đợt 1 sau khi áp dụng học bổng.',
    status: 'active',
  },
]

export function getTuitionPayable(tuition) {
  return Math.max(tuition.totalFee - tuition.discount - tuition.scholarship - tuition.voucher, 0)
}

export function getPaidAmount(tuitionId, paymentItems = payments) {
  return paymentItems
    .filter((item) => item.tuitionId === tuitionId && item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.amount, 0)
}

export function enrichTuition(tuition, paymentItems = payments) {
  const student = studentMap[tuition.studentId]
  const course = courseMap[tuition.courseId]
  const classItem = classMap[tuition.classId]
  const payable = getTuitionPayable(tuition)
  const paid = getPaidAmount(tuition.id, paymentItems)
  const remaining = Math.max(payable - paid, 0)
  const debtStatus = getDebtStatus(tuition.dueDate)
  const status = remaining === 0 ? 'paid' : paid > 0 ? 'partial' : debtStatus === 'overdue' ? 'overdue' : tuition.status

  return {
    ...tuition,
    studentCode: student?.code || tuition.studentId,
    studentName: student?.name || tuition.studentId,
    courseName: course?.name || tuition.courseId,
    className: classItem?.name || tuition.classId,
    discountTotal: tuition.discount + tuition.scholarship + tuition.voucher,
    payable,
    paid,
    remaining,
    status,
  }
}

export function enrichPayment(payment) {
  const tuition = tuitionFees.find((item) => item.id === payment.tuitionId)
  const student = studentMap[payment.studentId]
  const collector = collectors.find((item) => item.id === payment.collectorId)
  const method = paymentMethods.find((item) => item.value === payment.method)

  return {
    ...payment,
    tuitionCode: tuition?.code || payment.tuitionId,
    courseId: tuition?.courseId || '',
    courseName: courseMap[tuition?.courseId]?.name || '',
    classId: tuition?.classId || '',
    className: classMap[tuition?.classId]?.name || '',
    studentName: student?.name || payment.studentId,
    methodName: method?.label || payment.method,
    collectorName: collector?.name || payment.collectorId,
  }
}

export function getDebtStatus(dueDate) {
  const today = new Date('2026-08-13T00:00:00')
  const due = new Date(`${dueDate}T00:00:00`)
  const diffDays = Math.ceil((due - today) / 86400000)
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'due_soon'
  return 'not_due'
}

export function getDebts(tuitionItems = tuitionFees, paymentItems = payments) {
  return tuitionItems
    .map((item) => enrichTuition(item, paymentItems))
    .filter((item) => item.remaining > 0)
    .map((item) => ({
      id: `debt-${item.id}`,
      tuitionId: item.id,
      studentName: item.studentName,
      courseName: item.courseName,
      totalFee: item.totalFee,
      paid: item.paid,
      remaining: item.remaining,
      dueDate: item.dueDate,
      status: getDebtStatus(item.dueDate),
    }))
}

export function getRevenueReports(paymentItems = payments, tuitionItems = tuitionFees) {
  const activePayments = paymentItems.filter((item) => item.status !== 'cancelled')
  const byDateMap = new Map()
  const byMonthMap = new Map()
  const byCourseMap = new Map()

  activePayments.forEach((payment) => {
    const tuition = tuitionItems.find((item) => item.id === payment.tuitionId)
    const course = courseMap[tuition?.courseId]
    byDateMap.set(payment.paidAt, (byDateMap.get(payment.paidAt) || 0) + payment.amount)
    byMonthMap.set(payment.paidAt.slice(0, 7), (byMonthMap.get(payment.paidAt.slice(0, 7)) || 0) + payment.amount)
    byCourseMap.set(course?.name || 'Khác', (byCourseMap.get(course?.name || 'Khác') || 0) + payment.amount)
  })

  return {
    byDate: [...byDateMap.entries()].map(([date, revenue]) => ({ date, revenue })),
    byMonth: [...byMonthMap.entries()].map(([month, revenue]) => ({ month, revenue })),
    byCourse: [...byCourseMap.entries()].map(([course, revenue]) => ({ course, revenue })),
  }
}
