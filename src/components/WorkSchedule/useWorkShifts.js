import { useCallback, useEffect, useRef, useState } from 'react'
import { getWorkShifts, saveWorkShifts } from '../../services/workShiftsApi.js'
import { useResourceUpdates } from '../../services/realtime.js'

export default function useWorkShifts(branchId) {
  const [state, setState] = useState({ branchId: '', snapshot: null, error: '', refreshError: '' })
  const [saving, setSaving] = useState(false)
  const latest = useRef(state), request = useRef(null), writeLock = useRef(false)
  const update = useCallback(value => { latest.current = value; setState(value) }, [])
  const reload = useCallback(async () => {
    if (!branchId || writeLock.current) return
    if (request.current?.branchId === branchId && !request.current.controller.signal.aborted) return
    request.current?.controller.abort()
    const controller = new AbortController()
    request.current = { branchId, controller }
    const previous = latest.current.branchId === branchId ? latest.current.snapshot : null
    if (!previous) update({ branchId, snapshot: null, error: '', refreshError: '' })
    try {
      const value = await getWorkShifts(branchId, controller.signal)
      if (!controller.signal.aborted) update({ branchId, snapshot: value, error: '', refreshError: '' })
    } catch (cause) {
      if (!controller.signal.aborted) update({ branchId, snapshot: previous, error: previous ? '' : cause.message, refreshError: previous ? cause.message : '' })
    } finally {
      if (request.current?.controller === controller) request.current = null
    }
  }, [branchId, update])
  useEffect(() => { reload(); return () => request.current?.controller.abort() }, [reload])
  useResourceUpdates(reload, ['work-shifts', 'branch'], !saving)
  const save = async (values, revision) => {
    if (writeLock.current) throw new Error('Đang lưu ca làm, vui lòng chờ.')
    if (latest.current.branchId !== branchId || !latest.current.snapshot) throw new Error('Tải cấu hình ca làm trước khi lưu.')
    writeLock.current = true; setSaving(true)
    request.current?.controller.abort()
    try {
      const value = await saveWorkShifts(branchId, revision, values)
      update({ branchId, snapshot: value, error: '', refreshError: '' })
      return value
    } finally { writeLock.current = false; setSaving(false) }
  }
  const current = state.branchId === branchId ? state : { snapshot: null, error: '', refreshError: '' }
  return { ...current, loading: Boolean(branchId) && !current.snapshot && !current.error, saving, reload, save }
}
