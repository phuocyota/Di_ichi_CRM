const reasons = { exists: 'Đã tồn tại', class_not_found: 'Không tìm thấy lớp', course_not_found: 'Không tìm thấy khóa học', missing_required_fields: 'Thiếu thông tin bắt buộc', error: 'Lỗi xử lý' }
function StudentImportResult({ result, onClose }) {
  return <section aria-label="Kết quả import học viên" className="space-y-3 rounded-xl border border-blue-200 bg-white p-6">
    <div className="flex justify-between gap-3"><h2 className="font-semibold">Kết quả import Excel</h2><button type="button" onClick={onClose} className="text-sm text-blue-700 underline">Đóng kết quả</button></div>
    <p className="text-sm">Tổng {result.summary.totalRows} dòng · Tạo {result.summary.created} · Bỏ qua {result.summary.skipped}</p>
    <div className="max-h-80 overflow-auto"><table className="w-full text-left text-sm"><thead><tr>{['Sheet', 'Dòng', 'Mã học viên', 'Họ tên', 'Kết quả'].map((label) => <th key={label} className="p-2">{label}</th>)}</tr></thead><tbody>
      {result.created.map((item, index) => <tr key={`created-${item.studentId}-${index}`} className="border-t"><td className="p-2">{item.sheetName}</td><td className="p-2">{item.rowNumber}</td><td className="p-2">{item.studentCode}</td><td className="p-2">{item.studentName}</td><td className="p-2 text-emerald-700">Đã tạo</td></tr>)}
      {result.skipped.map((item, index) => <tr key={`skipped-${index}`} className="border-t"><td className="p-2">{item.sheetName}</td><td className="p-2">{item.rowNumber}</td><td className="p-2">{item.studentCode || '—'}</td><td className="p-2">{item.studentName || '—'}</td><td className="p-2 text-amber-700">{reasons[item.reason] || item.reason}{item.message ? `: ${item.message}` : ''}{item.classCode ? ` · Lớp ${item.classCode}` : ''}{item.courseLevel ? ` · Khóa ${item.courseLevel}` : ''}</td></tr>)}
    </tbody></table></div>
  </section>
}
export default StudentImportResult
