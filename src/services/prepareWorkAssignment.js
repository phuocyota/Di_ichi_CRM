export async function prepareWorkAssignment({ branchId, date, loadSchedule, loadEmployees }) {
  if (!branchId) throw new Error('Vui lòng chọn cơ sở để tải dữ liệu phân lịch.')
  const results = await Promise.allSettled([loadSchedule(), loadEmployees()])
  const failed = results.find(result => result.status === 'rejected')
  if (failed) throw failed.reason
  const [bundle, directory] = results.map(result => result.value)
  const { schedule, configuration } = bundle || {}
  if (!directory || !configuration) throw new Error('Yêu cầu tải dữ liệu đã thay đổi. Vui lòng bấm Thêm phân lịch để thử lại.')
  if ((schedule && schedule.branchId !== branchId) || configuration.branchId !== branchId) throw new Error('Cơ sở đã thay đổi. Vui lòng tải lại dữ liệu phân lịch.')
  if (!Array.isArray(directory.employees) || !Array.isArray(configuration.shifts)) throw new Error('API chưa trả đủ danh sách nhân viên và ca làm.')
  if (schedule && schedule.revision !== configuration.revision) throw new Error('Ca làm vừa thay đổi. Vui lòng bấm Thêm phân lịch để tải cùng phiên bản mới nhất.')
  if (!directory.employees.some(person => person.branchId === branchId)) throw new Error('Cơ sở chưa có nhân viên CSKH/Sale hợp lệ để phân lịch.')
  const shift = configuration.shifts[0]
  if (!shift) throw new Error('Cơ sở chưa có ca làm. Vui lòng cấu hình ca trước khi phân lịch.')
  return { kind: 'employee', personId: '', branchId, date, shiftId: shift.id, start: shift.start, end: shift.end }
}
