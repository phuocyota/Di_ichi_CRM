import { addDays } from './workSchedule.js'

const seconds = time => {
  const [hour, minute, second = 0] = time.split(':').map(Number)
  return hour * 3600 + minute * 60 + second
}

export function createWeekTimetableLayout(assignments, week) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(week, index)
    const groups = new Map()
    for (const item of assignments.filter(row => row.date === date)) {
      const key = `${seconds(item.start)}-${seconds(item.end)}`
      if (!groups.has(key)) groups.set(key, { key, start: item.start, end: item.end, items: [] })
      groups.get(key).items.push(item)
    }
    const sorted = [...groups.values()].sort((a, b) => seconds(a.start) - seconds(b.start) || seconds(a.end) - seconds(b.end))
    sorted.forEach(group => group.items.sort((a, b) => a.personId.localeCompare(b.personId) || a.id.localeCompare(b.id)))
    return { date, groups: sorted, width: 180 }
  })
  return { days, minWidth: days.reduce((sum, day) => sum + day.width, 0) }
}
