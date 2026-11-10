import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { anchoredScrollTop, clampZoomIndex, DEFAULT_ZOOM_INDEX, processTimeGridWheel, ZOOM_LEVELS } from '../../services/timeGridZoom.js'

function captureAnchor(root, clientY) {
  const grid = root?.querySelector('.fc-timegrid-slots table')
  const scroller = grid?.closest('.fc-scroller')
  if (!grid || !scroller) return null
  const rect = grid.getBoundingClientRect(), viewport = scroller.getBoundingClientRect()
  const y = Math.max(viewport.top, Math.min(viewport.bottom, clientY ?? viewport.top + scroller.clientHeight / 2))
  if (!rect.height) return null
  return { fraction: Math.max(0, Math.min(1, (y - rect.top) / rect.height)), clientY: y, scrollLeft: scroller.scrollLeft }
}

export default function useTimeGridZoom(rootRef, calendarRef, blocked) {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)
  const state = useRef({ level: DEFAULT_ZOOM_INDEX, blocked, frame: null, delta: 0, anchor: null, target: DEFAULT_ZOOM_INDEX })
  const dragging = useRef(false)
  useLayoutEffect(() => {
    const current = state.current
    current.blocked = blocked
    if (blocked) {
      if (current.frame !== null) cancelAnimationFrame(current.frame)
      current.frame = null; current.delta = 0; current.anchor = null; current.target = current.level
    }
  }, [blocked])
  const zoomTo = useCallback((index, clientY) => {
    if (state.current.blocked || dragging.current) return
    const next = clampZoomIndex(index)
    state.current.target = next
    if (next === state.current.level) {
      if (state.current.frame !== null) cancelAnimationFrame(state.current.frame)
      state.current.frame = null; state.current.anchor = null
      return
    }
    state.current.anchor = captureAnchor(rootRef.current, clientY)
    if (state.current.frame !== null) return
    state.current.frame = requestAnimationFrame(() => {
      state.current.frame = null
      if (state.current.blocked || dragging.current) { state.current.anchor = null; state.current.target = state.current.level; state.current.delta = 0; return }
      setZoomIndex(state.current.target)
    })
  }, [rootRef])
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const current = state.current
    const wheel = event => processTimeGridWheel(event, current, {
      viewportHeight: root.clientHeight,
      zoomTo,
      isBlocked: () => {
        // Giữ nguyên tỷ lệ khi sửa biểu mẫu hoặc kéo/resize một ca.
        const focused = document.activeElement
        return current.blocked || dragging.current || Boolean(root.querySelector('.fc-event-dragging, .fc-event-resizing')) || (root.contains(focused) && focused?.matches('input, select, textarea, [contenteditable="true"]'))
      },
    })
    root.addEventListener('wheel', wheel, { passive: false })
    return () => {
      root.removeEventListener('wheel', wheel)
      if (current.frame !== null) cancelAnimationFrame(current.frame)
      current.frame = null
    }
  }, [rootRef, zoomTo])
  useLayoutEffect(() => {
    const current = state.current
    current.level = zoomIndex
    // FullCalendar phải đo lại slot trước khi khôi phục mốc phút dưới con trỏ.
    calendarRef.current?.getApi().updateSize()
    const grid = rootRef.current?.querySelector('.fc-timegrid-slots table')
    const scroller = grid?.closest('.fc-scroller')
    if (current.anchor && grid && scroller) {
      const rect = grid.getBoundingClientRect(), anchor = current.anchor
      scroller.scrollTop = anchoredScrollTop(scroller.scrollTop, rect.top, rect.height, anchor.fraction, anchor.clientY, scroller.scrollHeight - scroller.clientHeight)
      scroller.scrollLeft = anchor.scrollLeft
    }
    current.anchor = null
  }, [zoomIndex, rootRef, calendarRef])
  return { zoomIndex, zoomLevel: ZOOM_LEVELS[zoomIndex], zoomTo, dragging }
}
