import MarketingReportTable from './MarketingReportTable.jsx'

const columns = [
  { key: 'campaignCode', label: 'Mã Campaign', strong: true },
  { key: 'campaignName', label: 'Campaign', strong: true },
  { key: 'sourceNames', label: 'Nguồn Lead' },
  { key: 'courseName', label: 'Khóa học' },
  { key: 'ownerName', label: 'Phụ trách' },
  { key: 'status', label: 'Trạng thái', badge: true },
  { key: 'startDate', label: 'Từ ngày' },
  { key: 'endDate', label: 'Đến ngày' },
  { key: 'budget', label: 'Ngân sách', type: 'currency', total: 'sum' },
  { key: 'leads', label: 'Lead', total: 'sum' },
  { key: 'trials', label: 'Học thử', total: 'sum' },
  { key: 'enrollments', label: 'Đăng ký', total: 'sum' },
  { key: 'paidRevenue', label: 'Doanh thu thực thu', type: 'currency', total: 'sum' },
  { key: 'conversionRate', label: 'Chuyển đổi', type: 'percent', total: 'avg' },
  { key: 'roi', label: 'ROI', type: 'percent', total: 'avg' },
]

function CampaignPanel({ rows, keyword, onRefresh }) {
  return (
    <MarketingReportTable
      title="Campaign"
      subtitle="Quản trị campaign theo khóa học, nguồn lead, ngân sách, chuyển đổi và doanh thu liên kết."
      rows={rows}
      columns={columns}
      filters={[
        { key: 'courseId', label: 'Khóa học', labelKey: 'courseName' },
        { key: 'ownerId', label: 'Phụ trách', labelKey: 'ownerName' },
        { key: 'status', label: 'Trạng thái' },
      ]}
      keyword={keyword}
      searchKeys={['campaignCode', 'campaignName', 'sourceNames', 'courseName', 'ownerName']}
      exportFileName="campaign-marketing-sale.xlsx"
      onRefresh={onRefresh}
    />
  )
}

export default CampaignPanel
