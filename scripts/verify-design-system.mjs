import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import path from 'node:path'
import { createServer } from 'vite'
import React, { act } from 'react'

const require = createRequire(import.meta.url),
  teacher = path.resolve(process.cwd(), '../Di-Ichi-Teacher')
const { JSDOM } = require(require.resolve('jsdom', { paths: [teacher] })),
  { fireEvent } = require(
    require.resolve('@testing-library/dom', { paths: [teacher] })
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
  'MutationObserver',
  'FormData'
])
  globalThis[key] = key === 'window' ? dom.window : dom.window[key]
const runtimeErrors = []
window.addEventListener('error', (event) => runtimeErrors.push(event.error))
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
const { createRoot } = await import('react-dom/client'),
  { MemoryRouter, Routes, Route } = await import('react-router-dom')
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'custom'
})
const host = document.getElementById('root')
let root
async function render(Component, props = {}) {
  if (root) await act(async () => root.unmount())
  root = createRoot(host)
  await act(async () => {
    root.render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Component, props)
      )
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}
async function click(label, scope = document) {
  const node = [...scope.querySelectorAll('button')].find(
    (b) =>
      b.textContent.trim() === label || b.getAttribute('aria-label') === label
  )
  assert.ok(node, `Missing button ${label}`)
  await act(async () => fireEvent.click(node))
  return node
}
async function moduleDefault(file) {
  return (await server.ssrLoadModule(file)).default
}
try {
  const ui = await server.ssrLoadModule('/src/components/common/ui.jsx')
  const Header = await moduleDefault('/src/components/common/PageHeader.jsx')
  let tab = 'overview'
  await render(Header, {
    title: 'Kiểm thử giao diện',
    description: 'Dữ liệu kiểm thử cô lập',
    tabs: [
      ['overview', 'Tổng quan'],
      ['list', 'Danh sách']
    ],
    activeTab: tab,
    onTabChange: (value) => {
      tab = value
    }
  })
  assert.equal(host.querySelectorAll('h1').length, 1)
  assert.ok(host.querySelector('[aria-label="Đường dẫn"]'))
  await click('Danh sách')
  assert.equal(tab, 'list')

  const Stat = await moduleDefault('/src/components/common/StatCard.jsx')
  await render(Stat, { label: 'Số liệu API bằng 0', value: 0, color: 'violet' })
  assert.equal(host.querySelector('.ui-stat-value').textContent, '0')
  assert.ok(host.querySelector('.ui-tone-purple'))
  let cleared = 0
  await render(ui.FilterBar, {
    active: true,
    onClear: () => { cleared++ },
    children: React.createElement('label', null,
      React.createElement('span', null, 'Trạng thái'),
      React.createElement('select', { value: 'trial', onChange() {} },
        React.createElement('option', { value: '' }, 'Tất cả'),
        React.createElement('option', { value: 'trial' }, 'Học thử')))
  })
  assert.match(host.querySelector('.ui-filter-chip').textContent, /Trạng thái:.*Học thử/)
  await click('Xóa bộ lọc')
  assert.equal(cleared, 1)
  await render(ui.FilterBar, { children: React.createElement('label', null, 'Trạng thái', React.createElement('select', { value: '', onChange() {} }, React.createElement('option', { value: '' }, 'Tất cả'))) })
  assert.ok(!host.querySelector('.ui-filter-chips'))
  const css = readFileSync('src/styles/design-system.css', 'utf8')
  const tokens = Object.fromEntries([...css.matchAll(/(--ui-[a-z-]+):[ ]*(#[a-f0-9]{6});/g)].map(m => [m[1], m[2]]))
  const luminance = hex => {
    const rgb = hex.slice(1).match(/../g).map(n => parseInt(n,16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
  }
  const contrasts = {}
  for (const tone of ['primary', 'success', 'warning', 'danger', 'info', 'purple', 'cyan', 'pink']) {
    const a = luminance(tokens[tone === 'primary' ? '--ui-primary-text' : '--ui-' + tone]), b = luminance(tokens['--ui-' + tone + '-soft'])
    const ratio = (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05)
    assert.ok(ratio >= 4.5, tone + ' text/pastel contrast: ' + ratio)
    contrasts[tone] = Number(ratio.toFixed(2))
  }
  const primaryContrast = 1.05 / (luminance(tokens['--ui-primary']) + 0.05)
  assert.ok(primaryContrast >= 4.5, 'White primary button text contrast')
  console.log('PASS: controlled filter chips/clear, empty filters, KPI zero/purple, text contrast >= 4.5:1', contrasts)
  const Table = await moduleDefault('/src/components/Students/StudentTable.jsx')
  const students = Array.from({ length: 12 }, (_, i) => ({
    id: `student-${i}`,
    code: `HV${i}`,
    name: `Học viên ${i}`,
    avatar: 'HV',
    phone: `09000000${i}`,
    parent: 'Phụ huynh API',
    course: 'Khóa API',
    className: 'Lớp API',
    teacher: 'Giáo viên API',
    branch: 'Cơ sở API',
    status: 'Đang học',
    statusValue: 'active',
    enrollments: [{ status: 'active' }],
    hasAccount: i !== 0
  }))
  const filters = {
    courses: ['Khóa API'],
    classes: ['Lớp API'],
    teachers: ['Giáo viên API'],
    branches: ['Cơ sở API'],
    statuses: [{ value: 'active', label: 'Đang học' }]
  }
  let exported = [],
    format = '',
    opened
  const props = {
    students,
    filters,
    keyword: '',
    onKeywordChange() {},
    onSelectStudent() {},
    onOpenModal: (type, student) => {
      opened = { type, student }
    },
    canManage: true,
    onExportRowsChange: (rows) => {
      exported = rows
    },
    onExport: (value) => {
      format = value
    }
  }
  await render(Table, props)
  assert.equal(host.querySelectorAll('tbody tr').length, 10)
  assert.match(host.textContent, /Đang học/)
  assert.equal(host.querySelectorAll('thead th').length, 6)
  await act(async () =>
    fireEvent.click(host.querySelector('[aria-label="Chọn tất cả"]'))
  )
  assert.equal(exported.length, 10)
  await click('Xuất Excel')
  assert.equal(format, 'excel')
  await click('Bỏ chọn')
  assert.equal(exported.length, 12)
  await click('Sau')
  assert.equal(host.querySelectorAll('tbody tr').length, 2)
  const details = host.querySelector('details')
  await act(async () => {
    details.open = true
  })
  const parentChoice = [...details.querySelectorAll('label')]
    .find((l) => l.textContent.trim() === 'Phụ huynh')
    .querySelector('input')
  await act(async () => fireEvent.click(parentChoice))
  assert.equal(host.querySelectorAll('thead th').length, 7)
  assert.equal(
    JSON.parse(localStorage.getItem('diichi-student-columns-v2')).parent,
    true
  )
  await click('Nghiệp vụ')
  await click('Bảo lưu')
  assert.equal(opened.type, 'reserve')
  assert.equal(opened.student.id, 'student-10')
  await render(Table, { ...props, canManage: false })
  assert.ok(!host.querySelector('[aria-haspopup="menu"]'))
  assert.ok(!host.querySelector('[aria-label^="Tạo tài khoản"]'))
  const { WorkspaceTable } = await server.ssrLoadModule(
    '/src/components/common/WorkspaceView.jsx'
  )
  await render(WorkspaceTable, {
    columns: [['score', 'Điểm']],
    rows: [
      { id: 'a', score: 10 },
      { id: 'b', score: 0 }
    ]
  })
  await click('Điểm')
  assert.equal(host.querySelector('tbody td').textContent, '0')
  await click('Điểm')
  assert.equal(host.querySelector('tbody td').textContent, '10')
  let confirmed = 0,
    closed = 0
  await render(ui.ConfirmDialog, {
    open: true,
    title: 'Xác nhận kiểm thử',
    description: 'Không ghi DB thật',
    onConfirm: () => {
      confirmed++
    },
    onClose: () => {
      closed++
    }
  })
  await click('Hủy')
  assert.equal(confirmed, 0)
  assert.equal(closed, 1)
  await click('Xác nhận')
  assert.equal(confirmed, 1)
  await act(async () =>
    fireEvent.keyDown(document.querySelector('[role="dialog"]'), {
      key: 'Escape'
    })
  )
  assert.equal(closed, 2)
  const Permissions = await moduleDefault(
    '/src/components/SystemSettings/PermissionsPanel.jsx'
  )
  let saved = 0
  const role = {
    id: 'role-1',
    name: 'Vai trò API',
    code: 'custom',
    protected: false,
    staffCount: 0,
    staffNames: '',
    permissionIds: ['permission-1']
  }
  await render(Permissions, {
    rows: [role],
    permissions: [{ id: 'permission-1', code: 'student.read' }],
    modules: [{ key: 'student', label: 'Học viên' }],
    employees: [],
    auditLogs: [],
    keyword: '',
    busy: false,
    onRefresh() {},
    onSave() {},
    onDelete() {},
    onAssign() {},
    onPermissions: () => {
      saved++
    }
  })
  await click('Lưu quyền')
  assert.equal(saved, 0)
  assert.match(
    document.querySelector('[role="dialog"]').textContent,
    /Lưu thay đổi phân quyền/
  )
  await click('Lưu quyền', document.querySelector('[role="dialog"]'))
  assert.equal(saved, 1)
  await render(Permissions, {
    rows: [{ ...role, protected: true }],
    permissions: [],
    modules: [],
    employees: [],
    auditLogs: [],
    keyword: '',
    busy: false,
    onRefresh() {},
    onPermissions: () => {
      saved++
    }
  })
  assert.equal(
    [...host.querySelectorAll('button')].find(
      (b) => b.textContent === 'Lưu quyền'
    ).disabled,
    true
  )
  const Employee = await moduleDefault(
    '/src/components/SystemSettings/EmployeeModal.jsx'
  )
  let reset = 0
  await render(Employee, {
    modal: {
      type: 'password',
      row: {
        id: 'staff-1',
        name: 'Nhân viên API',
        accountId: 'account-1',
        typeValue: 'TEACHER',
        roleIds: [],
        accountStatusValue: 'ACTIVE'
      }
    },
    roles: [],
    directories: {},
    currentUserId: 'admin',
    onClose() {},
    onReset: () => {
      reset++
    }
  })
  for (const field of host.querySelectorAll('input[type="password"]'))
    await act(async () =>
      fireEvent.change(field, { target: { value: 'IsolatedTest123!' } })
    )
  await act(async () => fireEvent.submit(host.querySelector('form')))
  assert.equal(reset, 0)
  assert.ok(document.querySelector('.ui-confirm-dialog'))
  await click('Xác nhận cập nhật', document.querySelector('.ui-confirm-dialog'))
  assert.equal(reset, 1)
  const { default: client } = await server.ssrLoadModule(
    '/src/services/apiClient.js'
  )
  client.defaults.adapter = async (config) => ({
    data: { data: [] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  })
  const emptySchedule = {
    data: Object.fromEntries(
      [
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
      ].map((key) => [key, []])
    ),
    records: [],
    users: [],
    statistics: {},
    charts: {}
  }
  client.defaults.adapter = async (config) => ({
    data: { data: emptySchedule },
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  })
  const Schedule = await moduleDefault('/src/pages/Schedule/SchedulePage.jsx')
  await render(Schedule)
  assert.ok(host.querySelector('.fc'))
  assert.ok(!host.querySelector('#schedule-filters'))
  const calendarNode = host.querySelector('.fc')
  await click('Bộ lọc')
  assert.ok(host.querySelector('#schedule-filters'))
  assert.equal(host.querySelector('.fc'), calendarNode)
  await click('Bộ lọc')
  assert.ok(!host.querySelector('#schedule-filters'))
  assert.equal(host.querySelector('.fc'), calendarNode)
  await click('Theo tháng')
  assert.ok(host.querySelector('.fc-dayGridMonth-view'))
  await act(async () =>
    fireEvent.change(host.querySelector('#schedule-jump-date'), {
      target: { value: '2026-11-02' }
    })
  )
  assert.equal(host.querySelector('#schedule-jump-date').value, '2026-11-02')
  await click('Bảng lịch học')
  assert.ok(host.querySelector('table'))
  assert.equal(host.querySelector('.fc'), calendarNode)
  await click('Lịch biểu')
  assert.equal(host.querySelector('.fc'), calendarNode)
  client.defaults.adapter = async (config) => ({
    data: { data: [] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  })
  const Layout = await moduleDefault('/src/layouts/MainLayout.jsx')
  localStorage.setItem(
    'ec_admin_user',
    JSON.stringify({ name: 'Admin API', position: 'Quản trị viên' })
  )
  if (root) await act(async () => root.unmount())
  root = createRoot(host)
  await act(async () =>
    root.render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            { element: React.createElement(Layout) },
            React.createElement(Route, {
              path: '/',
              element: React.createElement('p', null, 'Nội dung kiểm thử')
            }),
            React.createElement(Route, {
              path: '/students',
              element: React.createElement('p', null, 'Đã mở học viên')
            })
          )
        )
      )
    )
  )
  await click('Thu gọn thanh điều hướng')
  assert.equal(localStorage.getItem('diichi-ui-sidebar'), 'collapsed')
  await click('Mở rộng thanh điều hướng')
  assert.equal(localStorage.getItem('diichi-ui-sidebar'), 'expanded')
  await click('Mở menu')
  assert.ok(host.querySelector('[aria-label="Menu điều hướng"]'))
  await act(async () =>
    fireEvent.keyDown(host.querySelector('[aria-label="Menu điều hướng"]'), {
      key: 'Escape'
    })
  )
  assert.ok(!host.querySelector('[aria-label="Menu điều hướng"]'))
  await act(async () => {
    fireEvent.change(host.querySelector('[aria-label="Tìm học viên nhanh"]'), {
      target: { value: 'HV1' }
    })
    fireEvent.submit(host.querySelector('form[role="search"]'))
  })
  assert.match(host.textContent, /Đã mở học viên/)
  for (const file of [
    '/src/components/Students/StudentHeader.jsx',
    '/src/components/Staff/StaffHeader.jsx',
    '/src/components/Courses/CourseHeader.jsx',
    '/src/components/dashboard/CrmDashboardHeader.jsx',
    '/src/components/SystemSettings/SystemSettingsHeader.jsx'
  ]) {
    const Component = await moduleDefault(file)
    await render(Component, {
      activeTab: 'list',
      onTabChange() {},
      tabs: [],
      keyword: '',
      onKeywordChange() {},
      filters: [],
      filterValues: {},
      onFilterChange() {},
      onOpenModal() {},
      onExport() {}
    })
    assert.ok(host.querySelector('.ui-page-header'))
    assert.equal(host.querySelectorAll('h1').length, 1)
    assert.ok(host.querySelector('.ui-breadcrumb'))
  }
  assert.deepEqual(
    runtimeErrors,
    [],
    'No unhandled browser errors during UI interactions'
  )
  console.log(
    'PASS: shared layout/tabs, compact student columns, selection exports, column preferences, existing workflows, sorting/pagination, sensitive confirmations, protected permissions, responsive navigation and working global search. No live API writes.'
  )
} finally {
  if (root) await act(async () => root.unmount())
  await server.close()
  dom.window.close()
}
