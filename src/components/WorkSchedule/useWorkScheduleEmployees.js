import { useCallback, useEffect, useRef, useState } from 'react'
import { loadWorkScheduleEmployees } from '../../services/workScheduleEmployees.js'
import { useResourceUpdates } from '../../services/realtime.js'

export default function useWorkScheduleEmployees(enabled = true) {
  const [data, setData] = useState({ employees: [], unclassified: [], branches: [] })
  const [loading, setLoading] = useState(true), [error, setError] = useState('')
  const controller = useRef(null)
  const reload = useCallback(async () => {
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    setLoading(true); setError('')
    try {
      const next = await loadWorkScheduleEmployees(request.signal)
      if (!request.signal.aborted) setData(next)
    } catch (cause) {
      if (!request.signal.aborted) setError(cause.message || 'Không tải được danh sách nhân viên / cơ sở.')
    } finally {
      if (!request.signal.aborted) setLoading(false)
    }
  }, [])
  useEffect(() => { reload(); return () => controller.current?.abort() }, [reload])
  useResourceUpdates(reload, ['staff', 'branch', 'position', 'role', 'user-role', 'user', 'system-settings'], enabled)
  return { ...data, loading, error, reload }
}
