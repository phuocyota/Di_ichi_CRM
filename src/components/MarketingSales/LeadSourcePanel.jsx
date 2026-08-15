import MarketingReportTable from './MarketingReportTable.jsx'

const columns = [
  { key: 'sourceName', label: 'Nguồn Lead', strong: true },
  { key: 'channel', label: 'Kênh' },
  { key: 'ownerName', label: 'Phụ trách' },
  { key: 'leads', label: 'Lead', total: 'sum' },
  { key: 'trials', label: 'Học thử', total: 'sum' },
  { key: 'enrollments', label: 'Đăng ký', total: 'sum' },
  { key: 'paid', label: 'Đóng phí', total: 'sum' },
  { key: 'conversionRate', label: 'Chuyển đổi', type: 'percent', total: 'avg' },
  { key: 'paymentRate', label: 'Tỷ lệ đóng phí', type: 'percent', total: 'avg' },
  { key: 'cost', label: 'Chi phí', type: 'currency', total: 'sum' },
  { key: 'costPerLead', label: 'CPL', type: 'currency', total: 'avg' },
  { key: 'paidRevenue', label: 'Doanh thu thực thu', type: 'currency', total: 'sum' },
  { key: 'roi', label: 'ROI', type: 'percent', total: 'avg' },
]

function LeadSourcePanel({ rows, keyword, onRefresh }) {
  return (
    <MarketingReportTable
      title="Nguồn Lead"
      subtitle="Theo dõi hiệu quả từng nguồn lead, chi phí, tỷ lệ chuyển đổi và doanh thu thực thu liên kết từ học phí."
      rows={rows}
      columns={columns}
      filters={[
        { key: 'channel', label: 'Kênh' },
        { key: 'ownerId', label: 'Phụ trách', labelKey: 'ownerName' },
      ]}
      keyword={keyword}
      searchKeys={['sourceName', 'channel', 'ownerName']}
      exportFileName="nguon-lead-marketing-sale.xlsx"
      onRefresh={onRefresh}
    />
  )
}

export default LeadSourcePanel
