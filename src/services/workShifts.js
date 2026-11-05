import { createWorkShifts } from '../datas/workSchedules.js'

const validTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value)

export function fixedWorkShifts(shifts, branchId) {
  return createWorkShifts([{ id: branchId }]).map(defaultShift => {
    const saved = shifts.find(shift => shift.id === defaultShift.id && shift.branchId === branchId && !shift.deletedAt)
    return { ...defaultShift, ...saved, name: defaultShift.name }
  })
}

export function configureWorkShifts(data, branchId, values, branches) {
  if (!branches.some(branch => branch.id === branchId)) throw new Error('Chọn cơ sở hợp lệ để cấu hình ca làm.')
  const expected = createWorkShifts([{ id: branchId }])
  if (values.length < 2 || expected.some(shift => values.filter(value => value.id === shift.id && value.branchId === branchId).length !== 1)) throw new Error('Cần cấu hình đủ Ca sáng và Ca tối của cơ sở.')
  const names = new Set(), seenIds = new Set()
  const configured = values.map(value => {
    const existing = data.shifts.find(shift => shift.id === value.id)
    if (!value.id || seenIds.has(value.id) || value.branchId !== branchId || (existing && existing.branchId !== branchId)) throw new Error('Ca làm không hợp lệ hoặc thuộc cơ sở khác.')
    seenIds.add(value.id)
    const shift = expected.find(shift => shift.id === value.id) || { id: value.id, branchId, name: value.name?.trim() }
    if (!shift.name || shift.name.length > 100) throw new Error('Nhập tên ca làm từ 1 đến 100 ký tự.')
    const name = shift.name.toLocaleLowerCase('vi')
    if (names.has(name)) throw new Error('Tên ca làm không được trùng trong cùng cơ sở.')
    names.add(name)
    if (!validTime(value.start) || !validTime(value.end) || value.start >= value.end) throw new Error(`${shift.name}: giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.`)
    return { ...shift, start: value.start, end: value.end, source: 'custom' }
  })
  const ids = new Set(configured.map(shift => shift.id))
  return { ...data, shifts: [...data.shifts.filter(shift => !ids.has(shift.id)), ...configured] }
}

export function configuredWorkShifts(shifts, branchId) {
  const fixed = fixedWorkShifts(shifts, branchId)
  return [...fixed, ...shifts.filter(shift => shift.branchId === branchId && !shift.deletedAt && !fixed.some(item => item.id === shift.id))]
}
