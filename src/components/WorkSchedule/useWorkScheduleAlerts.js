import { useEffect, useState } from 'react'
import { addDays, loadWorkSchedule, weekStart, workAlerts, WORK_SCHEDULE_KEY } from '../../services/workSchedule.js'

export default function useWorkScheduleAlerts(enabled) {
  const [alerts, setAlerts] = useState([])
  useEffect(() => {
    if (!enabled) return
    const update = () => {
      const start = weekStart(), end = addDays(start, 6)
      setAlerts(workAlerts(loadWorkSchedule()).filter(item => item.date >= start && item.date <= end))
    }
    const storage = event => { if (event.key === WORK_SCHEDULE_KEY) update() }
    update()
    const timer = setInterval(update, 30000)
    window.addEventListener('work-schedule:updated', update)
    window.addEventListener('storage', storage)
    return () => { clearInterval(timer); window.removeEventListener('work-schedule:updated', update); window.removeEventListener('storage', storage) }
  }, [enabled])
  return enabled ? alerts : []
}
