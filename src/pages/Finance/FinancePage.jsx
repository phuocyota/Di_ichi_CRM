import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import FinanceHeader from '../../components/Finance/FinanceHeader.jsx'
import FinanceModal from '../../components/Finance/FinanceModal.jsx'
import FinanceRevenue from '../../components/Finance/FinanceRevenue.jsx'
import FinanceTable from '../../components/Finance/FinanceTable.jsx'
import FinanceTuitionDetailModal from '../../components/Finance/FinanceTuitionDetailModal.jsx'
import { courseClasses, courses } from '../../datas/courses.js'
import {
  collectors,
  debtStatuses,
  enrichPayment,
  enrichTuition,
  financeTabs,
  getDebts,
  getRevenueReports,
  paymentMethods,
  payments,
  tuitionFees,
  tuitionStatuses,
  tuitionTimeFilters,
} from '../../datas/finances.js'

const TODAY = new Date('2026-08-13T00:00:00')

function isMatchedTimeFilter(dueDate, filter) {
  if (!filter) return true

  const due = new Date(`${dueDate}T00:00:00`)
  const diffDays = Math.ceil((due - TODAY) / 86400000)

  if (filter === 'overdue') return diffDays < 0
  if (filter === 'due_7_days') return diffDays >= 0 && diffDays <= 7
  if (filter === 'due_this_month') {
    return due.getFullYear() === TODAY.getFullYear() && due.getMonth() === TODAY.getMonth()
  }

  return true
}

