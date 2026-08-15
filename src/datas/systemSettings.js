import { accounts, staffs, staffStatus } from './staffs.js'

const staffMap = Object.fromEntries(staffs.map((item) => [item.id, item]))

export const systemSettingTabs = [
  { key: 'employees', label: 'Nhân viên' },
  { key: 'permissions', label: 'Phân quyền' },
]

export const systemModules = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'students', label: 'Học viên' },
  { key: 'courses', label: 'Khóa học' },
  { key: 'classes', label: 'Lớp học' },
  { key: 'attendance', label: 'Điểm danh' },
  { key: 'tuition', label: 'Học phí' },
  { key: 'debt', label: 'Công nợ' },
  { key: 'reports', label: 'Báo cáo' },
  { key: 'system-settings', label: 'Cài đặt hệ thống' },
]

export const roleDefinitions = [
  { id: 'role-super-admin', code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Toàn quyền', staffIds: ['STF007', 'STF001'], status: 'Đang hoạt động' },
  { id: 'role-admin', code: 'ADMIN', name: 'Admin', description: 'Quản lý trung tâm', staffIds: ['STF005'], status: 'Đang hoạt động' },
  { id: 'role-accountant', code: 'ACCOUNTANT', name: 'Kế toán', description: 'Quản lý tài chính', staffIds: ['STF007'], status: 'Đang hoạt động' },
  { id: 'role-sale', code: 'SALE', name: 'Sale', description: 'Tuyển sinh', staffIds: ['STF006'], status: 'Đang hoạt động' },
  { id: 'role-academic', code: 'ACADEMIC', name: 'Giáo vụ', description: 'Quản lý lớp học', staffIds: ['STF005'], status: 'Đang hoạt động' },
  { id: 'role-teacher', code: 'TEACHER', name: 'Giáo viên', description: 'Giảng dạy', staffIds: ['STF001', 'STF002', 'STF003', 'STF004'], status: 'Đang hoạt động' },
]

export const permissionActions = ['view', 'create', 'update', 'delete', 'approve', 'export']

export const permissionActionLabels = {
  view: 'Xem',
  create: 'Thêm',
  update: 'Sửa',
  delete: 'Xóa',
  approve: 'Duyệt',
  export: 'Xuất Excel',
}

export const permissionMatrix = [
  { moduleKey: 'dashboard', permissions: ['view'] },
  { moduleKey: 'students', permissions: ['view', 'create', 'update', 'delete', 'export'] },
  { moduleKey: 'courses', permissions: ['view', 'create', 'update', 'delete', 'export'] },
  { moduleKey: 'classes', permissions: ['view', 'create', 'update', 'delete', 'export'] },
  { moduleKey: 'attendance', permissions: ['view', 'update'] },
  { moduleKey: 'tuition', permissions: ['view', 'create', 'update', 'approve', 'export'] },
  { moduleKey: 'debt', permissions: ['view', 'update', 'approve', 'export'] },
  { moduleKey: 'reports', permissions: ['view', 'export'] },
  { moduleKey: 'system-settings', permissions: ['view', 'create', 'update', 'delete'] },
]

export const auditLogs = [
  { id: 'audit-001', actor: 'Võ Thanh Tùng', action: 'Cập nhật quyền Kế toán', target: 'role-accountant', changedAt: '2026-08-14 09:15' },
  { id: 'audit-002', actor: 'Hoàng Bảo Ngọc', action: 'Gán nhân viên vào vai trò Sale', target: 'role-sale', changedAt: '2026-08-13 16:40' },
  { id: 'audit-003', actor: 'Đỗ Anh Khoa', action: 'Sao chép quyền Giáo vụ', target: 'role-academic', changedAt: '2026-08-12 11:05' },
]

export const employeeRows = staffs.map((staff) => {
  const account = accounts.find((item) => item.staffId === staff.id)
  const role = roleDefinitions.find((item) => item.staffIds.includes(staff.id))
  const status = staffStatus.find((item) => item.value === staff.statusValue)

  return {
    id: staff.id,
    code: staff.code,
    name: staff.name,
    type: staff.type,
    gender: staff.gender,
    birthDate: staff.birthDate,
    citizenId: staff.citizenId,
    address: staff.address,
    position: staff.position,
    department: staff.department,
    branch: staff.department === 'Đào tạo' ? 'Cơ sở Quận 1' : staff.department === 'Tư vấn' ? 'Cơ sở Thủ Đức' : 'Cơ sở Quận 7',
    manager: staff.typeValue === 'teacher' ? 'Đỗ Anh Khoa' : 'Võ Thanh Tùng',
    phone: staff.phone,
    email: staff.email,
    status: status?.label || staff.status,
    statusValue: staff.statusValue,
    roleId: role?.id || '',
    roleName: role?.name || account?.role || 'Chưa phân quyền',
    username: account?.username || 'Chưa tạo',
    accountStatus: account?.status || 'Chưa tạo',
    avatar: staff.avatar,
    lastLogin: account?.lastLogin || '-',
    startDate: staff.startDate,
  }
})

export const permissionRows = roleDefinitions.map((role) => ({
  ...role,
  staffNames: role.staffIds.map((staffId) => staffMap[staffId]?.name || staffId).join(', '),
  staffCount: role.staffIds.length,
  permissionLabels: permissionMatrix
    .filter((item) => role.id === 'role-super-admin' || item.moduleKey !== 'system-settings')
    .map((item) => systemModules.find((module) => module.key === item.moduleKey)?.label || item.moduleKey)
    .join(', '),
  permissionCount: role.id === 'role-super-admin' ? permissionMatrix.length : permissionMatrix.length - 1,
}))
