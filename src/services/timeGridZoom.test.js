import { test } from 'node:test'
import assert from 'node:assert/strict'
import { anchoredScrollTop, clampZoomIndex, DEFAULT_ZOOM_INDEX, ZOOM_LEVELS, normalizeWheelDelta, processTimeGridWheel, timeToMinutes, workCalendarEvents, workDayOffEvents, workTimeRange, workAssignmentFromCalendarChange, TIME_GRID_SNAP_MINUTES } from './timeGridZoom.js'
import { TimeColsSlatsCoords, buildSlatMetas } from '@fullcalendar/timegrid/internal.js'
import { createDuration, wholeDivideDurations } from '@fullcalendar/core/internal.js'

function coordinates(level) {
  const range = workTimeRange([])
  const count = (range.end - range.start) / level.slotMinutes
  return new TimeColsSlatsCoords({ els: Array(count).fill(null), tops: Array.from({ length: count }, (_, i) => i * level.slotHeight), getHeight: () => level.slotHeight }, { slotMinTime: createDuration({ minutes: range.start }), slotMaxTime: createDuration({ minutes: range.end }) }, createDuration(level.duration))
}
const positionAt = (coords, time) => coords.computeTimeTop(createDuration({ minutes: timeToMinutes(time) }))
function wheelHarness() {
  let time = 0, blocked = false, prevented = 0
  const state = { target: DEFAULT_ZOOM_INDEX, delta: 0 }, calls = []
  const options = { viewportHeight: 600, now: () => time, isBlocked: () => blocked, zoomTo: (index, y) => { calls.push([index, y]); state.target = index } }
  return {
    state, calls, advance(ms) { time += ms }, block(value) { blocked = value },
    get prevented() { return prevented },
    emit(deltaY, overrides = {}) { return processTimeGridWheel({ deltaY, deltaMode: 0, clientY: 190, ctrlKey: true, metaKey: false, cancelable: true, preventDefault() { prevented++ }, ...overrides }, state, options) },
  }
}

test('there are exactly three discrete levels, each with one 120px cell', () => {
  assert.equal(ZOOM_LEVELS.length, 3)
  assert.deepEqual(ZOOM_LEVELS.map(level => level.slotMinutes), [120, 60, 30])
  assert.ok(ZOOM_LEVELS.every(level => level.slotHeight === 120 && level.duration.minutes === level.slotMinutes))
  assert.equal(DEFAULT_ZOOM_INDEX, 0)
  assert.equal(clampZoomIndex(-10), 0)
  assert.equal(clampZoomIndex(10), 2)
  assert.equal(clampZoomIndex(1.7), 1)
  assert.equal(clampZoomIndex(NaN), 0)
})

test('FullCalendar generates only boundaries of the selected level, without internal minor rows', () => {
  const range = workTimeRange([])
  for (const level of ZOOM_LEVELS) {
    const duration = createDuration(level.duration)
    const slots = buildSlatMetas(createDuration({ minutes: range.start }), createDuration({ minutes: range.end }), duration, duration, { add: (date, value) => new Date(date.getTime() + value.milliseconds) })
    assert.equal(slots.length, (range.end - range.start) / level.slotMinutes)
    assert.ok(slots.every(slot => slot.isLabeled))
    assert.equal(slots.filter(slot => !slot.isLabeled).length, 0)
    if (level.id === 1) assert.deepEqual(slots.map(slot => slot.isoTimeStr), ['07:00:00', '09:00:00', '11:00:00', '13:00:00', '15:00:00', '17:00:00', '19:00:00', '21:00:00'])
    if (level.id === 2) assert.deepEqual(slots.slice(0, 3).map(slot => slot.isoTimeStr), ['07:00:00', '08:00:00', '09:00:00'])
    if (level.id === 3) assert.deepEqual(slots.slice(0, 3).map(slot => slot.isoTimeStr), ['07:00:00', '07:30:00', '08:00:00'])
  }
})

