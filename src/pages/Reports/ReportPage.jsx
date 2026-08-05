import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import ReportContent from '../../components/Reports/ReportContent.jsx'
import ReportDashboard from '../../components/Reports/ReportDashboard.jsx'
import ReportDetail from '../../components/Reports/ReportDetail.jsx'
import ReportFilterModal from '../../components/Reports/ReportFilterModal.jsx'
import ReportHeader from '../../components/Reports/ReportHeader.jsx'
import {
  admissionReports,
  classReports,
  financeReports,
  learningReports,
  reportCharts,
  reportStatistics,
  teacherReports,
} from '../../datas/reports.js'

const reportMap = {
  dashboard: { key: 'dashboard', label: 'Dashboard báo cáo' },
  admissions: admissionReports,
  learning: learningReports,
  teachers: teacherReports,
  finance: financeReports,
  classes: classReports,
}

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'admissions', label: 'Tuyển sinh' },
  { key: 'learning', label: 'Học tập' },
  { key: 'teachers', label: 'Giáo viên' },
  { key: 'finance', label: 'Tài chính' },
  { key: 'classes', label: 'Lớp học' },
]

function getOptions(reports) {
  const rows = Object.values(reports).flatMap((report) => report.details || [])
  const unique = (key) => [...new Set(rows.map((item) => item[key]).filter(Boolean))]
  return {
    branches: unique('branch'),
    courses: unique('course'),
    classes: unique('className'),
    teachers: unique('teacher'),
    staffs: unique('staff'),
    statuses: unique('status'),
  }
}

function filterRows(rows, keyword, filters) {
  const lowerKeyword = keyword.trim().toLowerCase()
  return rows.filter((row) => {
    const matchesKeyword = !lowerKeyword || Object.values(row).some((value) => String(value).toLowerCase().includes(lowerKeyword))
    const matchesSelects = ['branch', 'course', 'className', 'teacher', 'staff', 'status'].every((key) => !filters[key] || row[key] === filters[key])
    const rowDate = dayjs(row.date)
    const matchesDate = (!filters.fromDate || rowDate.isAfter(dayjs(filters.fromDate).subtract(1, 'day'))) && (!filters.toDate || rowDate.isBefore(dayjs(filters.toDate).add(1, 'day')))
    return matchesKeyword && matchesSelects && matchesDate
  })
}

function ReportPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState({ period: 'month', fromDate: '', toDate: '', branch: '', course: '', className: '', teacher: '', staff: '', status: '' })
  const [modal, setModal] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)

  const reportOptions = useMemo(() => getOptions({ admissionReports, learningReports, teacherReports, financeReports, classReports }), [])
  const activeReport = reportMap[activeTab]
  const reportRows = useMemo(() => activeReport?.details || [], [activeReport])
  const filteredRows = useMemo(() => filterRows(reportRows, keyword, filters), [filters, keyword, reportRows])

  const openDetail = (row) => {
    setSelectedRow(row)
    setModal('detail')
  }

  const closeModal = () => setModal(null)

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx')
    const rows = filteredRows.length ? filteredRows : Object.values(reportMap).flatMap((report) => report.details || [])
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports')
    XLSX.writeFile(workbook, `bao-cao-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`)
    setModal(null)
    toast.success('Đã export Excel')
  }

  const handleExportPdf = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
    const rows = filteredRows.length ? filteredRows : Object.values(reportMap).flatMap((report) => report.details || [])
    const columns = Object.keys(rows[0] || {}).slice(0, 8)
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.text(activeReport?.label || 'Dashboard báo cáo', 14, 14)
    autoTable(doc, { head: [columns], body: rows.map((row) => columns.map((key) => row[key])), startY: 20, styles: { fontSize: 8 } })
    doc.save(`bao-cao-${dayjs().format('YYYYMMDD-HHmm')}.pdf`)
    setModal(null)
    toast.success('Đã export PDF')
  }

  const handlePrint = () => {
    window.print()
    toast.success('Đã gửi báo cáo sang hàng đợi in')
  }

  const handleShare = (values) => {
    toast.success(`Đã chia sẻ báo cáo đến ${values.email || 'người nhận'}`)
    closeModal()
  }

  const handleRefresh = () => toast.success('Đã làm mới dữ liệu báo cáo')

  return (
    <div className="space-y-5">
      <ReportHeader
        activeTab={activeTab}
        tabs={tabs}
        keyword={keyword}
        filters={filters}
        onTabChange={setActiveTab}
        onKeywordChange={setKeyword}
        onOpenModal={setModal}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
        onRefresh={handleRefresh}
      />

      {activeTab === 'dashboard' ? (
        <ReportDashboard statistics={reportStatistics} charts={reportCharts} onTabChange={setActiveTab} />
      ) : (
        <>
          <ReportContent reportKey={activeTab} report={activeReport} rows={filteredRows} onOpenDetail={openDetail} />
          <ReportDetail reportKey={activeTab} report={activeReport} rows={filteredRows} keyword={keyword} onKeywordChange={setKeyword} onOpenDetail={openDetail} />
        </>
      )}

      <ReportFilterModal
        modal={modal}
        report={activeReport}
        selectedRow={selectedRow}
        filters={filters}
        options={reportOptions}
        onApplyFilters={setFilters}
        onClose={closeModal}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
        onShare={handleShare}
      />
    </div>
  )
}

export default ReportPage