function FinancePage() {
  const [activeTab, setActiveTab] = useState(financeTabs[0])
  const [tuitionItems] = useState(tuitionFees)
  const [paymentItems, setPaymentItems] = useState(payments)
  const [modal, setModal] = useState(null)
  const [selectedTuition, setSelectedTuition] = useState(null)
  const [tuitionFilters, setTuitionFilters] = useState({ status: '', courseId: '', classId: '', time: '' })

  const enrichedTuitions = useMemo(
    () => tuitionItems.map((item) => enrichTuition(item, paymentItems)),
    [paymentItems, tuitionItems],
  )

  const enrichedPayments = useMemo(() => paymentItems.map(enrichPayment), [paymentItems])
  const debts = useMemo(() => getDebts(tuitionItems, paymentItems), [paymentItems, tuitionItems])
  const revenueReports = useMemo(() => getRevenueReports(paymentItems, tuitionItems), [paymentItems, tuitionItems])

  const classOptions = useMemo(() => {
    if (!tuitionFilters.courseId) return courseClasses
    return courseClasses.filter((item) => item.courseId === tuitionFilters.courseId)
  }, [tuitionFilters.courseId])

  const selectedPayments = useMemo(() => {
    if (!selectedTuition) return []
    return enrichedPayments
      .filter((item) => item.tuitionId === selectedTuition.id && item.status !== 'cancelled')
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
  }, [enrichedPayments, selectedTuition])

  const tuitionStats = useMemo(() => {
    return enrichedTuitions.reduce((stats, item) => {
      stats.totalPayable += item.payable
      stats.totalPaid += item.paid
      stats.totalRemaining += item.remaining
      if (item.status === 'overdue') stats.totalOverdue += item.remaining
      return stats
    }, {
      totalPayable: 0,
      totalPaid: 0,
      totalRemaining: 0,
      totalOverdue: 0,
    })
  }, [enrichedTuitions])

  const filteredData = useMemo(() => {
    const search = ''
    const includes = (values) => !search || values.some((value) => String(value || '').toLowerCase().includes(search))

    if (activeTab === 'Lịch sử thu tiền') {
      return enrichedPayments.filter((item) => includes([item.receiptNo, item.studentName, item.methodName, item.collectorName, item.payer, item.transactionCode]))
    }

    if (activeTab === 'Công nợ') {
      return debts.filter((item) => includes([item.studentName, item.courseName, item.dueDate]))
    }

    return enrichedTuitions.filter((item) => {
      const matchesSearch = includes([item.code, item.studentName, item.courseName, item.className])
      const matchesStatus = !tuitionFilters.status || item.status === tuitionFilters.status
      const matchesCourse = !tuitionFilters.courseId || item.courseId === tuitionFilters.courseId
      const matchesClass = !tuitionFilters.classId || item.classId === tuitionFilters.classId
      const matchesTime = isMatchedTimeFilter(item.dueDate, tuitionFilters.time)
      return matchesSearch && matchesStatus && matchesCourse && matchesClass && matchesTime
    })
  }, [activeTab, debts, enrichedPayments, enrichedTuitions, tuitionFilters])

  const findTuition = (tuition) => {
    if (!tuition) return null
    return tuition?.tuitionId ? enrichedTuitions.find((item) => item.id === tuition.tuitionId) : enrichedTuitions.find((item) => item.id === tuition.id) || tuition
  }

  const openPaymentModal = (tuition = selectedTuition || enrichedTuitions.find((item) => item.remaining > 0) || enrichedTuitions[0]) => {
    const tuitionItem = findTuition(tuition)
    setSelectedTuition(tuitionItem)
    setModal('collectPayment')
  }

  const openTuitionDetail = (tuition) => {
    setSelectedTuition(findTuition(tuition))
    setModal('tuitionDetail')
  }

  const openPaymentHistory = (tuition) => {
    setSelectedTuition(findTuition(tuition))
    setModal('paymentHistory')
  }

  const closeModal = () => {
    setModal(null)
    setSelectedTuition(null)
  }

  const handleTuitionFilterChange = (field, value) => {
    setTuitionFilters((filters) => ({
      ...filters,
      [field]: value,
      ...(field === 'courseId' ? { classId: '' } : {}),
    }))
  }

  const printPayment = (payment) => {
    if (!payment) {
      toast.error('Khoản học phí này chưa có phiếu thu')
      return
    }
    toast.success(`Đã gửi phiếu ${payment.receiptNo} sang hàng đợi in`)
  }

  const printLatestTuitionReceipt = (tuition) => {
    const tuitionItem = findTuition(tuition)
    const latestPayment = enrichedPayments
      .filter((item) => item.tuitionId === tuitionItem?.id && item.status !== 'cancelled')
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt))[0]

    printPayment(latestPayment)
  }

  const handlePaymentSubmit = (values) => {
    const tuition = selectedTuition
    if (!tuition) return

    const amount = Number(values.amount || 0)
    if (amount <= 0) {
      toast.error('Số tiền thu phải lớn hơn 0')
      return
    }

    if (tuition.remaining > 0 && amount > tuition.remaining) {
      toast.error('Số tiền thu không được vượt quá khoản còn lại')
      return
    }

    const payment = {
      id: `payment-${Date.now()}`,
      receiptNo: `PT${String(paymentItems.length + 1).padStart(4, '0')}`,
      tuitionId: tuition.id,
      studentId: tuition.studentId,
      amount,
      method: values.method,
      paidAt: values.paidAt,
      collectorId: values.collectorId,
      payer: values.payer,
      transactionCode: values.transactionCode,
      proofName: values.proof?.[0]?.name || '',
      note: values.note,
      status: 'active',
    }

    setPaymentItems((items) => [payment, ...items])
    setActiveTab('Học phí')
    toast.success('Đã ghi nhận phiếu thu')
    closeModal()
  }

  return (
    <div className="space-y-5">
      <FinanceHeader
        activeTab={activeTab}
        tabs={financeTabs}
        onTabChange={setActiveTab}
      />

      {activeTab === 'Doanh thu' ? (
        <FinanceRevenue
          tuitions={enrichedTuitions}
          payments={enrichedPayments}
          debts={debts}
          reports={revenueReports}
          paymentMethods={paymentMethods}
        />
      ) : (
        <FinanceTable
          activeTab={activeTab}
          items={filteredData}
          tuitionStatuses={tuitionStatuses}
          debtStatuses={debtStatuses}
          paymentMethods={paymentMethods}
          tuitionStats={tuitionStats}
          tuitionFilters={tuitionFilters}
          courseOptions={courses}
          classOptions={classOptions}
          timeFilters={tuitionTimeFilters}
          onTuitionFilterChange={handleTuitionFilterChange}
          onCollectPayment={openPaymentModal}
          onShowTuitionDetail={openTuitionDetail}
          onShowPaymentHistory={openPaymentHistory}
          onPrintTuitionReceipt={printLatestTuitionReceipt}
          onPrintReceipt={printPayment}
          onExportInvoice={(item) => toast.success(`Đã xuất hóa đơn cho phiếu ${item.receiptNo}`)}
          onCancelPayment={(item) => {
            setPaymentItems((payments) => payments.map((payment) => payment.id === item.id ? { ...payment, status: 'cancelled' } : payment))
            toast.success('Đã hủy phiếu thu')
          }}
          onRemindDebt={(item) => toast.success(`Đã tạo nhắc đóng học phí cho ${item.studentName}`)}
        />
      )}

      <FinanceModal
        modal={modal}
        tuition={selectedTuition}
        paymentMethods={paymentMethods}
        collectors={collectors}
        onClose={closeModal}
        onSubmit={handlePaymentSubmit}
      />

      <FinanceTuitionDetailModal
        modal={modal === 'tuitionDetail' || modal === 'paymentHistory' ? modal : null}
        tuition={selectedTuition}
        payments={selectedPayments}
        tuitionStatuses={tuitionStatuses}
        onClose={closeModal}
        onCollectPayment={openPaymentModal}
        onPrintReceipt={printPayment}
      />
    </div>
  )
}

export default FinancePage