test('actual FullCalendar coordinates give 420/840/1680px heights for 07:30-14:30', () => {
  for (const [index, level] of ZOOM_LEVELS.entries()) {
    const coords = coordinates(level), ppm = level.slotHeight / level.slotMinutes
    assert.equal(positionAt(coords, '07:30'), 30 * ppm)
    assert.equal(positionAt(coords, '14:30') - positionAt(coords, '07:30'), [420, 840, 1680][index])
    assert.equal(positionAt(coords, '13:15'), (13 * 60 + 15 - 7 * 60) * ppm)
    assert.equal(positionAt(coords, '14:45'), (14 * 60 + 45 - 7 * 60) * ppm)
    assert.ok(Math.abs(positionAt(coords, '07:31') - 31 * ppm) < 1e-8)
    assert.equal(positionAt(coords, '07:30:30'), 30.5 * ppm)
  }
})

test('15 minute interaction snapping remains independent of the rendered cell duration', () => {
  for (const [index, level] of ZOOM_LEVELS.entries()) {
    assert.equal(wholeDivideDurations(createDuration(level.duration), createDuration({ minutes: TIME_GRID_SNAP_MINUTES })), [8, 4, 2][index])
    assert.equal(positionAt(coordinates(level), '07:15'), 15 * level.slotHeight / level.slotMinutes)
  }
})

test('13:30 remains at the mouse position for every transition, including zooming out', () => {
  const range = workTimeRange([]), fraction = (13.5 * 60 - range.start) / (range.end - range.start)
  const viewportTop = 100, clientY = 190
  for (const [from, to] of [[0, 1], [1, 2], [2, 1], [1, 0]]) {
    const oldLevel = ZOOM_LEVELS[from], nextLevel = ZOOM_LEVELS[to]
    const oldHeight = (range.end - range.start) * oldLevel.slotHeight / oldLevel.slotMinutes
    const nextHeight = (range.end - range.start) * nextLevel.slotHeight / nextLevel.slotMinutes
    const scroll = oldHeight * fraction - (clientY - viewportTop)
    const nextScroll = anchoredScrollTop(scroll, viewportTop - scroll, nextHeight, fraction, clientY, nextHeight - 500)
    assert.equal(viewportTop - nextScroll + nextHeight * fraction, clientY)
  }
  assert.equal(anchoredScrollTop(0, 100, 960, 0, 200, 460), 0)
  assert.equal(anchoredScrollTop(500, -400, 3840, 1, 100, 3200), 3200)
})

test('physical wheel moves through each level and reverses without passing either limit', () => {
  const h = wheelHarness()
  h.emit(-100); h.advance(350); h.emit(-100)
  h.advance(350); h.emit(-100)
  assert.equal(h.state.target, 2)
  h.advance(350); h.emit(100); h.advance(350); h.emit(100)
  h.advance(350); h.emit(100)
  assert.deepEqual(h.calls.map(call => call[0]), [1, 2, 1, 0])
  assert.ok(h.calls.every(call => call[1] === 190))
})

test('even a huge wheel delta changes only one level and cooldown prevents a second tiny step', () => {
  const h = wheelHarness()
  h.emit(-10000)
  assert.equal(h.state.target, 1)
  for (let i = 0; i < 20; i++) { h.advance(10); h.emit(-10) }
  assert.equal(h.calls.length, 1)
  h.advance(150); h.emit(-80)
  assert.deepEqual(h.calls.map(call => call[0]), [1, 2])
})

test('trackpad accumulation supports sustained zoom without skipping levels', () => {
  const h = wheelHarness()
  for (let i = 0; i < 20; i++) { h.advance(10); h.emit(-10) }
  assert.deepEqual(h.calls.map(call => call[0]), [1])
  for (let i = 0; i < 80; i++) { h.advance(10); h.emit(-10) }
  assert.deepEqual(h.calls.map(call => call[0]), [1, 2])
})

test('wheel cannot queue another level while animation or React commit is pending', () => {
  const h = wheelHarness()
  h.emit(-100)
  h.advance(500)
  h.state.frame = 1
  h.emit(-1000)
  assert.deepEqual(h.calls.map(call => call[0]), [1])
  h.state.frame = null
  h.state.level = 0
  h.emit(-1000)
  assert.deepEqual(h.calls.map(call => call[0]), [1])
  h.state.level = 1
  h.emit(-1000)
  assert.deepEqual(h.calls.map(call => call[0]), [1, 2])
})

