import { useCallback, useEffect, useMemo, useState } from 'react'
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
  staffDetailTabs,
  staffFilters,
  staffGroups,
  staffModalConfigs,
  staffStatistics,
  staffTabs,
  teacherKPIs,
  teachingSchedules,
} from '../../datas/staffs.js'
import { createResource, deleteResource, findIdByName, getStaffSummary, indexById, initials, listResource, loadResources, updateResource } from '../../services/crmApi.js'

let staffSummaryRequest

function requestStaffSummary() {
  if (!staffSummaryRequest) {
    staffSummaryRequest = getStaffSummary().finally(() => {
      staffSummaryRequest = null
    })
  }
  return staffSummaryRequest
}

const emptyStaffSummary = {
  statistics: staffStatistics.map((item) => ({ ...item, value: 0 })),
  charts: { departments: [], specialties: [], monthlyKpi: [], kpiCompletion: [] },
  staffsNeedAttention: [],
}

function StaffPage() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [activeGroup, setActiveGroup] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [staffItems, setStaffItems] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [staffDataLoaded, setStaffDataLoaded] = useState(false)
  const [staffSummary, setStaffSummary] = useState(emptyStaffSummary)
  const [modal, setModal] = useState(null)
  const [modalStaff, setModalStaff] = useState(null)
  const [directories, setDirectories] = useState({})

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

  const openModal = async (type, staff = selectedStaff) => {
    try {
      const availableStaffs = staffDataLoaded ? staffItems : await refreshStaffs()
      setModal(type)
      setModalStaff(type === 'add' ? null : (staff || availableStaffs?.[0] || null))
    } catch (error) {
      toast.error(error.message)
    }
  }

  const closeModal = () => {
    setModal(null)
    setModalStaff(null)
  }

  const refreshStaffs = useCallback(async (force = false) => {
    if (!force && staffDataLoaded) return staffItems

    const result = await loadResources(['staff', 'branch', 'department', 'position', 'specialty'])
    const branches = indexById(result.branch)
    const departments = indexById(result.department)
    const positions = indexById(result.position)
    const specialties = indexById(result.specialty)
    const mapped = result.staff.map((item) => {
      const status = staffFilters.statuses.find((entry) => entry.value === item.status)
      return {
        ...item,
        avatar: initials(item.name),
        type: item.type === 'teacher' ? 'Giáo viên' : 'Nhân viên',
        typeValue: item.type,
        branch: branches[item.branchId]?.name || item.branchId,
        department: departments[item.departmentId]?.name || '—',
        position: positions[item.positionId]?.name || '—',
        specialty: specialties[item.specialtyId]?.name || '—',
        status: status?.label || item.status,
        statusValue: item.status,
        experience: item.experienceYears ? `${item.experienceYears} năm` : '',
        languages: item.languages?.text || '',
        skills: item.skills?.items || [],
      }
    })
    setDirectories(result)
    setStaffItems(mapped)
    setSelectedStaff((current) => mapped.find((item) => item.id === current?.id) || mapped[0] || null)
    setStaffDataLoaded(true)
    return mapped
  }, [staffDataLoaded, staffItems])

  useEffect(() => {
    requestStaffSummary()
      .then((result) => {
        const statistics = result?.statistics || {}
        const values = [
          statistics.totalStaff ?? 0,
          statistics.teachers ?? 0,
          statistics.employees ?? 0,
          statistics.activeStaff ?? 0,
          statistics.inactiveStaff ?? 0,
        ]
        const attention = (result?.staffsNeedAttention || []).map((item) => {
          const status = staffFilters.statuses.find((entry) => entry.value === item.status)
          return {
            ...item,
            status: status?.label || item.status,
            statusValue: item.status,
          }
        })

        setStaffSummary({
          statistics: staffStatistics.map((item, index) => ({ ...item, value: values[index] })),
          charts: {
            departments: result?.charts?.departments || [],
            specialties: result?.charts?.specialties || [],
            monthlyKpi: result?.charts?.monthlyKpi || [],
            kpiCompletion: result?.charts?.kpiCompletion || [],
          },
          staffsNeedAttention: attention,
        })
      })
      .catch((error) => toast.error(`Không tải được tổng quan nhân sự: ${error.message}`))
  }, [])

  useEffect(() => {
    if (activeTab !== 'Dashboard' && !staffDataLoaded) {
      refreshStaffs().catch((error) => toast.error(`Không tải được nhân sự từ API: ${error.message}`))
    }
  }, [activeTab, refreshStaffs, staffDataLoaded])

  const handleModalSubmit = async (type, values, staff) => {
    try {
      if (type === 'delete') {
        await deleteResource('staff', staff.id)
      } else if (['add', 'edit'].includes(type)) {
        const formValues = values
        const payload = {
          code: formValues.code || `NS-${Date.now()}`,
          branchId: findIdByName(directories.branch, formValues.branch),
          departmentId: findIdByName(directories.department, formValues.department),
          positionId: findIdByName(directories.position, formValues.position),
          specialtyId: findIdByName(directories.specialty, formValues.specialty),
          name: formValues.name,
          type: formValues.type === 'Giáo viên' ? 'teacher' : (formValues.typeValue || 'staff'),
          phone: formValues.phone || undefined,
          email: formValues.email || undefined,
          status: formValues.statusValue || 'active',
          startDate: formValues.startDate || undefined,
          birthDate: formValues.birthDate || undefined,
          gender: formValues.gender || undefined,
          citizenId: formValues.citizenId || undefined,
          address: formValues.address || undefined,
          major: formValues.major || undefined,
          degree: formValues.degree || undefined,
          experienceYears: Number.parseInt(formValues.experience, 10) || undefined,
          languages: formValues.languages ? { text: formValues.languages } : undefined,
          skills: formValues.skills ? { items: typeof formValues.skills === 'string' ? formValues.skills.split(',').map((item) => item.trim()).filter(Boolean) : formValues.skills } : undefined,
        }
        if (type === 'add') await createResource('staff', payload)
        else await updateResource('staff', staff.id, payload)
      } else if (type === 'assignClass') {
        const classId = findIdByName(await listResource('class'), values.className)
        await createResource('class-staff', { classId, staffId: staff.id, role: 'teacher' })
      } else if (type === 'transferDepartment') {
        await updateResource('staff', staff.id, { departmentId: findIdByName(directories.department, values.department) })
      } else if (type === 'updateSpecialty') {
        await updateResource('staff', staff.id, { specialtyId: findIdByName(directories.specialty, values.specialty) })
      } else if (type === 'updateCertificate') {
        await createResource('staff-certificate', { staffId: staff.id, title: values.certificateTitle, issuer: values.certificateIssuer || undefined, issuedAt: values.issuedAt || undefined, expiresAt: values.expiresAt || undefined })
      } else {
        toast.info('Tác vụ này chưa có contract API tương ứng')
        closeModal()
        return
      }
      await refreshStaffs(true)
      toast.success(type === 'delete' ? 'Đã xóa nhân sự' : 'Đã lưu thay đổi nhân sự')
      closeModal()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const effectiveFilters = {
    ...staffFilters,
    branches: directories.branch?.map((item) => item.name) || staffFilters.branches,
    positions: directories.position?.map((item) => item.name) || staffFilters.positions,
    departments: directories.department?.map((item) => item.name) || staffFilters.departments,
    specialties: directories.specialty?.map((item) => item.name) || staffFilters.specialties,
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
        <StaffDashboard
          statistics={staffSummary.statistics}
          charts={staffSummary.charts}
          staffs={staffSummary.staffsNeedAttention}
        />
      ) : null}

      {activeTab === 'Danh sách nhân sự' ? (
        <StaffTable
          staffs={filteredStaffs}
          filters={effectiveFilters}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelectStaff={handleSelectStaff}
          onOpenModal={openModal}
        />
      ) : null}

      {activeTab === 'Hồ sơ nhân sự' && selectedStaff ? (
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
        filters={effectiveFilters}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  )
}

export default StaffPage
