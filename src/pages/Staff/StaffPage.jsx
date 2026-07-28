import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import StaffDashboard from '../../components/Staff/StaffDashboard.jsx'
import StaffDetail from '../../components/Staff/StaffDetail.jsx'
import StaffHeader from '../../components/Staff/StaffHeader.jsx'
import StaffModal from '../../components/Staff/StaffModal.jsx'
import StaffTable from '../../components/Staff/StaffTable.jsx'
import {
  accounts,
  attendanceData,
  certificates,
  managedClasses,
  staffCharts,
  staffDetailTabs,
  staffFilters,
  staffGroups,
  staffModalConfigs,
  staffs,
  staffStatistics,
  staffTabs,
  teacherKPIs,
  teachingSchedules,
} from '../../datas/staffs.js'

function StaffPage() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [activeGroup, setActiveGroup] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [staffItems, setStaffItems] = useState(staffs)
  const [selectedStaff, setSelectedStaff] = useState(staffs[0])
  const [modal, setModal] = useState(null)
  const [modalStaff, setModalStaff] = useState(null)

  const filteredStaffs = useMemo(() => {
    return staffItems.filter((item) => {
      if (activeGroup === 'teacher' && item.typeValue !== 'teacher') return false
      if (activeGroup === 'staff' && item.typeValue !== 'staff') return false
      if (activeGroup === 'account') return accounts.some((account) => account.staffId === item.id)
      return true
    })
  }, [activeGroup, staffItems])

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff)
    setActiveTab('Hồ sơ nhân sự')
  }

  const openModal = (type, staff = selectedStaff) => {
    setModal(type)
    setModalStaff(type === 'add' ? null : staff)
  }

  const closeModal = () => {
    setModal(null)
    setModalStaff(null)
  }

  const buildStaffFromValues = (values, sourceStaff) => {
    const status = staffFilters.statuses.find((item) => item.value === values.statusValue)
    const typeValue = values.type === 'Giáo viên' ? 'teacher' : 'staff'
    const avatar = values.name
      ? values.name
          .split(' ')
          .slice(-2)
          .map((part) => part[0])
          .join('')
          .toUpperCase()
      : 'NS'

    return {
      ...(sourceStaff || {}),
      id: sourceStaff?.id || `STF${Date.now()}`,
      code: values.code || sourceStaff?.code || `NS${Date.now().toString().slice(-4)}`,
      avatar,
      name: values.name || sourceStaff?.name || 'Nhân sự mới',
      type: values.type || sourceStaff?.type || 'Nhân viên',
      typeValue,
      position: values.position || sourceStaff?.position || 'Nhân viên',
      specialty: values.specialty || sourceStaff?.specialty || 'General',
      department: values.department || sourceStaff?.department || 'Vận hành',
      phone: values.phone || sourceStaff?.phone || '',
      email: values.email || sourceStaff?.email || '',
      status: status?.label || sourceStaff?.status || 'Đang làm việc',
      statusValue: values.statusValue || sourceStaff?.statusValue || 'active',
      startDate: values.startDate || sourceStaff?.startDate || '',
      birthDate: values.birthDate || sourceStaff?.birthDate || '',
      gender: values.gender || sourceStaff?.gender || '',
      citizenId: values.citizenId || sourceStaff?.citizenId || '',
      address: values.address || sourceStaff?.address || '',
      major: values.major || sourceStaff?.major || '',
      degree: values.degree || sourceStaff?.degree || '',
      experience: values.experience || sourceStaff?.experience || '',
      languages: values.languages || sourceStaff?.languages || '',
      skills: values.skills ? values.skills.split(',').map((item) => item.trim()).filter(Boolean) : sourceStaff?.skills || [],
    }
  }

  const handleModalSubmit = (type, values, staff) => {
    if (type === 'add') {
      const nextStaff = buildStaffFromValues(values, null)
      setStaffItems((items) => [...items, nextStaff])
      setSelectedStaff(nextStaff)
      toast.success('Đã thêm nhân sự')
    } else if (type === 'edit') {
      const nextStaff = buildStaffFromValues(values, staff)
      setStaffItems((items) => items.map((item) => (item.id === staff.id ? nextStaff : item)))
      setSelectedStaff(nextStaff)
      toast.success('Đã cập nhật nhân sự')
    } else if (type === 'delete') {
      setStaffItems((items) => items.filter((item) => item.id !== staff.id))
      setSelectedStaff((current) => current?.id === staff.id ? staffItems.find((item) => item.id !== staff.id) || staffs[0] : current)
      toast.success('Đã xóa nhân sự')
    } else if (type === 'transferDepartment') {
      setStaffItems((items) => items.map((item) => item.id === staff.id ? { ...item, department: values.department } : item))
      setSelectedStaff((current) => current?.id === staff.id ? { ...current, department: values.department } : current)
      toast.success('Đã chuyển bộ phận')
    } else if (type === 'updateSpecialty') {
      setStaffItems((items) => items.map((item) => item.id === staff.id ? { ...item, specialty: values.specialty } : item))
      setSelectedStaff((current) => current?.id === staff.id ? { ...current, specialty: values.specialty } : current)
      toast.success('Đã cập nhật chuyên môn')
    } else if (type === 'assignClass') {
      toast.success('Đã phân công lớp')
    } else if (type === 'updateCertificate') {
      toast.success('Đã cập nhật chứng chỉ')
    } else if (type === 'resetPassword') {
      toast.success('Đã reset mật khẩu')
    } else if (type === 'lockAccount') {
      toast.success('Đã khóa tài khoản')
    } else if (type === 'unlockAccount') {
      toast.success('Đã mở khóa tài khoản')
    } else if (type === 'import') {
      toast.success('Đã import dữ liệu mẫu')
    } else if (type === 'exportExcel') {
      toast.success('Đã export Excel')
    } else if (type === 'exportPdf') {
      toast.success('Đã export PDF')
    } else if (type === 'printProfile') {
      toast.success('Đã gửi hồ sơ sang hàng đợi in')
    } else if (type === 'email') {
      toast.success('Đã gửi Email')
    } else if (type === 'notify') {
      toast.success('Đã gửi thông báo')
    }

    closeModal()
  }

  return (
    <div className="space-y-5">
      <StaffHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeGroup={activeGroup}
        onGroupChange={setActiveGroup}
        groups={staffGroups}
        tabs={staffTabs}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onOpenModal={openModal}
      />

      {activeTab === 'Dashboard' ? (
        <StaffDashboard statistics={staffStatistics} charts={staffCharts} staffs={filteredStaffs} />
      ) : null}

      {activeTab === 'Danh sách nhân sự' ? (
        <StaffTable
          staffs={filteredStaffs}
          filters={staffFilters}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelectStaff={handleSelectStaff}
          onOpenModal={openModal}
        />
      ) : null}

      {activeTab === 'Hồ sơ nhân sự' ? (
        <StaffDetail
          staff={selectedStaff}
          tabs={staffDetailTabs}
          managedClasses={managedClasses}
          teachingSchedules={teachingSchedules}
          attendanceData={attendanceData}
          teacherKPIs={teacherKPIs}
          certificates={certificates}
          accounts={accounts}
          onOpenModal={openModal}
        />
      ) : null}

      <StaffModal
        modal={modal}
        config={staffModalConfigs[modal]}
        staff={modalStaff}
        filters={staffFilters}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  )
}

export default StaffPage