test('stale partial delta expires and changing direction clears the previous direction', () => {
  const h = wheelHarness()
  h.emit(-50); h.advance(250); h.emit(-40)
  assert.equal(h.calls.length, 0)
  h.advance(50); h.emit(-40)
  assert.equal(h.state.target, 1)
  h.advance(400); h.emit(-60); h.advance(50); h.emit(40)
  assert.equal(h.calls.length, 1)
  h.advance(30); h.emit(40)
  assert.equal(h.state.target, 0)
})

test('normal scrolling and noncancelable events stay untouched; editing consumes without zoom', () => {
  const h = wheelHarness()
  assert.equal(h.emit(-100, { ctrlKey: false }), false)
  assert.equal(h.prevented, 0)
  assert.equal(h.emit(-100, { cancelable: false }), false)
  assert.equal(h.prevented, 0)
  h.block(true); h.emit(-100)
  assert.equal(h.prevented, 1)
  assert.equal(h.calls.length, 0)
  h.block(false); h.emit(-100, { ctrlKey: false, metaKey: true })
  assert.equal(h.state.target, 1)
})

test('line and page wheel modes are normalized for mouse devices', () => {
  assert.equal(normalizeWheelDelta(3, 1, 600), 48)
  assert.equal(normalizeWheelDelta(1, 2, 600), 600)
  const h = wheelHarness()
  h.emit(-3, { deltaMode: 1 })
  assert.equal(h.state.target, 1)
  h.advance(350); h.emit(-1, { deltaMode: 2 })
  assert.equal(h.state.target, 2)
})

test('calendar mapping preserves exact source times and does not share mutable records', () => {
  const source = Object.freeze({ id: 'shift', date: '2026-11-09', start: '07:30', end: '14:30', personId: 'staff', employeeType: 'sale' })
  const [event] = workCalendarEvents(Object.freeze([source]), [{ id: 'staff', name: 'Employee' }])
  assert.equal(event.start, '2026-11-09T07:30')
  assert.equal(event.end, '2026-11-09T14:30')
  event.extendedProps.assignment.start = '08:00'
  assert.equal(source.start, '07:30')
})

test('explicit drag/resize works at every level using the same existing payload and revision', () => {
  const source = Object.freeze({ id: 'shift', date: '2026-11-09', start: '07:30', end: '14:30', personId: 'staff', shiftId: 'morning' })
  for (const level of ZOOM_LEVELS) {
    const coords = coordinates(level)
    assert.equal(positionAt(coords, '07:45') - positionAt(coords, '07:30'), 15 * level.slotHeight / level.slotMinutes)
    const moved = workAssignmentFromCalendarChange(source, new Date('2026-11-10T07:45:00Z'), new Date('2026-11-10T14:45:00Z'), 4)
    assert.deepEqual(moved, { ...source, date: '2026-11-10', start: '07:45', end: '14:45', expectedRevision: 4 })
    assert.equal(workAssignmentFromCalendarChange(source, new Date('2026-11-09T07:30:00Z'), new Date('2026-11-09T14:45:00Z'), 4).end, '14:45')
  }
  assert.equal(source.start, '07:30')
  assert.throws(() => workAssignmentFromCalendarChange(source, new Date('2026-11-09T23:00:00Z'), new Date('2026-11-10T01:00:00Z'), 4))
  assert.throws(() => workAssignmentFromCalendarChange(source, new Date('invalid'), new Date('invalid'), 4))
})

test('visible bounds remain independent of zoom and extend for outlying shifts', () => {
  assert.deepEqual(workTimeRange([]), { start: 420, end: 1380 })
  assert.deepEqual(workTimeRange([{ start: '06:15', end: '21:30' }]), { start: 300, end: 1380 })
  assert.equal(timeToMinutes('25:00'), null)
})

test('day-off events are read-only all-day chips and ignore non-OFF preferences', () => {
  const events = workDayOffEvents([
    { personId: 'staff', date: '2026-11-10', branchId: 'b1', shiftId: 'OFF' },
    { personId: 'staff', date: '2026-11-11', branchId: 'b1', shiftId: 'morning' },
  ], [{ id: 'staff', name: 'Employee' }])
  assert.equal(events.length, 1)
  assert.equal(events[0].allDay, true)
  assert.equal(events[0].editable, false)
  assert.equal(events[0].title, 'OFF · Employee')
  assert.deepEqual(events[0].extendedProps.dayOff, { personId: 'staff', date: '2026-11-10', branchId: 'b1' })
})
