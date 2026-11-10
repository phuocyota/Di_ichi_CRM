import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { addDays, weekStart, workAlerts } from '../../services/workSchedule.js'
import { useWorkScheduleSnapshot } from '../../services/workScheduleApi.js'

export default function useWorkScheduleAlerts(enabled) {
  const { pathname } = useLocation()
  const ownsRequest = enabled && pathname.replace(/\/+$/, '') !== '/work-schedule'
  const { data } = useWorkScheduleSnapshot(enabled, ownsRequest)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [enabled])
  if (!enabled) return []
  const start = weekStart(), end = addDays(start, 6)
  return workAlerts(data, now, []).filter(item => item.date >= start && item.date <= end)
}
