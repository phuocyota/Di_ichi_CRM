import React from 'react'
import { FileDown, FileSpreadsheet, Upload, UserPlus } from 'lucide-react'
import PageHeader from '../common/PageHeader.jsx'

export default function StudentHeader({
  activeTab,
  onTabChange,
  onOpenModal,
  canManage,
  canExport,
  exportBusy,
  onExport
}) {
  return (
    <PageHeader
      title="Quản lý học viên"
      description="Hồ sơ, lớp học, học phí và quá trình học tập trong một nơi."
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabs={[
        ['dashboard', 'Tổng quan'],
        ['list', 'Danh sách học viên'],
        ['profile', 'Hồ sơ học viên']
      ]}
      actions={
        <>
          {canManage && (
            <button
              type="button"
              className="ui-button"
              onClick={() => onOpenModal('import')}
            >
              <Upload size={16} />
              Nhập Excel
            </button>
          )}
          <button
            type="button"
            className="ui-button"
            disabled={!canExport || exportBusy}
            onClick={() => onExport('excel')}
            title="Xuất dòng đã chọn hoặc danh sách đang lọc"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
          <button
            type="button"
            className="ui-button"
            disabled={!canExport || exportBusy}
            onClick={() => onExport('pdf')}
            title="Xuất PDF danh sách đang lọc"
          >
            <FileDown size={16} />
            PDF
          </button>
          {canManage && (
            <button
              type="button"
              className="ui-button ui-button-primary"
              onClick={() => onOpenModal('add')}
            >
              <UserPlus size={16} />
              Thêm học viên
            </button>
          )}
        </>
      }
    />
  )
}
