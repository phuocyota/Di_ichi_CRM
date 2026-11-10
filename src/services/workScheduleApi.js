import { useCallback, useEffect, useRef, useState } from 'react'
import { USER_KEY } from './apiClient.js'
import {
  assignEmployeeShifts, createWorkDayOff, deleteWorkDayOff, getWorkShifts, removeWorkAssignmentApi,
  replaceWorkPerson, saveWorkShifts, subscribeWorkShifts, swapWorkShift,
} from './workShiftsApi.js'
import { useResourceUpdates } from './realtime.js'
import { emptyWorkSchedule, normalizeWorkSchedule, workSchedulePayload } from './workScheduleContract.js'

function fromResponse(value) {
  if (!value.roster) throw new Error('Máy chủ chưa hỗ trợ lưu phân lịch nhân viên. Vui lòng cập nhật máy chủ rồi tải lại.')
  return normalizeWorkSchedule({ ...value.roster, branchId: value.branchId, revision: value.revision, view: value.view })
}

export function useWorkScheduleSnapshot(enabled = true, subscribe = true, filters = {}) {
  const [data, setData] = useState(emptyWorkSchedule)
  const [userBranchId] = useState(() => { try { return JSON.parse(localStorage.getItem(USER_KEY))?.branchId || '' } catch { return '' } })
  const branchId = filters.branchId || userBranchId
  const fromDate = filters.fromDate || '', toDate = filters.toDate || '', search = filters.search || ''
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim())
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])
  const [configuration, setConfiguration] = useState(null), [configurationError, setConfigurationError] = useState('')
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [saving, setSaving] = useState(false)
  const latest = useRef(null), lock = useRef(false), revision = useRef(0), request = useRef(null), pendingReload = useRef(false)
  const accept = useCallback(response => {
    if (response.branchId !== branchId) return response
    if (latest.current?.branchId === branchId && response.revision < latest.current.revision) return latest.current
    if (latest.current === response) return response
    latest.current = response
    setConfiguration(response); setConfigurationError('')
    try { setData(fromResponse(response)); setError('') }
    catch (cause) { setError(cause.message) }
    return response
  }, [branchId])
  useEffect(() => subscribeWorkShifts(response => {
    if (response.branchId === branchId) { accept(response); setLoading(false) }
  }), [accept, branchId])
  const reload = useCallback(async ({ throwOnError = false, force = false, requireRoster = true } = {}) => {
    if (lock.current) { pendingReload.current = true; if (throwOnError) throw new Error('Đang lưu phân lịch, vui lòng chờ.'); return }
    if (!branchId) { const message = 'Tài khoản chưa có cơ sở để tải phân lịch.'; setError(message); setLoading(false); if (throwOnError) throw new Error(message); return }
    setLoading(true)
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    const version = ++revision.current
    let received = false
    try {
      const params = fromDate || toDate || debouncedSearch ? { ...(fromDate ? { fromDate } : {}), ...(toDate ? { toDate } : {}), search: debouncedSearch } : undefined
      const response = await getWorkShifts(branchId, controller.signal, params, { force })
      received = true
      if (!controller.signal.aborted && version === revision.current) {
        const accepted = accept(response)
        return requireRoster ? fromResponse(accepted) : accepted
      }
    } catch (cause) {
      if (!controller.signal.aborted && version === revision.current) {
        setError(cause.message)
        if (!received) setConfigurationError(cause.message)
      }
      if (throwOnError) throw cause
    } finally { if (!controller.signal.aborted && version === revision.current) setLoading(false) }
  }, [branchId, fromDate, toDate, debouncedSearch, accept])
  useEffect(() => {
    const invalidate = () => { revision.current++; request.current?.abort() }
    if (subscribe) void reload()
    else setLoading(false)
    return invalidate
  }, [reload, subscribe])
  useResourceUpdates(change => reload({ force: !change?.resync || change.resources?.includes('work-shifts') }), ['work-shifts'], enabled && subscribe && !saving)
  useEffect(() => {
    if (!saving && subscribe && pendingReload.current) { pendingReload.current = false; void reload() }
  }, [saving, subscribe, reload])
  const ensureReady = async () => {
    const configuration = latest.current?.branchId === branchId && !configurationError
      ? latest.current
      : await reload({ throwOnError: true, force: Boolean(configurationError), requireRoster: false })
    if (!configuration) return undefined
    return { schedule: configuration.roster ? fromResponse(configuration) : null, configuration }
  }
  const write = async (values, expectedRevision, roster, requireRoster) => {
    if (lock.current) throw new Error('Đang lưu ca làm, vui lòng chờ.')
    lock.current = true; setSaving(true); revision.current++; request.current?.abort()
    try {
      const response = accept(await saveWorkShifts(branchId, expectedRevision, values, roster))
      return requireRoster ? fromResponse(response) : response
    } catch (cause) {
      if (cause.status === 409) { lock.current = false; await reload({ force: true }) }
      throw cause
    } finally { lock.current = false; setSaving(false) }
  }
  // Single-purpose roster actions use the server's own checks instead of replacing the whole roster.
  const act = async run => {
    if (lock.current) throw new Error('Đang lưu ca làm, vui lòng chờ.')
    if (loading || error) throw new Error(error || 'Chưa tải được phân lịch từ máy chủ.')
    lock.current = true; setSaving(true); revision.current++; request.current?.abort()
    try { return fromResponse(accept(await run(branchId, latest.current.revision))) }
    catch (cause) {
      if (cause.status === 409) { lock.current = false; await reload({ force: true }) }
      throw cause
    } finally { lock.current = false; setSaving(false) }
  }
  const actions = {
    assign: assignments => act((id, rev) => assignEmployeeShifts(id, rev, assignments)),
    swapShift: (assignmentId, shiftId) => act((id, rev) => swapWorkShift(id, assignmentId, rev, shiftId)),
    replace: (assignmentId, personId, reason) => act((id, rev) => replaceWorkPerson(id, assignmentId, rev, personId, reason)),
    remove: assignmentId => act((id, rev) => removeWorkAssignmentApi(id, assignmentId, rev)),
    createDayOff: (personId, date) => act((id, rev) => createWorkDayOff(id, rev, personId, date)),
    deleteDayOff: (personId, date) => act((id, rev) => deleteWorkDayOff(id, rev, personId, date)),
  }
  const save = async next => {
    if (next.branchId !== branchId) throw new Error('Cơ sở đã thay đổi. Vui lòng tải lại phân lịch trước khi lưu.')
    if (loading || error) throw new Error(error || 'Chưa tải được phân lịch từ máy chủ.')
    const { revision: expectedRevision, ...roster } = workSchedulePayload(next)
    return write(latest.current.shifts, expectedRevision, roster, true)
  }
  const saveConfiguration = async (values, expectedRevision) => {
    if (latest.current?.branchId !== branchId) throw new Error('Tải cấu hình ca làm trước khi lưu.')
    return write(values, expectedRevision, undefined, false)
  }
  return { data, configuration: configuration?.branchId === branchId ? configuration : null, configurationError, loading, error, saving, reload, save, saveConfiguration, ensureReady, actions }
}
