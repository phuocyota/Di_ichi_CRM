import React from 'react'
import {
  FileDown,
  FileSpreadsheet,
  Printer,
  Upload,
  UserPlus
} from 'lucide-react'
import PageHeader from '../common/PageHeader.jsx'

export default function StaffHeader({
  activeTab,
  onTabChange,
  tabs = [],
  onOpenModal,
  disabled = false
}) {
  return (
    <PageHeader
      title="Quản lý giáo viên"
      description="Theo dõi hồ sơ, chuyên môn, phân công lớp và kết quả giảng dạy."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      actions={
        <>
          <button
            type="button"
            className="ui-button"
            disabled={disabled}
            onClick={() => onOpenModal('import')}
          >
            <Upload size={16} />
            Nhập Excel
          </button>
          <button
            type="button"
            className="ui-button"
            disabled={disabled}
            onClick={() => onOpenModal('exportExcel')}
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
          <button
            type="button"
            className="ui-button"
            disabled={disabled}
            onClick={() => onOpenModal('exportPdf')}
          >
            <FileDown size={16} />
            PDF
          </button>
          <button
            type="button"
            className="ui-button"
            disabled={disabled}
            onClick={() => onOpenModal('printProfile')}
          >
            <Printer size={16} />
            In hồ sơ
          </button>
          <button
            type="button"
            className="ui-button ui-button-primary"
            disabled={disabled}
            onClick={() => onOpenModal('add')}
          >
            <UserPlus size={16} />
            Thêm giáo viên
          </button>
        </>
      }
    />
  )
}
