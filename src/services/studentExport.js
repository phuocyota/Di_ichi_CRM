import { businessDate } from './studentWorkflow.js'

export const exportColumns = ['Mã học viên', 'Họ tên', 'Giới tính', 'Ngày sinh', 'Số điện thoại', 'Phụ huynh', 'Khóa học', 'Lớp', 'Giáo viên', 'Cơ sở', 'Trạng thái', 'Ngày nhập học']
export function studentExportRows(students) {
  return students.map((item) => [item.code, item.name, item.gender, item.birthDate, item.phone, item.parent, item.course, item.className, item.teacher, item.branch, item.status, item.enrollmentDate].map((value) => value ?? ''))
}
const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
export function studentPrintHtml(students) {
  const rows = studentExportRows(students)
  return `<!doctype html><html lang="vi"><head><meta charset="UTF-8"><title>Danh sách học viên</title><style>@page{size:A4 landscape;margin:10mm}body{font-family:Arial,sans-serif;color:#111;font-size:10px}h1{font-size:18px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #aaa;padding:5px;text-align:left;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}th{background:#eef3ff}</style></head><body><h1>Danh sách học viên</h1><p>${rows.length} học viên</p><table><thead><tr>${exportColumns.map((label) => `<th>${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`
}
export async function exportStudentsExcel(students) {
  const XLSX = await import('xlsx')
  const sheet = XLSX.utils.aoa_to_sheet([exportColumns, ...studentExportRows(students)])
  sheet['!cols'] = exportColumns.map((label) => ({ wch: Math.max(16, label.length + 3) }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Hoc vien')
  XLSX.writeFile(workbook, `hoc-vien-${businessDate()}.xlsx`)
}
export function exportStudentsPdf(students) {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe')
    frame.setAttribute('title', 'In danh sách học viên')
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;bottom:0;right:0;'
    frame.onload = () => {
      try {
        frame.contentWindow.onafterprint = () => frame.remove()
        frame.contentWindow.focus()
        frame.contentWindow.print()
        resolve()
      } catch (error) { frame.remove(); reject(error) }
    }
    frame.onerror = () => { frame.remove(); reject(new Error('Không mở được bản in PDF')) }
    frame.srcdoc = studentPrintHtml(students)
    document.body.appendChild(frame)
  })
}
