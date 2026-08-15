import { useState } from 'react'
import { toast } from 'sonner'
import EmployeesPanel from '../../components/SystemSettings/EmployeesPanel.jsx'
import PermissionsPanel from '../../components/SystemSettings/PermissionsPanel.jsx'
import SystemSettingsHeader from '../../components/SystemSettings/SystemSettingsHeader.jsx'
import {
  auditLogs,
  employeeRows,
  permissionActions,
  permissionActionLabels,
  permissionMatrix,
  permissionRows,
  systemModules,
  systemSettingTabs,
} from '../../datas/systemSettings.js'

function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('employees')
  const [keyword, setKeyword] = useState('')

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setKeyword('')
  }

  const handleRefresh = () => {
    setKeyword('')
    toast.success('Đã làm mới dữ liệu cài đặt hệ thống')
  }

  return (
    <div className="space-y-5">
      <SystemSettingsHeader
        activeTab={activeTab}
        tabs={systemSettingTabs}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onTabChange={handleTabChange}
      />

      {activeTab === 'employees' ? (
        <EmployeesPanel rows={employeeRows} keyword={keyword} onRefresh={handleRefresh} />
      ) : (
        <PermissionsPanel
          rows={permissionRows}
          modules={systemModules}
          matrix={permissionMatrix}
          actions={permissionActions}
          actionLabels={permissionActionLabels}
          auditLogs={auditLogs}
          keyword={keyword}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  )
}

export default SystemSettingsPage
