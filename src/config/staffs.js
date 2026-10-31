export const staffStatus = [
  {
    label: 'Đang làm việc',
    value: 'active',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  {
    label: 'Thử việc',
    value: 'probation',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700'
  },
  {
    label: 'Tạm nghỉ',
    value: 'paused',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  {
    label: 'Đã nghỉ việc',
    value: 'inactive',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700'
  }
]

export const staffFilters = {
  branches: [],
  positions: [],
  departments: [],
  specialties: [],
  statuses: staffStatus,
  dateRanges: ['Hôm nay', '7 ngày tới', 'Tháng này']
}

export const staffTabs = ['Dashboard', 'Danh sách giáo viên', 'Hồ sơ giáo viên']

export const staffDetailTabs = [
  'Thông tin',
  'Chuyên môn',
  'Lớp phụ trách',
  'Lịch giảng dạy',
  'Chấm công',
  'KPI'
]

export const staffModalConfigs = {
  add: {
    title: 'Thêm giáo viên',
    submitText: 'Thêm giáo viên',
    intent: 'form'
  },
  edit: { title: 'Cập nhật giáo viên', submitText: 'Cập nhật', intent: 'form' },
  assignClass: {
    title: 'Phân công lớp',
    submitText: 'Phân công',
    intent: 'assign'
  },
  transferDepartment: {
    title: 'Chuyển bộ phận',
    submitText: 'Chuyển bộ phận',
    intent: 'department'
  },
  updateCertificate: {
    title: 'Cập nhật chứng chỉ',
    submitText: 'Cập nhật chứng chỉ',
    intent: 'certificate'
  },
  import: {
    title: 'Import Excel',
    submitText: 'Import dữ liệu',
    intent: 'import'
  },
  delete: {
    title: 'Xác nhận xóa',
    submitText: 'Xóa giáo viên',
    intent: 'danger'
  },
  updateSpecialty: {
    title: 'Cập nhật chuyên môn',
    submitText: 'Cập nhật',
    intent: 'specialty'
  },
  notify: {
    title: 'Gửi thông báo',
    submitText: 'Gửi thông báo',
    intent: 'message'
  },
  exportExcel: {
    title: 'Export Excel',
    submitText: 'Export Excel',
    intent: 'export'
  },
  exportPdf: {
    title: 'Export PDF',
    submitText: 'Export PDF',
    intent: 'export'
  },
  printProfile: {
    title: 'In hồ sơ giáo viên',
    submitText: 'In hồ sơ',
    intent: 'confirm'
  }
}
