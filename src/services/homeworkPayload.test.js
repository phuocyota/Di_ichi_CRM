import test from 'node:test'
import assert from 'node:assert/strict'
import { buildHomeworkPayload } from './homeworkPayload.js'

const event = { id: 'schedule-1', classId: 'class-1' }
const values = { homeworkTitle: ' Homework ', homeworkDeadline: '2026-12-01T20:00' }

test('homework requires a valid local deadline without throwing RangeError', () => {
  for (const value of ['', undefined, 'not-a-date', '2026-12-01', '2026-12-01T25:00']) {
    assert.throws(() => buildHomeworkPayload(event, { ...values, homeworkDeadline: value }), (error) => {
      assert.equal(error instanceof RangeError, false)
      assert.match(error.message, /hạn nộp|Hạn nộp/)
      return true
    })
  }
  assert.throws(() => buildHomeworkPayload(event, { ...values, homeworkTitle: '  ' }), /tên bài tập/)
})

test('homework converts 20:00 Vietnam local time into 13:00 UTC and ignores client status', () => {
  const previous = process.env.TZ
  process.env.TZ = 'Asia/Ho_Chi_Minh'
  try {
    assert.deepEqual(buildHomeworkPayload(event, { ...values, homeworkStatus: 'Nháp' }), {
      classId: 'class-1', scheduleId: 'schedule-1', title: 'Homework',
      deadline: '2026-12-01T13:00:00.000Z', status: 'assigned',
    })
  } finally {
    if (previous === undefined) delete process.env.TZ
    else process.env.TZ = previous
  }
})
