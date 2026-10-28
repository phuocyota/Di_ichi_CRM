import apiClient from './apiClient.js'

// Keep pagination metadata; the shared client normally unwraps `data`.
export async function listAllCourseResource(resource) {
  const items = []
  let page = 1
  while (true) {
    let response
    try {
      response = await apiClient.get(`/${resource}`, {
        preserveResponse: true,
        params: page === 1 ? {} : { page },
      })
    } catch (error) {
      if (page > 1 && error.status === 400) {
        throw new Error(`Không tải đủ ${resource}: máy chủ từ chối tham số phân trang. ${error.message}`)
      }
      throw error
    }
    const body = response?.success !== undefined ? response.data : response
    const rows = Array.isArray(body) ? body : body?.data ?? body?.items
    if (!Array.isArray(rows)) throw new Error(`Dữ liệu ${resource} không đúng định dạng`)
    items.push(...rows)
    if (Array.isArray(body) || body.total == null || items.length >= Number(body.total)) return items
    if (!rows.length || (page > 1 && Number(body.page) !== page)) {
      throw new Error(`Không tải đủ dữ liệu ${resource}`)
    }
    page += 1
  }
}

export const coursePayload = (values) => ({
  code: values.code.trim(),
  name: values.name.trim(),
  level: values.level.trim(),
  defaultTuitionFee: Number(values.tuition),
  status: values.status,
})

export const classPayload = (values) => ({
  code: values.code.trim(),
  name: values.name.trim(),
  courseId: values.courseId,
  maxSize: Number(values.maxStudents),
  startDate: values.startDate,
  endDate: values.endDate,
  status: values.status,
})
