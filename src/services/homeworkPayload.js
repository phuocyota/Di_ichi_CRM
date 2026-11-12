// datetime-local is interpreted in the browser's local timezone before sending UTC.
export function buildHomeworkPayload(event, values) {
  const value = values.homeworkDeadline
  if (!value) throw new Error('Vui lòng chọn hạn nộp')
  const deadline = new Date(value)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !Number.isFinite(deadline.getTime())) {
    throw new Error('Hạn nộp không hợp lệ')
  }
  if (!values.homeworkTitle?.trim()) throw new Error('Vui lòng nhập tên bài tập')
  return {
    classId: event.classId,
    scheduleId: event.id,
    title: values.homeworkTitle.trim(),
    deadline: deadline.toISOString(),
    status: 'assigned',
  }
}
