import React, { useState } from 'react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import StaffHeader from '../../components/Staff/StaffHeader.jsx'
import StaffTable from '../../components/Staff/StaffTable.jsx'
import StaffDetail from '../../components/Staff/StaffDetail.jsx'
import StaffModal from '../../components/Staff/StaffModal.jsx'
import {
  staffFilters,
  staffModalConfigs,
  staffTabs,
  staffDetailTabs
} from '../../config/staffs.js'
import {
  createResource,
  updateResource,
  deleteResource,
  initials
} from '../../services/crmApi.js'
import {
  useWorkspace,
  nameOf,
  exportRows
} from '../../services/workspaceApi.js'
import apiClient from '../../services/apiClient.js'
import {
  WorkspaceChart,
  WorkspaceState,
  WorkspaceStats
} from '../../components/common/WorkspaceView.jsx'

export default function StaffPage() {
  const workspace = useWorkspace('staff')
  const [tab, setTab] = useState('Dashboard'),
    [keyword, setKeyword] = useState(''),
    [selectedId, setSelectedId] = useState(''),
    [modal, setModal] = useState(null),
    [modalStaff, setModalStaff] = useState(null),
    [busy, setBusy] = useState(false)
  const d = workspace.data?.data
  const staff = (d?.staff || [])
    .filter((s) => s.type.toLowerCase() === 'teacher')
    .map((s) => ({
      ...s,
      type: 'Giáo viên',
      typeValue: 'teacher',
      avatar: initials(s.name),
      statusValue: s.status,
      status:
        staffFilters.statuses.find((r) => r.value === s.status)?.label ||
        s.status,
      branch: nameOf(d.branch, s.branchId),
      department: nameOf(d.department, s.departmentId),
      position: nameOf(d.position, s.positionId),
      specialty: nameOf(d.specialty, s.specialtyId),
      experience: s.experienceYears == null ? '' : `${s.experienceYears} năm`,
      languages: s.languages?.text || '',
      skills: s.skills?.items || []
    }))
  const selected = staff.find((s) => s.id === selectedId)
  const classes = (d?.classStaff || []).map((link) => {
    const c = d.class.find((c) => c.id === link.classId)
    return {
      id: link.id,
      staffId: link.staffId,
      className: c?.name || '—',
      course: nameOf(d.course, c?.courseId),
      students: d.enrollment.filter(
        (e) => e.classId === link.classId && e.isCurrent
      ).length,
      schedule:
        d.schedule
          .filter(
            (s) => s.classId === link.classId && s.teacherId === link.staffId
          )
          .map((s) => dayjs(s.startAt).format('DD/MM HH:mm'))
          .join(', ') || 'Chưa lên lịch'
    }
  })
  const schedules = (d?.schedule || []).map((s) => ({
    ...s,
    staffId: s.teacherId,
    title: nameOf(d.class, s.classId),
    course: nameOf(d.course, d.class.find((c) => c.id === s.classId)?.courseId),
    date: s.startAt,
    time: `${dayjs(s.startAt).format('HH:mm')} - ${dayjs(s.endAt).format('HH:mm')}`,
    room: nameOf(d.room, s.roomId)
  }))
  const filters = {
    ...staffFilters,
    branches: (d?.branch || []).map((r) => r.name),
    departments: (d?.department || []).map((r) => r.name),
    positions: (d?.position || []).map((r) => r.name),
    specialties: (d?.specialty || []).map((r) => r.name),
    classes: (d?.class || []).map((r) => r.name)
  }
  const close = () => {
    setModal(null)
    setModalStaff(null)
  }
  function open(type, row = selected) {
    if (!d) return
    if (type === 'exportPdf') {
      window.print()
      return
    }
    if (type.toLowerCase().includes('export')) {
      exportRows(staff, 'giao-vien').catch((cause) =>
        toast.error(cause.message)
      )
      return
    }
    if (type.toLowerCase().includes('print')) {
      window.print()
      return
    }
    setModalStaff(row || null)
    setModal(type)
  }
  async function save(type, values, row) {
    if (busy) return
    setBusy(true)
    const id = (key, name) => {
      const result = d[key].find((r) => r.name === name || r.code === name)?.id
      if (!result) throw new Error(`Vui lòng chọn ${key} hợp lệ`)
      return result
    }
    const payloadFor = (values) => ({
      code: values.code || `GV-${Date.now()}`,
      name: values.name,
      type: 'TEACHER',
      branchId: id('branch', values.branch),
      departmentId: values.department
        ? id('department', values.department)
        : null,
      positionId: values.position ? id('position', values.position) : null,
      specialtyId: values.specialty ? id('specialty', values.specialty) : null,
      phone: values.phone || null,
      email: values.email || null,
      status: values.statusValue || 'active',
      startDate: values.startDate || null,
      birthDate: values.birthDate || null,
      gender: values.gender || null,
      citizenId: values.citizenId || null,
      address: values.address || null,
      major: values.major || null,
      degree: values.degree || null,
      experienceYears: values.experience
        ? parseInt(values.experience, 10)
        : null,
      languages: values.languages ? { text: values.languages } : null,
      skills: values.skills
        ? {
            items: Array.isArray(values.skills)
              ? values.skills
              : values.skills
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean)
          }
        : null
    })
    try {
      if (type === 'delete') await deleteResource('staff', row.id)
      else if (['add', 'edit'].includes(type)) {
        const payload = payloadFor(values)
        if (type === 'add') await createResource('staff', payload)
        else await updateResource('staff', row.id, payload)
      } else if (type === 'assignClass')
        await createResource('class-staff', {
          staffId: row.id,
          classId: id('class', values.className),
          role: 'teacher'
        })
      else if (type === 'transferDepartment')
        await updateResource('staff', row.id, {
          departmentId: id('department', values.department)
        })
      else if (type === 'updateSpecialty')
        await updateResource('staff', row.id, {
          specialtyId: id('specialty', values.specialty)
        })
      else if (type === 'updateCertificate')
        await createResource('staff-certificate', {
          staffId: row.id,
          title: values.certificateTitle,
          issuer: values.certificateIssuer || null,
          issuedAt: values.issuedAt || null,
          expiresAt: values.expiresAt || null,
          noExpiration: !values.expiresAt
        })
      else if (staffModalConfigs[type]?.intent === 'message') {
        if (!row) throw new Error('Chọn một giáo viên để gửi thông báo')
        await apiClient.post('/workspace/notify', {
          staffId: row.id,
          title: values.messageTitle,
          content: values.messageContent
        })
      } else if (staffModalConfigs[type]?.intent === 'import') {
        const file = values.file?.[0]
        if (!file) throw new Error('Vui lòng chọn file Excel')
        const XLSX = await import('xlsx'),
          book = XLSX.read(await file.arrayBuffer())
        const imported = XLSX.utils.sheet_to_json(
          book.Sheets[book.SheetNames[0]]
        )
        if (!imported.length || imported.length > 500)
          throw new Error(
            'File cần từ 1 đến 500 dòng, dùng tên cột theo trường: code, name, branch, department, position, email…'
          )
        const prepared = imported.map(payloadFor)
        let saved = 0
        for (const payload of prepared) {
          try {
            await createResource('staff', payload)
            saved++
          } catch (cause) {
            throw new Error(
              `Đã lưu ${saved}/${prepared.length} dòng. Dòng ${saved + 1}: ${cause.message}. Bỏ các dòng đã lưu trước khi nhập lại.`
            )
          }
        }
      } else throw new Error('Vui lòng chọn thao tác hợp lệ')
      toast.success('Đã lưu thay đổi giáo viên')
      close()
      try {
        await workspace.reload()
      } catch {
        toast.warning('Đã lưu, vui lòng tải lại dữ liệu')
      }
    } catch (cause) {
      toast.error(cause.message)
      if (staffModalConfigs[type]?.intent === 'import')
        workspace.reload().catch(() => {})
    } finally {
      setBusy(false)
    }
  }
  const group = (key, rows) =>
    Object.entries(
      rows.reduce((out, s) => {
        out[s[key]] = (out[s[key]] || 0) + 1
        return out
      }, {})
    ).map(([name, value]) => ({ name, value }))
  const kpis = staff.map((s) => {
    const sessions = (d?.schedule || []).filter(
      (r) => r.teacherId === s.id && r.status === 'checked'
    )
    const scores = (d?.score || []).filter(
      (r) => r.teacherId === s.id && Number(r.maxScore) > 0
    )
    const accountIds = (workspace.data?.users || [])
      .filter((u) => u.staffId === s.id)
      .map((u) => u.id)
    const saved =
      workspace.data?.records.find(
        (r) => r.kind === 'staff-kpi' && r.content.staffId === s.id
      )?.content || {}
    return {
      ...saved,
      staffId: s.id,
      teachingHours: sessions.reduce(
        (n, r) => n + (new Date(r.endAt) - new Date(r.startAt)) / 3600000,
        0
      ),
      classes: classes.filter((c) => c.staffId === s.id).length,
      students: new Set(
        (d?.enrollment || [])
          .filter(
            (e) =>
              e.isCurrent &&
              d.classStaff.some(
                (c) => c.staffId === s.id && c.classId === e.classId
              )
          )
          .map((e) => e.studentId)
      ).size,
      homeworkMarked: (d?.homeworkSubmission || []).filter(
        (r) => r.score != null && accountIds.includes(r.markedBy)
      ).length,
      averageScore: scores.length
        ? (
            scores.reduce(
              (n, r) => n + (Number(r.score) / Number(r.maxScore)) * 10,
              0
            ) / scores.length
          ).toFixed(2)
        : null
    }
  })
  return (
    <div className="space-y-6">
      <StaffHeader
        activeTab={tab}
        onTabChange={setTab}
        tabs={staffTabs}
        onOpenModal={open}
        disabled={workspace.loading || !d}
      />
      <WorkspaceState {...workspace} />
      {d &&
        (tab === 'Dashboard' ? (
          <>
            <WorkspaceStats
              items={[
                ['Tổng giáo viên', staff.length],
                [
                  'Đang làm việc',
                  staff.filter((s) => s.statusValue === 'active').length
                ],
                [
                  'Ngừng làm việc',
                  staff.filter((s) => s.statusValue === 'inactive').length,
                  'neutral'
                ],
                [
                  'Lượt phân công lớp',
                  classes.filter((c) => staff.some((s) => s.id === c.staffId))
                    .length
                ]
              ]}
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <WorkspaceChart
                title="Giáo viên theo bộ phận"
                rows={group('department', staff)}
              />
              <WorkspaceChart
                title="Giáo viên theo chuyên môn"
                rows={group('specialty', staff)}
              />
            </div>
          </>
        ) : tab === 'Danh sách giáo viên' ? (
          <StaffTable
            staffs={staff}
            filters={filters}
            keyword={keyword}
            onKeywordChange={setKeyword}
            onSelectStaff={(s) => {
              setSelectedId(s.id)
              setTab('Hồ sơ giáo viên')
            }}
            onOpenModal={open}
          />
        ) : selected ? (
          <StaffDetail
            staff={selected}
            tabs={staffDetailTabs}
            managedClasses={classes}
            teachingSchedules={schedules}
            attendanceData={workspace.data.records
              .filter((r) => r.kind === 'staff-attendance')
              .map((r) => ({ ...r.content, id: r.id }))}
            teacherKPIs={kpis}
            certificates={d.staffCertificate}
            onOpenModal={open}
          />
        ) : (
          <p className="rounded-xl bg-white p-6 text-sm text-slate-500">
            Chọn giáo viên từ danh sách để xem hồ sơ.
          </p>
        ))}
      <StaffModal
        modal={modal}
        config={staffModalConfigs[modal]}
        staff={modalStaff}
        filters={filters}
        onClose={busy ? () => {} : close}
        onSubmit={save}
      />
    </div>
  )
}
