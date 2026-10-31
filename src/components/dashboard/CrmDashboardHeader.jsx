import React from 'react'
import PageHeader from '../common/PageHeader.jsx'

export default function CrmDashboardHeader({ activeTab, onTabChange }) {
  return (
    <PageHeader
      title="Tổng quan CRM"
      description="Theo dõi ứng viên, nguồn tuyển sinh và các hoạt động chăm sóc."
      tabs={[
        ['overview', 'Tổng quan'],
        ['leads', 'Danh sách ứng viên'],
        ['customers', 'Khách hàng'],
        ['care', 'Lịch chăm sóc']
      ]}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  )
}
