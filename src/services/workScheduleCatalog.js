import { listAllCourseResource } from './courseApi.js'

export function normalizeWorkScheduleCatalog(resources) {
  const active = rows => rows.filter(item => !item.deletedAt)
  const branches = active(resources.branch)
  const rooms = active(resources.room)
  const links = active(resources['class-room'])
  const courses = active(resources.course)
  const courseIds = new Set(courses.map(item => item.id))
  const classes = active(resources.class).filter(item => courseIds.has(item.courseId)).map(item => {
    const roomIds = new Set([item.roomId, ...links.filter(link => link.classId === item.id).map(link => link.roomId)].filter(Boolean))
    const assignedBranches = [...new Set([item.branchId, ...rooms.filter(room => roomIds.has(room.id)).map(room => room.branchId)].filter(Boolean))]
    return {
      ...item,
      branchIds: assignedBranches,
      startDate: item.startDate?.slice(0, 10) || '',
      endDate: item.endDate?.slice(0, 10) || '',
    }
  })
  return { courses, classes, branches }
}

export function classMatchesWorkBranch(item, branchId) {
  return Boolean(branchId) && (!item.branchIds.length || item.branchIds.includes(branchId))
}

export async function loadWorkScheduleCatalog(signal) {
  const resources = ['course', 'class', 'branch', 'room', 'class-room']
  const entries = await Promise.all(resources.map(async resource => [resource, await listAllCourseResource(resource, { signal })]))
  return normalizeWorkScheduleCatalog(Object.fromEntries(entries))
}
