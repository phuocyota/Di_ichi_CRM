import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import FinanceDashboard from '../../components/Finance/FinanceDashboard.jsx'
import FinanceDetail from '../../components/Finance/FinanceDetail.jsx'
import FinanceHeader from '../../components/Finance/FinanceHeader.jsx'
import FinanceModal from '../../components/Finance/FinanceModal.jsx'
import FinanceTable from '../../components/Finance/FinanceTable.jsx'
import {
  debtList,
  financeDetailTabs,
  financeFilters,
  financeModalConfigs,
  financeReports,
  financeStatistics,
  financeTabs,
  financeTransactions,
  promotions,
  receipts,
  scholarships,
  vouchers,
} from '../../datas/finances.js'
import { createResource, indexById, loadResources, numeric, updateResource } from '../../services/crmApi.js'

function FinancePage() {
  const [activeTab, setActiveTab] = useState('Dashboard tài chính')
  const [keyword, setKeyword] = useState('')
  const [transactions, setTransactions] = useState(financeTransactions)
  const [selectedTransaction, setSelectedTransaction] = useState(financeTransactions[0])
  const [modal, setModal] = useState(null)
  const [modalTransaction, setModalTransaction] = useState(null)
  const [apiDirectories, setApiDirectories] = useState({})

  const refreshTransactions = async () => {
    const result = await loadResources(['finance-transaction', 'student', 'class', 'course', 'branch', 'payment', 'staff', 'receipt', 'promotion', 'voucher', 'scholarship'])
    const studentsById = indexById(result.student)
    const classesById = indexById(result.class)
    const coursesById = indexById(result.course)
    const branchesById = indexById(result.branch)
    const staffsById = indexById(result.staff)
    const mapped = result['finance-transaction'].map((item) => {
      const student = studentsById[item.studentId]
      const classItem = classesById[item.classId]
      const transactionPayments = result.payment.filter((payment) => payment.transactionId === item.id && payment.status === 'successful')
      const latestPayment = transactionPayments.sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)))[0]
      const status = financeFilters.statuses.find((entry) => entry.value === item.status)
      const method = financeFilters.paymentMethods.find((entry) => entry.value === latestPayment?.method)
      return {
        ...item,
        student: student?.name || item.studentId,
        studentCode: student?.code || '—',
        course: coursesById[classItem?.courseId]?.name || '—',
        className: classItem?.name || item.classId,
        branch: branchesById[item.branchId]?.name || item.branchId,
        tuitionFee: numeric(item.tuitionFee),
        promotion: numeric(item.promotionAmount),
        voucher: numeric(item.voucherAmount),
        discount: numeric(item.discountAmount),
        scholarship: numeric(item.scholarshipAmount),
        payable: numeric(item.payableAmount),
        paid: numeric(item.paidAmount),
        debt: numeric(item.debtAmount),
        method: method?.label || '—',
        methodValue: latestPayment?.method || '',
        status: status?.label || item.status,
        statusValue: item.status,
        paidAt: latestPayment?.paidAt || '',
        collector: staffsById[item.collectorId]?.name || '—',
        _receiptId: result.receipt.find((receipt) => receipt.transactionId === item.id)?.id,
      }
    })
    setApiDirectories(result)
    setTransactions(mapped)
    setSelectedTransaction((current) => mapped.find((item) => item.id === current?.id) || mapped[0] || null)
  }

  useEffect(() => {
    refreshTransactions().catch((error) => toast.error(`Không tải được tài chính từ API: ${error.message}`))
  }, [])

  const filteredTransactions = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase()
    const byKeyword = (item) => !lowerKeyword || [item.code, item.student, item.studentCode, item.course, item.className].some((value) => value.toLowerCase().includes(lowerKeyword))

    if (activeTab === 'Thanh toán QR') return transactions.filter((item) => item.methodValue === 'qr' && byKeyword(item))
    if (activeTab === 'Tiền mặt') return transactions.filter((item) => item.methodValue === 'cash' && byKeyword(item))
    if (activeTab === 'Chuyển khoản') return transactions.filter((item) => item.methodValue === 'transfer' && byKeyword(item))
    if (activeTab === 'Công nợ') return transactions.filter((item) => item.debt > 0 && byKeyword(item))
    if (activeTab === 'Phiếu thu') return transactions.filter(byKeyword)
    if (activeTab === 'Thu học phí') return transactions.filter(byKeyword)
    return transactions.filter(byKeyword)
  }, [activeTab, keyword, transactions])

  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction)
    setActiveTab('Phiếu thu')
  }

  const openModal = (type, transaction = selectedTransaction) => {
    setModal(type)
    setModalTransaction(transaction)
  }

  const closeModal = () => {
    setModal(null)
    setModalTransaction(null)
  }

  const handleModalSubmit = async (type, values, transaction) => {
    try {
      if (['collectTuition', 'cashPayment', 'transferPayment', 'collectDebt'].includes(type)) {
        const methodByType = { qrPayment: 'qr', cashPayment: 'cash', transferPayment: 'transfer' }
        await createResource('payment', {
          transactionId: transaction.id,
          amount: Number(values.amount),
          method: methodByType[type] || values.methodValue,
          paidAt: values.paidAt,
          status: 'successful',
          note: values.reason || undefined,
        })
        await refreshTransactions()
        toast.success('Đã ghi nhận thanh toán')
        closeModal()
        return
      }
      if (type === 'extendPayment') {
        await updateResource('finance-transaction', transaction.id, { dueDate: values.dueDate })
      } else if (type === 'applyVoucher') {
        const voucherId = apiDirectories.voucher?.find((item) => item.code === values.voucherCode)?.id
        await createResource('transaction-voucher', { transactionId: transaction.id, voucherId, appliedAmount: numeric(apiDirectories.voucher?.find((item) => item.id === voucherId)?.discountValue) })
      } else if (type === 'applyPromotion') {
        const promotionId = apiDirectories.promotion?.find((item) => item.code === values.promotionCode)?.id
        await createResource('transaction-promotion', { transactionId: transaction.id, promotionId, appliedAmount: numeric(apiDirectories.promotion?.find((item) => item.id === promotionId)?.discountValue) })
      } else if (type === 'applyScholarship') {
        const scholarshipId = apiDirectories.scholarship?.find((item) => item.id === values.scholarshipId)?.id
        await createResource('transaction-scholarship', { transactionId: transaction.id, scholarshipId, appliedAmount: numeric(apiDirectories.scholarship?.find((item) => item.id === scholarshipId)?.discountValue) })
      } else if (type === 'discountTuition') {
        await createResource('manual-discount', { transactionId: transaction.id, amount: Number(values.discountAmount), reason: values.reason, approvedBy: transaction.collectorId })
      } else if (type === 'refundTuition') {
        await createResource('refund', { transactionId: transaction.id, amount: Number(values.refundAmount), method: transaction.methodValue || 'transfer', reason: values.reason, status: 'successful' })
      } else if (type === 'cancelReceipt' && transaction._receiptId) {
        await updateResource('receipt', transaction._receiptId, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelReason: values.reason })
      } else if (['recordDebt', 'createReceipt', 'editReceipt', 'qrPayment'].includes(type)) {
        toast.info('Biểu mẫu hiện tại chưa đủ trường bắt buộc theo API backend')
        closeModal()
        return
      } else {
        throw new Error('LOCAL_ACTION')
      }
      await refreshTransactions()
      toast.success('Đã cập nhật dữ liệu tài chính')
      closeModal()
      return
    } catch (error) {
      if (error.message !== 'LOCAL_ACTION') {
        toast.error(error.message)
        return
      }
    }

    if (['collectTuition', 'createReceipt', 'qrPayment', 'cashPayment', 'transferPayment', 'collectDebt'].includes(type)) {
      const amount = Number(values.amount || 0)
      const methodMap = { qrPayment: 'QR', cashPayment: 'Tiền mặt', transferPayment: 'Chuyển khoản' }
      const methodValueMap = { qrPayment: 'qr', cashPayment: 'cash', transferPayment: 'transfer' }

      if (transaction?.id) {
        const nextPaid = transaction.paid + amount
        const nextDebt = Math.max(transaction.payable - nextPaid, 0)
        const nextTransaction = {
          ...transaction,
          paid: nextPaid,
          debt: nextDebt,
          method: methodMap[type] || transaction.method,
          methodValue: methodValueMap[type] || transaction.methodValue,
          status: nextDebt === 0 ? 'Đã thanh toán' : 'Thanh toán một phần',
          statusValue: nextDebt === 0 ? 'paid' : 'partial',
          paidAt: values.paidAt || transaction.paidAt,
        }
        setTransactions((items) => items.map((item) => item.id === transaction.id ? nextTransaction : item))
        setSelectedTransaction(nextTransaction)
      }
      toast.success('Đã ghi nhận thanh toán')
    } else if (type === 'recordDebt') {
      toast.success('Đã ghi nhận công nợ')
    } else if (type === 'extendPayment') {
      setTransactions((items) => items.map((item) => item.id === transaction.id ? { ...item, dueDate: values.dueDate } : item))
      setSelectedTransaction((current) => current?.id === transaction.id ? { ...current, dueDate: values.dueDate } : current)
      toast.success('Đã gia hạn thanh toán')
    } else if (type === 'applyVoucher') {
      toast.success('Đã áp dụng voucher')
    } else if (type === 'applyPromotion') {
      toast.success('Đã áp dụng khuyến mãi')
    } else if (type === 'applyScholarship') {
      toast.success('Đã áp dụng học bổng')
    } else if (type === 'discountTuition') {
      toast.success('Đã giảm học phí')
    } else if (type === 'refundTuition') {
      toast.success('Đã ghi nhận hoàn học phí')
    } else if (type === 'cancelReceipt') {
      setTransactions((items) => items.map((item) => item.id === transaction.id ? { ...item, status: 'Đã hủy', statusValue: 'cancelled' } : item))
      setSelectedTransaction((current) => current?.id === transaction.id ? { ...current, status: 'Đã hủy', statusValue: 'cancelled' } : current)
      toast.success('Đã hủy phiếu thu')
    } else if (type === 'exportExcel') {
      toast.success('Đã export Excel')
    } else if (type === 'exportPdf') {
      toast.success('Đã export PDF')
    } else if (type === 'printReceipt') {
      toast.success('Đã gửi phiếu thu sang hàng đợi in')
    } else if (type === 'printReport') {
      toast.success('Đã gửi báo cáo sang hàng đợi in')
    } else if (type === 'emailReceipt') {
      toast.success('Đã gửi biên lai qua Email')
    } else if (type === 'notifyPayment') {
      toast.success('Đã gửi thông báo thanh toán')
    }

    closeModal()
  }

  const isDashboard = activeTab === 'Dashboard tài chính'
  const isReport = activeTab === 'Báo cáo tài chính'
  const isPromotionView = ['Khuyến mãi', 'Voucher', 'Giảm học phí', 'Học bổng'].includes(activeTab)
  const promotionItems = apiDirectories.promotion?.length ? apiDirectories.promotion.map((item) => ({ ...item, value: numeric(item.discountValue) })) : promotions
  const voucherItems = apiDirectories.voucher?.length ? apiDirectories.voucher.map((item) => ({ ...item, value: numeric(item.discountValue), expiredAt: item.validTo })) : vouchers
  const scholarshipItems = apiDirectories.scholarship?.length ? apiDirectories.scholarship.map((item) => ({ ...item, value: numeric(item.discountValue) })) : scholarships
  const effectiveFilters = {
    ...financeFilters,
    students: [...new Set(transactions.map((item) => item.student))],
    courses: [...new Set(transactions.map((item) => item.course))],
    classes: [...new Set(transactions.map((item) => item.className))],
    branches: [...new Set(transactions.map((item) => item.branch))],
  }

  return (
    <div className="space-y-5">
      <FinanceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={financeTabs}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onOpenModal={openModal}
      />

      {isDashboard ? (
        <FinanceDashboard statistics={financeStatistics} reports={financeReports} transactions={transactions} onOpenModal={openModal} />
      ) : null}

      {isReport ? (
        <FinanceDashboard statistics={financeStatistics} reports={financeReports} transactions={transactions} onOpenModal={openModal} />
      ) : null}

      {isPromotionView ? (
        <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">{activeTab}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Quản lý ưu đãi, voucher, giảm học phí và học bổng.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm" onClick={() => openModal(activeTab === 'Voucher' ? 'applyVoucher' : activeTab === 'Học bổng' ? 'applyScholarship' : activeTab === 'Giảm học phí' ? 'discountTuition' : 'applyPromotion')}>
                Áp dụng ưu đãi
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...promotionItems, ...voucherItems, ...scholarshipItems].map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">{item.name || item.code}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{item.code || item.condition || item.expiredAt}</p>
                <p className="mt-3 text-xl font-black text-blue-700">{Number(item.value || 0).toLocaleString('vi-VN')}{item.type === 'Theo phần trăm' ? '%' : ' đ'}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{item.status}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!isDashboard && !isReport && !isPromotionView ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <FinanceTable
            transactions={filteredTransactions}
            filters={effectiveFilters}
            keyword={keyword}
            onKeywordChange={setKeyword}
            onSelectTransaction={handleSelectTransaction}
            onOpenModal={openModal}
          />
          <FinanceDetail
            transaction={selectedTransaction}
            tabs={financeDetailTabs}
            receipts={receipts}
            debts={debtList}
            promotions={promotionItems}
            vouchers={voucherItems}
            scholarships={scholarshipItems}
            onOpenModal={openModal}
          />
        </div>
      ) : null}

      <FinanceModal
        modal={modal}
        config={financeModalConfigs[modal]}
        transaction={modalTransaction}
        filters={effectiveFilters}
        promotions={promotionItems}
        vouchers={voucherItems}
        scholarships={scholarshipItems}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  )
}

export default FinancePage
