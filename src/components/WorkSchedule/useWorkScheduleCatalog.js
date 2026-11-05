import { useCallback, useEffect, useRef, useState } from 'react'
import { loadWorkScheduleCatalog } from '../../services/workScheduleCatalog.js'
import { useResourceUpdates } from '../../services/realtime.js'

export default function useWorkScheduleCatalog(enabled = true, { load = true } = {}) {
  const [data, setData] = useState({ courses: [], classes: [], branches: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const controller = useRef(null)
  const reload = useCallback(async () => {
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    setLoading(true); setError('')
    try {
      const next = await loadWorkScheduleCatalog(request.signal)
      if (!request.signal.aborted) setData(next)
    } catch (cause) {
      if (!request.signal.aborted) setError(cause.message || 'Không tải được khóa học và lớp học.')
    } finally {
      if (!request.signal.aborted) setLoading(false)
    }
  }, [])
  useEffect(() => {
    if (!load) return
    reload()
    return () => controller.current?.abort()
  }, [reload, load])
  useResourceUpdates(reload, ['course', 'class', 'branch', 'room', 'class-room'], enabled && load)
  return { ...data, loading, error, reload }
}
