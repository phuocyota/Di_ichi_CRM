const timeValue = (value) => {
  const [hour, minute] = value.split(':').map(Number)
  if (hour > 23 || minute > 59) throw new Error('Giờ học phải từ 00:00 đến 23:59')
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function parseSchedulePattern(text) {
  const parts = String(text || '').trim().toUpperCase().replace(/[–—]/g, '-').split(';')
  if (!parts[0]) throw new Error('Nhập lịch học, ví dụ: T2-T4 14:00-16:00')
  const slots = []
  for (const part of parts) {
    const match = part.trim().match(/^((?:T[2-7]|CN)(?:\s*[-,/]\s*(?:T[2-7]|CN))*)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/)
    if (!match) throw new Error('Lịch chưa đúng định dạng. Ví dụ: T2-T4 14:00-16:00; T6 09:00-11:00')
    const startTime = timeValue(match[2]), endTime = timeValue(match[3])
    if (startTime >= endTime) throw new Error('Giờ kết thúc phải sau giờ bắt đầu')
    for (const day of match[1].match(/T[2-7]|CN/g)) {
      const weekday = day === 'CN' ? 0 : Number(day.slice(1)) - 1
      if (slots.some(slot => slot.weekday === weekday && startTime < slot.endTime && endTime > slot.startTime)) throw new Error('Lịch có khung giờ trùng nhau trong cùng ngày')
      slots.push({ weekday, startTime, endTime })
    }
  }
  return slots
}

export function generatePatternSessions(text, fromDate, count) {
  const slots = parseSchedulePattern(text)
  const total = Number(count)
  if (!Number.isInteger(total) || total < 1 || total > 104) throw new Error('Số buổi toàn khóa phải là số nguyên từ 1 đến 104')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate || '')) throw new Error('Chọn ngày bắt đầu tạo lịch')
  const first = new Date(fromDate + 'T00:00:00Z')
  if (!Number.isFinite(first.getTime()) || first.toISOString().slice(0, 10) !== fromDate) throw new Error('Ngày bắt đầu không hợp lệ')
  const result = []
  for (let offset = 0; result.length < total && offset < total * 7 + 7; offset++) {
    const day = new Date(first.getTime() + offset * 86400000)
    const date = day.toISOString().slice(0, 10)
    for (const slot of slots.filter(slot => slot.weekday === day.getUTCDay()).sort((a, b) => a.startTime.localeCompare(b.startTime))) {
      if (result.length === total) break
      result.push({ date, weekday: slot.weekday, startTime: slot.startTime, endTime: slot.endTime,
        startAt: new Date(`${date}T${slot.startTime}:00+07:00`).toISOString(),
        endAt: new Date(`${date}T${slot.endTime}:00+07:00`).toISOString() })
    }
  }
  return result
}
