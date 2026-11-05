import { useCallback, useEffect, useRef, useState } from 'react'
import { loadWorkScheduleEmployees } from '../../services/workScheduleEmployees.js'
import { useResourceUpdates } from '../../services/realtime.js'

export default function useWorkScheduleEmployees(enabled = true) {
  const [data, setData] = useState({ employees: [], unclassified: [], branches: [] })
  const [loading, setLoading] = useState(true), [error, setError] = useState('')
  const [refreshError, setRefreshError] = useState('')
  const controller = useRef(null)
  const loaded = useRef(false)
  const reload = useCallback(async () => {
    // Focus, reconnect and fallback polling can arrive together.
    if (controller.current && !controller.current.signal.aborted) return
    const request = new AbortController()
    controller.current = request
    if (!loaded.current) { setLoading(true); setError('') }
    try {
      const next = await loadWorkScheduleEmployees(request.signal)
      if (!request.signal.aborted) {
        loaded.current = true
        setData(next); setError(''); setRefreshError('')
      }
    } catch (cause) {
      if (!request.signal.aborted) {
        const message = cause.message || 'Không tải được danh sách nhân viên / cơ sở.'
        if (loaded.current) setRefreshError(message)
        else setError(message)
      }
    } finally {
      if (!request.signal.aborted) setLoading(false)
      if (controller.current === request) controller.current = null
    }
  }, [])
  useEffect(() => { reload(); return () => controller.current?.abort() }, [reload])
  useResourceUpdates(reload, ['staff', 'branch', 'position', 'role', 'user-role', 'user', 'system-settings'], enabled)
  return { ...data, loading, error, refreshError, reload }
}
