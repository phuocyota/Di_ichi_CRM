// Sum actual recorded intervals per employee/day. Merge overlaps so time is never counted twice.
export function dailyWorkAttendance(assignments, attendance, people) {
  const records = new Map(attendance.map(record => [record.assignmentId, record]))
  const directory = new Map(people.map(person => [person.id, person]))
  const groups = new Map()
  for (const item of assignments) {
    const key = `${item.date}:${item.personId}`
    if (!groups.has(key)) groups.set(key, { key, date: item.date, personId: item.personId, name: directory.get(item.personId)?.name || item.personName || item.personId, role: item.personRole || directory.get(item.personId)?.role || 'Nhân viên', entries: [] })
    groups.get(key).entries.push({ item, record: records.get(item.id) })
  }
  return [...groups.values()].map(group => {
    const dayStart = Date.parse(`${group.date}T00:00:00+07:00`)
    const dayEnd = dayStart + 86400000
    const intervals = []
    let incomplete = 0
    for (const { record } of group.entries) {
      const start = Date.parse(record?.checkIn), end = Date.parse(record?.checkOut)
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) { incomplete++; continue }
      const from = Math.max(start, dayStart), to = Math.min(end, dayEnd)
      if (to > from) intervals.push([from, to])
      else incomplete++
    }
    intervals.sort((a, b) => a[0] - b[0])
    const merged = []
    for (const [start, end] of intervals) {
      const last = merged.at(-1)
      if (last && start <= last[1]) last[1] = Math.max(last[1], end)
      else merged.push([start, end])
    }
    return { ...group, entries: group.entries.sort((a, b) => a.item.start.localeCompare(b.item.start)), minutes: Math.floor(merged.reduce((sum, [start, end]) => sum + end - start, 0) / 60000), completed: intervals.length, incomplete }
  }).sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name, 'vi'))
}

export function workDurationLabel(minutes) {
  const hours = Math.floor(minutes / 60), remaining = minutes % 60
  return `${hours} giờ${remaining ? ` ${remaining} phút` : ''}`
}
