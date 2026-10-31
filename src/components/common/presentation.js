const statuses = {
  student: {
    active: ['Đang học', 'success'],
    trial: ['Học thử', 'purple'],
    potential: ['Tiềm năng', 'info'],
    reserved: ['Bảo lưu', 'warning'],
    stopped: ['Nghỉ học', 'danger'],
    transferred: ['Đã chuyển lớp', 'neutral']
  },
  staff: {
    active: ['Đang làm việc', 'success'],
    probation: ['Thử việc', 'info'],
    paused: ['Tạm nghỉ', 'warning'],
    inactive: ['Đã nghỉ việc', 'neutral']
  },
  course: {
    recruiting: ['Đang tuyển sinh', 'success'],
    active: ['Đang hoạt động', 'success'],
    paused: ['Tạm dừng', 'warning'],
    finished: ['Đã kết thúc', 'neutral']
  },
  class: {
    active: ['Đang học', 'success'],
    upcoming: ['Sắp mở', 'info'],
    full: ['Đã đủ sĩ số', 'warning'],
    finished: ['Đã kết thúc', 'neutral'],
    cancelled: ['Đã hủy', 'danger']
  },
  account: {
    ACTIVE: ['Hoạt động', 'success'],
    INACTIVE: ['Ngừng hoạt động', 'neutral'],
    locked: ['Tạm khóa', 'danger'],
    missing: ['Chưa tạo', 'neutral']
  },
  schedule: {
    active: ['Đang học', 'info'],
    upcoming: ['Sắp diễn ra', 'warning'],
    checked: ['Đã điểm danh', 'success'],
    conflict: ['Trùng lịch', 'danger'],
    cancelled: ['Đã hủy', 'neutral'],
    makeup: ['Học bù', 'purple']
  },
  general: {
    active: ['Hoạt động', 'success'],
    inactive: ['Tạm dừng', 'neutral'],
    completed: ['Hoàn thành', 'success'],
    cancelled: ['Đã hủy', 'neutral'],
    paid: ['Đã thanh toán', 'success'],
    partial: ['Thanh toán một phần', 'warning'],
    debt: ['Còn nợ', 'warning'],
    overdue: ['Quá hạn', 'danger'],
    successful: ['Thành công', 'success']
  }
}
export function statusInfo(value, context = 'general') {
  const key = String(value ?? '')
  const group = statuses[context]
  return group && Object.hasOwn(group, key)
    ? group[key]
    : Object.hasOwn(statuses.general, key)
      ? statuses.general[key]
      : [key || 'Chưa cập nhật', 'neutral']
}

export const chartStyle = {
  grid: 'var(--ui-border)',
  axis: { fontSize: 11, fill: 'var(--ui-secondary)' },
  tooltip: {
    borderRadius: 12,
    border: '1px solid var(--ui-border)',
    background: 'var(--ui-surface)',
    color: 'var(--ui-ink)',
    boxShadow: '0 8px 24px #0f172a14',
    fontSize: 12,
    padding: '12px 16px'
  }
}

export const chartPalette = ['blue', 'green', 'orange', 'purple', 'cyan', 'red'].map(name => 'var(--ui-chart-' + name + ')')
export const toneColors = { info: chartPalette[0], success: chartPalette[1], warning: chartPalette[2], purple: chartPalette[3], cyan: chartPalette[4], danger: chartPalette[5], neutral: 'var(--ui-secondary)' }
export function statusColor(value, context = 'general') { return toneColors[statusInfo(value, context)[1]] || toneColors.neutral }

// Categorical series use the palette; known status labels keep their semantic tone.
export function categoryColor(value, index = 0, context = 'general') {
  const group = statuses[context] || statuses.general
  const entry = group[value] || Object.values(group).find(([label]) => label === value) || statuses.general[value]
  return entry ? toneColors[entry[1]] : chartPalette[index % chartPalette.length]
}
