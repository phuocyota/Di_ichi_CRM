import { useCallback, useEffect, useRef, useState } from 'react'
import { loadWorkScheduleEmployees } from '../../services/workScheduleEmployees.js'
import { useResourceUpdates } from '../../services/realtime.js'

export default function useWorkScheduleEmployees(enabled = true) {
  const [data, setData] = useState({ employees: [], unclassified: [], branches: [] })
  const [loading, setLoading] = useState(true), [error, setError] = useState('')
  const [refreshError, setRefreshError] = useState('')
  const controller = useRef(null)
  const loaded = useRef(false)
  const reload = useCallback(async ({ force = false, throwOnError = false } = {}) => {
    // Focus, reconnect and fallback polling can arrive together.
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    if (!loaded.current) { setLoading(true); setError('') }
    try {
      const next = await loadWorkScheduleEmployees(request.signal, { force })
      if (!request.signal.aborted) {
        loaded.current = true
        setData(next); setError(''); setRefreshError('')
        return next
      }
    } catch (cause) {
      if (!request.signal.aborted) {
        const message = cause.message || 'Không tải được danh sách nhân viên / cơ sở.'
        if (loaded.current) setRefreshError(message)
        else setError(message)
      }
      if (throwOnError) throw cause
    } finally {
      if (!request.signal.aborted) setLoading(false)
      if (controller.current === request) controller.current = null
    }
  }, [])
  useEffect(() => { reload(); return () => controller.current?.abort() }, [reload])
  useResourceUpdates(change => reload({ force: !change?.resync || change.resources?.some(resource => ['staff','branch','position','role','user-role','user-account','system-settings'].includes(resource)) }), ['staff', 'branch', 'position', 'role', 'user-role', 'user-account', 'system-settings'], enabled)
  return { ...data, loading, error, refreshError, reload }
}
