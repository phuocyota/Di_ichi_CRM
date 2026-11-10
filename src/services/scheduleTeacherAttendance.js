import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

const timeZone = 'Asia/Ho_Chi_Minh'

export function scheduleTeacherAttendance(records, schedule) {
  if (!schedule.teacherId || !schedule.startAt) return []
  const date = dayjs(schedule.startAt).tz(timeZone).format('YYYY-MM-DD')
  return records.filter(record => {
    const content = record.content
    return record.kind === 'staff-attendance' &&
      content?.staffId === schedule.teacherId &&
      (content.scheduleId ? content.scheduleId === schedule.id : content.date === date)
  }).map(record => ({ id: record.id, ...record.content }))
}

export function teacherAttendanceTime(value) {
  if (typeof value !== 'string' || !value.trim()) return 'Chưa ghi nhận'
  if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) return value
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value) || !dayjs(value).isValid()) return 'Chưa ghi nhận'
  return dayjs(value).tz(timeZone).format('DD/MM/YYYY HH:mm:ss')
}

export function teacherAttendanceLocation(record, field) {
  if (!record?.[field]) return null
  const evidence = record[`${field}Evidence`] || record[`${field}Location`]
  if (!evidence || typeof evidence !== 'object') return null
  const latitude = evidence.latitude ?? evidence.lat
  const longitude = evidence.longitude ?? evidence.lng
  const numeric = value => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value))
  if (!numeric(latitude) || !numeric(longitude) || Math.abs(Number(latitude)) > 90 || Math.abs(Number(longitude)) > 180) return null
  const coordinates = `${Number(latitude)},${Number(longitude)}`
  return { coordinates, url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`, sample: record.source === 'sample' || Boolean(evidence.sample) }
}
