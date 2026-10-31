import { useCallback, useEffect, useRef, useState } from 'react'
import apiClient from './apiClient.js'

const areas = [
  'finance',
  'reports',
  'marketing',
  'parents',
  'staff',
  'schedule'
]
const required = {
  finance: [
    'student',
    'branch',
    'course',
    'class',
    'staff',
    'financeTransaction',
    'payment',
    'receipt',
    'refund',
    'debtSchedule'
  ],
  reports: [
    'student',
    'studentGuardian',
    'branch',
    'course',
    'class',
    'staff',
    'classStaff',
    'enrollment',
    'schedule',
    'attendanceRecord',
    'score',
    'homework',
    'homeworkSubmission',
    'financeTransaction',
    'payment'
  ],
  marketing: ['student', 'staff', 'branch', 'financeTransaction', 'payment'],
  parents: [
    'student',
    'studentGuardian',
    'branch',
    'class',
    'course',
    'enrollment',
    'financeTransaction',
    'schedule',
    'attendanceRecord',
    'score'
  ],
  staff: [
    'staff',
    'classStaff',
    'class',
    'course',
    'schedule',
    'staffCertificate',
    'branch',
    'room',
    'enrollment',
    'department',
    'position',
    'specialty',
    'student',
    'score',
    'homeworkSubmission',
    'attendanceRecord'
  ],
  schedule: [
    'schedule',
    'class',
    'course',
    'staff',
    'room',
    'branch',
    'enrollment',
    'student',
    'attendanceRecord',
    'homework',
    'classStaff',
    'classRoom',
    'portalAttendance'
  ]
}
export async function getWorkspace(area, signal) {
  if (!areas.includes(area)) throw new Error('Màn dữ liệu không hợp lệ')
  const value = await apiClient.get(`/workspace/${area}`, { signal })
  if (
    !value?.data ||
    !Array.isArray(value.records) ||
    !value.statistics ||
    !value.charts
  )
    throw new Error('Dữ liệu tổng quan không đúng định dạng')
  for (const rows of Object.values(value.data))
    if (!Array.isArray(rows))
      throw new Error('Danh sách tổng quan không đúng định dạng')
  if (required[area].some((key) => !Array.isArray(value.data[key])))
    throw new Error('API chưa trả đủ dữ liệu tổng quan')
  return value
}
export function useWorkspace(area) {
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('')
  const revision = useRef(0)
  const reload = useCallback(
    async (signal) => {
      const id = ++revision.current
      setLoading(true)
      setError('')
      try {
        const next = await getWorkspace(area, signal)
        if (!signal?.aborted && id === revision.current) setData(next)
        return next
      } catch (cause) {
        if (!signal?.aborted && id === revision.current) setError(cause.message)
        throw cause
      } finally {
        if (!signal?.aborted && id === revision.current) setLoading(false)
      }
    },
    [area]
  )
  useEffect(() => {
    const controller = new AbortController()
    reload(controller.signal).catch(() => {})
    return () => controller.abort()
  }, [reload])
  return { data, loading, error, reload }
}
export const saveWorkspaceRecord = (id, payload) =>
  id
    ? apiClient.patch(`/workspace/records/${id}`, payload)
    : apiClient.post('/workspace/records', payload)
export const deleteWorkspaceRecord = (id) =>
  apiClient.delete(`/workspace/records/${id}`)
export const getNotifications = () => apiClient.get('/workspace/notifications')
export const readNotifications = (id) =>
  apiClient.patch(
    id
      ? `/workspace/notifications/${id}/read`
      : '/workspace/notifications/read-all'
  )
export const money = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Number(value || 0)
  )
export const number = (value) =>
  value == null
    ? '—'
    : new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(
        Number(value)
      )
export const date = (value) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—'
export const nameOf = (rows = [], id) =>
  rows.find((r) => r.id === id)?.name || '—'
export async function exportRows(rows, filename) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Data')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
