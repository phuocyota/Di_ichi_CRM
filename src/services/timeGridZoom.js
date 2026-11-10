export const ZOOM_LEVELS = Object.freeze([
  Object.freeze({ id: 1, label: 'Mỗi 2 giờ', slotMinutes: 120, slotHeight: 120, duration: Object.freeze({ minutes: 120 }) }),
  Object.freeze({ id: 2, label: 'Mỗi 1 giờ', slotMinutes: 60, slotHeight: 120, duration: Object.freeze({ minutes: 60 }) }),
  Object.freeze({ id: 3, label: 'Mỗi 30 phút', slotMinutes: 30, slotHeight: 120, duration: Object.freeze({ minutes: 30 }) }),
])
export const DEFAULT_ZOOM_INDEX = 0
export const WHEEL_ZOOM_THRESHOLD = 80
export const WHEEL_ZOOM_COOLDOWN_MS = 300
export const WHEEL_ZOOM_IDLE_MS = 200
export const TIME_GRID_SNAP_MINUTES = 15

export const clampZoomIndex = value => Number.isFinite(value) ? Math.max(0, Math.min(ZOOM_LEVELS.length - 1, Math.trunc(value))) : DEFAULT_ZOOM_INDEX
export const minutesToTime = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:00`
export function timeToMinutes(time) {
  const match = /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/.exec(String(time || ''))
  if (!match || Number(match[1]) > 24 || (Number(match[1]) === 24 && Number(match[2]) > 0)) return null
  return Number(match[1]) * 60 + Number(match[2]) + Number(match[3] || 0) / 60
}
export function workTimeRange(assignments, shifts = []) {
  // Ô cuối bắt đầu lúc 21:00 và kết thúc 23:00; các nhãn neo từ 07:00.
  let start = 7 * 60, end = 23 * 60
  for (const item of [...assignments, ...shifts]) {
    const from = timeToMinutes(item.start), to = timeToMinutes(item.end)
    if (from === null || to === null || to <= from) continue
    start = Math.min(start, Math.max(0, 7 * 60 - Math.ceil((7 * 60 - from) / ZOOM_LEVELS[0].slotMinutes) * ZOOM_LEVELS[0].slotMinutes))
    end = Math.max(end, Math.min(24 * 60, 7 * 60 + Math.ceil((to - 7 * 60) / ZOOM_LEVELS[0].slotMinutes) * ZOOM_LEVELS[0].slotMinutes))
  }
  return { start, end }
}

export function workAssignmentFromCalendarChange(assignment, start, end, expectedRevision) {
  if (!(start instanceof Date) || !(end instanceof Date) || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) throw new Error('Thời gian ca không hợp lệ.')
  const from = start.toISOString(), to = end.toISOString()
  if (from.slice(0, 10) !== to.slice(0, 10)) throw new Error('Ca làm phải bắt đầu và kết thúc trong cùng ngày.')
  return { ...assignment, date: from.slice(0, 10), start: from.slice(11, 16), end: to.slice(11, 16), expectedRevision }
}
export function workCalendarEvents(assignments, people) {
  const names = new Map(people.map(person => [person.id, person.name]))
  return assignments.map(item => ({
    id: item.id, title: names.get(item.personId) || item.personName || item.personId,
    start: `${item.date}T${item.start}`, end: `${item.date}T${item.end}`,
    backgroundColor: item.employeeType === 'cskh' ? '#0f766e' : '#2563eb',
    borderColor: item.employeeType === 'cskh' ? '#0f766e' : '#2563eb',
    extendedProps: { assignment: { ...item } },
  }))
}
export function workDayOffEvents(preferences, people) {
  const names = new Map(people.map(person => [person.id, person.name]))
  return preferences.filter(item => item.shiftId === 'OFF').map(item => ({
    id: `off:${item.personId}:${item.date}`, title: `OFF · ${names.get(item.personId) || item.personId}`,
    start: item.date, allDay: true, editable: false, backgroundColor: '#64748b', borderColor: '#64748b',
    extendedProps: { dayOff: { personId: item.personId, date: item.date, branchId: item.branchId } },
  }))
}
export function normalizeWheelDelta(deltaY, deltaMode, viewportHeight) {
  return deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? viewportHeight : 1)
}
export function processTimeGridWheel(event, state, { isBlocked, zoomTo, viewportHeight, now = () => performance.now() }) {
  if (!event.ctrlKey && !event.metaKey) { state.delta = 0; state.lastWheelAt = undefined; return false }
  if (!event.deltaY || !event.cancelable) return false
  event.preventDefault()
  if (isBlocked()) { state.delta = 0; return true }
  // Chờ cấp đã yêu cầu hiển thị xong trước khi nhận cấp kế tiếp.
  if (state.frame != null || (state.level !== undefined && state.target !== state.level)) { state.delta = 0; return true }
  const timestamp = now()
  if (state.lastWheelAt === undefined || timestamp - state.lastWheelAt > WHEEL_ZOOM_IDLE_MS) state.delta = 0
  state.lastWheelAt = timestamp
  // Không tích lũy quán tính trackpad trong thời gian chờ giữa hai lần đổi cấp.
  if (timestamp - (state.lastZoomAt ?? -Infinity) < WHEEL_ZOOM_COOLDOWN_MS) { state.delta = 0; return true }
  const delta = normalizeWheelDelta(event.deltaY, event.deltaMode, viewportHeight)
  if (Math.sign(delta) !== Math.sign(state.delta)) state.delta = 0
  state.delta += delta
  const threshold = event.deltaMode === 1 ? 48 : WHEEL_ZOOM_THRESHOLD
  if (Math.abs(state.delta) >= threshold) {
    const next = clampZoomIndex(state.target + (state.delta < 0 ? 1 : -1))
    state.delta = 0
    if (next !== state.target) {
      state.lastZoomAt = timestamp
      // Một sự kiện wheel chỉ đổi tối đa một cấp, dù delta rất lớn.
      zoomTo(next, event.clientY)
    }
  }
  return true
}
export function anchoredScrollTop(scrollTop, newGridTop, newGridHeight, fraction, clientY, maxScroll) {
  return Math.max(0, Math.min(maxScroll, scrollTop + newGridTop + newGridHeight * fraction - clientY))
}
