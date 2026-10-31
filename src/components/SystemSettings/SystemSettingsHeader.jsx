import React from 'react'
import PageHeader from '../common/PageHeader.jsx'
import { SearchInput } from '../common/ui.jsx'

export default function SystemSettingsHeader({
  activeTab,
  tabs,
  keyword,
  onKeywordChange,
  onTabChange
}) {
  return (
    <PageHeader
      title="Cài đặt hệ thống"
      description="Quản lý nhân viên, tài khoản đăng nhập và quyền truy cập của trung tâm."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      actions={
        <SearchInput
          value={keyword}
          onChange={onKeywordChange}
          placeholder={
            activeTab === 'employees'
              ? 'Tìm tên, mã, email nhân viên'
              : 'Tìm vai trò, mã quyền'
          }
        />
      }
    />
  )
}
