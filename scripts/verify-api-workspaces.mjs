import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import path from 'node:path'
import { createServer } from 'vite'
import React, { act } from 'react'

const require = createRequire(import.meta.url)
const teacherRoot = path.resolve(process.cwd(), '../Di-Ichi-Teacher')
const { JSDOM } = require(
  require.resolve('jsdom', { paths: [process.cwd(), teacherRoot] })
)
const { fireEvent } = require(
  require.resolve('@testing-library/dom', { paths: [teacherRoot] })
)
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: 'http://localhost/' }
)
for (const key of [
  'window',
  'document',
  'localStorage',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLSelectElement',
  'SVGElement',
  'Element',
  'Node',
  'MutationObserver'
])
  globalThis[key] = key === 'window' ? dom.window : dom.window[key]
globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0)
globalThis.cancelAnimationFrame = clearTimeout
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.matchMedia = () => ({
  matches: false,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {}
})
window.confirm = () => true
const { createRoot } = await import('react-dom/client')
const { MemoryRouter } = await import('react-router-dom')
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'custom'
})
let root
try {
  const { default: client } = await server.ssrLoadModule(
    '/src/services/apiClient.js'
  )
  const api = await server.ssrLoadModule('/src/services/workspaceApi.js')
  const data = {
    student: [
      {
        id: 'student-1',
        code: 'HV1',
        name: 'Actual Student',
        status: 'active',
        branchId: 'branch-1',
        createdAt: '2026-10-30T00:00:00Z',
        note: JSON.stringify({ original: 'preserve' })
      }
    ],
    branch: [{ id: 'branch-1', name: 'Actual Branch' }],
    course: [{ id: 'course-1', name: 'Actual Course' }],
    class: [
      {
        id: 'class-1',
        courseId: 'course-1',
        code: 'CL1',
        name: 'Actual Class',
        status: 'active',
        startDate: '2026-10-01',
        endDate: '2026-12-31'
      }
    ],
    staff: [
      {
        id: 'staff-1',
        code: 'GV1',
        name: 'Actual Teacher',
        type: 'TEACHER',
        status: 'active',
        branchId: 'branch-1'
      }
    ],
    financeTransaction: [
      {
        id: 'fee-1',
        code: 'HP1',
        studentId: 'student-1',
        classId: 'class-1',
        branchId: 'branch-1',
        payableAmount: 1000,
        paidAmount: 0,
        refundedAmount: 0,
        debtAmount: 1000,
        status: 'debt',
        dueDate: '2026-11-01'
      }
    ],
    payment: [],
    receipt: [],
    refund: [],
    debtSchedule: [],
    studentGuardian: [
      {
        id: 'guardian-1',
        studentId: 'student-1',
        name: 'Actual Guardian',
        phone: '0900000000',
        relationship: 'Mẹ',
        isPrimary: true
      }
    ],
    classStaff: [
      { id: 'link-1', staffId: 'staff-1', classId: 'class-1', role: 'teacher' }
    ],
    enrollment: [
      {
        id: 'enrollment-1',
        studentId: 'student-1',
        classId: 'class-1',
        status: 'active',
        isCurrent: true
      }
    ],
    schedule: [],
    attendanceRecord: [],
    score: [],
    homework: [],
    homeworkSubmission: [],
    staffCertificate: [],
    room: [
      { id: 'room-1', name: 'Actual Room', branchId: 'branch-1', capacity: 20 }
    ],
    department: [],
    position: [],
    specialty: [],
    classRoom: [{ id: 'class-room-1', classId: 'class-1', roomId: 'room-1' }],
    portalAttendance: []
  }
  const snapshot = {
    data,
    records: [],
    users: [],
    statistics: {
      students: 1,
      teachers: 1,
      classes: 1,
      revenue: 0,
      payable: 1000,
      debt: 1000,
      payments: 0,
      candidates: 0
    },
    charts: {
      monthlyStudents: [],
      monthlyRevenue: [],
      studentStatus: [],
      branchRevenue: [],
      paymentMethods: []
    }
  }
  const calls = []
  client.defaults.adapter = async (config) => {
    const payload = config.data ? JSON.parse(config.data) : undefined
    calls.push({ method: config.method, url: config.url, payload })
    let result = snapshot
    if (config.method === 'post' && config.url === '/payment') {
      data.payment.push({ ...payload, id: 'payment-1' })
      data.financeTransaction[0].paidAmount = payload.amount
      data.financeTransaction[0].debtAmount -= payload.amount
      result = { id: 'payment-1' }
    } else if (
      config.method === 'post' &&
      config.url === '/workspace/records'
    ) {
      result = {
        ...payload,
        id: `record-${snapshot.records.length + 1}`,
        createdAt: '2026-10-30T00:00:00Z'
      }
      snapshot.records.push(result)
    } else if (config.method === 'post' && config.url === '/student-guardian') {
      result = { ...payload, id: 'guardian-2' }
      data.studentGuardian.push(result)
    } else if (
      config.method === 'patch' &&
      config.url === '/student/student-1'
    ) {
      Object.assign(data.student[0], payload)
      result = data.student[0]
    } else if (
      config.method === 'post' &&
      config.url === '/workspace/schedules'
    ) {
      result = payload.schedules.map((s, index) => ({
        ...s,
        id: `schedule-${index + 1}`
      }))
      data.schedule.push(...result)
    }
    return {
      data: { success: true, data: structuredClone(result) },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    }
  }
  assert.equal(
    (await api.getWorkspace('finance')).data.student[0].name,
    'Actual Student'
  )
  const host = document.getElementById('root')
  async function mount(file) {
    if (root) await act(async () => root.unmount())
    root = createRoot(host)
    const { default: Component } = await server.ssrLoadModule(file)
    await act(async () => {
      root.render(
        React.createElement(MemoryRouter, null, React.createElement(Component))
      )
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }
  async function click(label) {
    const target = [...host.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === label
    )
    assert.ok(target, `Missing button: ${label}`)
    await act(async () => {
      fireEvent.click(target)
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }
  async function submit() {
    const form =
      host.querySelector('[role="dialog"] form') ||
      host.querySelector('form[role="dialog"]') ||
      host.querySelector('form')
    assert.ok(form, 'Expected dialog form')
    const fields = Object.fromEntries(new dom.window.FormData(form))
    const savedFormData = globalThis.FormData
    globalThis.FormData = dom.window.FormData
    try {
      await act(async () => {
        fireEvent.submit(form)
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    } finally {
      globalThis.FormData = savedFormData
    }
    return fields
  }
  await mount('/src/pages/Finance/FinancePage.jsx')
  assert.match(host.textContent, /Actual Student/)
  assert.match(host.textContent, /Actual Class/)
  await click('Thu tiền')
  await submit()
  assert.deepEqual(calls.find((c) => c.url === '/payment')?.payload, {
    transactionId: 'fee-1',
    amount: 1000,
    method: 'cash',
    paidAt: new Date().toLocaleDateString('en-CA'),
    status: 'successful',
    note: ''
  })
  assert.ok(
    !host.querySelector('[role="dialog"]'),
    'Payment modal closes after confirmed save'
  )
  assert.equal(data.financeTransaction[0].debtAmount, 0)
  await mount('/src/pages/MarketingSales/MarketingSalesPage.jsx')
  await click('Thêm nguồn')
  await act(async () =>
    fireEvent.change(host.querySelector('[name="name"]'), {
      target: { value: 'Actual API Source' }
    })
  )
  await submit()
  assert.match(host.textContent, /Actual API Source/)
  assert.equal(snapshot.records[0].kind, 'source')
  await click('Hồ sơ liên kết')
  await click('Gán nguồn / chiến dịch')
  await act(async () =>
    fireEvent.change(host.querySelector('[name="sourceId"]'), {
      target: { value: 'record-1' }
    })
  )
  await submit()
  const note = JSON.parse(data.student[0].note)
  assert.equal(note.original, 'preserve')
  assert.equal(note.sourceId, 'record-1')
  await mount('/src/pages/Parents/ParentPage.jsx')
  await click('Danh sách phụ huynh')
  assert.match(host.textContent, /Actual Guardian/)
  await click('Ghi nhận chăm sóc')
  await act(async () =>
    fireEvent.change(host.querySelector('[name="name"]'), {
      target: { value: 'Actual Care' }
    })
  )
  await submit()
  assert.ok(
    snapshot.records.some(
      (r) => r.kind === 'care' && r.content.guardianId === 'guardian-1'
    )
  )
  await mount('/src/pages/Reports/ReportPage.jsx')
  await click('Học viên')
  assert.match(host.textContent, /Actual Student/)
  await mount('/src/pages/Staff/StaffPage.jsx')
  await click('Danh sách giáo viên')
  assert.match(host.textContent, /Actual Teacher/)
  await mount('/src/pages/Schedule/SchedulePage.jsx')
  await click('Tạo lịch học mới')
  for (const [name, value] of Object.entries({
    className: 'class-1',
    status: 'upcoming',
    date: '2026-11-01',
    startTime: '08:00',
    endTime: '09:00'
  }))
    await act(async () =>
      fireEvent.change(host.querySelector(`[name="${name}"]`), {
        target: { value }
      })
    )
  assert.equal(host.querySelector('[name="teacher"]').value, 'staff-1')
  assert.equal(host.querySelector('[name="room"]').value, 'room-1')
  await submit()
  const scheduleCall = calls.find((c) => c.url === '/workspace/schedules')
  assert.ok(scheduleCall, 'Schedule creation must call the API')
  assert.equal(scheduleCall.payload.schedules[0].classId, 'class-1')
  assert.equal(scheduleCall.payload.schedules[0].teacherId, 'staff-1')
  // A malformed or failed API must reject, rather than returning fixtures or zeros.
  client.defaults.adapter = async (config) => ({
    data: { data: { data: {}, records: [], statistics: {}, charts: {} } },
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  })
  await assert.rejects(api.getWorkspace('finance'), /chưa trả đủ dữ liệu/)
  client.defaults.adapter = async () => {
    throw Object.assign(new Error('Unavailable'), {
      response: { status: 503, data: { message: 'API unavailable' } }
    })
  }
  await assert.rejects(api.getWorkspace('finance'), /API unavailable/)
  await mount('/src/pages/Finance/FinancePage.jsx')
  assert.match(host.textContent, /API unavailable/)
  assert.ok(!host.textContent.includes('Actual Student'))
  console.log(
    'PASS: real API reads, payment save/reload, campaign/source persistence, lead metadata preservation, parent care persistence, reports/staff rendering and API failure states.'
  )
} finally {
  if (root) await act(async () => root.unmount())
  await server.close()
  dom.window.close()
}
