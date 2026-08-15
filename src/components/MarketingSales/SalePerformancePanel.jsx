import MarketingReportTable from './MarketingReportTable.jsx'

const columns = [
  { key: 'saleCode', label: 'Mã Sale', strong: true },
  { key: 'saleName', label: 'Sale', strong: true },
  { key: 'department', label: 'Bộ phận' },
  { key: 'position', label: 'Vị trí' },
  { key: 'activeCampaigns', label: 'Campaign phụ trách', total: 'sum' },
  { key: 'bestSource', label: 'Nguồn tốt nhất' },
  { key: 'leads', label: 'Lead', total: 'sum' },
  { key: 'trials', label: 'Học thử', total: 'sum' },
  { key: 'enrollments', label: 'Đăng ký', total: 'sum' },
  { key: 'paid', label: 'Đóng phí', total: 'sum' },
  { key: 'conversionRate', label: 'Chuyển đổi', type: 'percent', total: 'avg' },
  { key: 'paymentRate', label: 'Tỷ lệ đóng phí', type: 'percent', total: 'avg' },
  { key: 'avgDealValue', label: 'Giá trị TB', type: 'currency', total: 'avg' },
  { key: 'paidRevenue', label: 'Doanh thu thực thu', type: 'currency', total: 'sum' },
]

function SalePerformancePanel({ rows, keyword, onRefresh }) {
  return (
    <MarketingReportTable
      title="Hiệu suất Sale"
      subtitle="Đo hiệu suất từng sale từ lead đến học thử, đăng ký, đóng phí và doanh thu thực thu."
      rows={rows}
      columns={columns}
      filters={[
        { key: 'department', label: 'Bộ phận' },
        { key: 'position', label: 'Vị trí' },
        { key: 'bestSource', label: 'Nguồn tốt nhất' },
      ]}
      keyword={keyword}
      searchKeys={['saleCode', 'saleName', 'department', 'position', 'bestSource']}
      exportFileName="hieu-suat-sale.xlsx"
      onRefresh={onRefresh}
    />
  )
}

export default SalePerformancePanel
