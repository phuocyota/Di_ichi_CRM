import { LoadingSkeleton } from '../../components/common/ui.jsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import CourseHeader from '../../components/Courses/CourseHeader.jsx'
import CourseModal from '../../components/Courses/CourseModal.jsx'
import CourseTable from '../../components/Courses/CourseTable.jsx'
import CourseClassTable from '../../components/Courses/CourseClassTable.jsx'
import LearningResultTable from '../../components/Courses/LearningResultTable.jsx'
import LearningResultDetailModal from '../../components/Courses/LearningResultDetailModal.jsx'
import {
  courseStatuses,
  classStatuses,
  courseTabs
} from '../../config/courses.js'
import {
  createResource,
  updateResource,
  deleteResource,
  indexById
} from '../../services/crmApi.js'
import {
  listAllCourseResource,
  coursePayload,
  classPayload
} from '../../services/courseApi.js'

const normalize = (value) =>
  String(value ?? '')
    .toLocaleLowerCase('vi')
    .trim()

export default function CoursePage() {
  const [activeTab, setActiveTab] = useState('courses')
  const [keyword, setKeyword] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modal, setModal] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const requestRef = useRef(0)

  const refresh = useCallback(async () => {
    const request = ++requestRef.current
    setLoading(true)
    setLoadError('')
    try {
      const resources =
        activeTab === 'courses'
          ? ['course']
          : activeTab === 'classes'
            ? [
                'course',
                'class',
                'staff',
                'room',
                'class-staff',
                'class-room',
                'class-weekly-schedule',
                'enrollment'
              ]
            : ['course', 'class', 'staff', 'student', 'score']
      const entries = await Promise.all(
        resources.map(async (name) => [name, await listAllCourseResource(name)])
      )
      if (request === requestRef.current) setData(Object.fromEntries(entries))
    } catch (error) {
      if (request === requestRef.current) setLoadError(error.message)
      throw error
    } finally {
      if (request === requestRef.current) setLoading(false)
    }
  }, [activeTab])
  useEffect(() => {
    refresh().catch(() => {})
    return () => {
      requestRef.current += 1
    }
  }, [refresh])

  const courses = useMemo(
    () =>
      (data.course || []).map((item) => ({
        ...item,
        tuition:
          item.defaultTuitionFee == null ? null : Number(item.defaultTuitionFee)
      })),
    [data.course]
  )
  const teachers = useMemo(
    () =>
      (data.staff || []).filter(
        (item) => item.type?.toLowerCase() === 'teacher'
      ),
    [data.staff]
  )
  const rooms = data.room || []
  const courseMap = useMemo(() => indexById(courses), [courses])
  const teacherMap = useMemo(() => indexById(data.staff || []), [data.staff])
  const roomMap = useMemo(() => indexById(data.room || []), [data.room])
  const studentMap = useMemo(
    () => indexById(data.student || []),
    [data.student]
  )
  const classes = useMemo(
    () =>
      (data.class || [])
        .filter((item) => !item.deletedAt)
        .map((item) => ({
          ...item,
          teacherIds: (data['class-staff'] || [])
            .filter(
              (link) => link.classId === item.id && link.role === 'teacher'
            )
            .map((link) => link.staffId),
          roomIds: (data['class-room'] || [])
            .filter((link) => link.classId === item.id)
            .map((link) => link.roomId),
          schedule: (data['class-weekly-schedule'] || [])
            .filter((link) => link.classId === item.id)
            .map(
              (link) =>
                (link.weekday === 0 ? 'CN' : 'T' + (link.weekday + 1)) +
                ' ' +
                link.startTime.slice(0, 5) +
                ' - ' +
                link.endTime.slice(0, 5)
            )
            .join('; '),
          currentStudents: (data.enrollment || []).filter(
            (link) => link.classId === item.id && link.isCurrent
          ).length,
          maxStudents: item.maxSize
        }))
        .map((item) => ({
          ...item,
          teacherId: item.teacherIds[0] || '',
          roomId: item.roomIds[0] || ''
        })),
    [data]
  )
  const classMap = useMemo(() => indexById(classes), [classes])
  const results = useMemo(
    () =>
      (data.score || []).map((item) => ({
        ...item,
        courseId: classMap[item.classId]?.courseId
      })),
    [data.score, classMap]
  )
  const courseStatusMap = Object.fromEntries(
    courseStatuses.map((item) => [item.value, item])
  )
  const classStatusMap = Object.fromEntries(
    classStatuses.map((item) => [item.value, item])
  )
  const options = (items) =>
    items.map((item) => ({ value: item.id, label: item.name }))
  const filters =
    activeTab === 'courses'
      ? [{ key: 'status', label: 'Trạng thái', options: courseStatuses }]
      : [
          { key: 'courseId', label: 'Khóa học', options: options(courses) },
          ...(activeTab === 'results'
            ? [
                {
                  key: 'classId',
                  label: 'Lớp học',
                  options: options(
                    classes.filter(
                      (item) =>
                        !filterValues.courseId ||
                        item.courseId === filterValues.courseId
                    )
                  )
                }
              ]
            : []),
          { key: 'teacherId', label: 'Giáo viên', options: options(teachers) },
          ...(activeTab === 'classes'
            ? [{ key: 'status', label: 'Trạng thái', options: classStatuses }]
            : [])
        ]
  const matches = (item, texts) => {
    const search = normalize(keyword)
    return (
      (!search || texts.some((value) => normalize(value).includes(search))) &&
      Object.entries(filterValues).every(
        ([key, value]) =>
          !value ||
          (key === 'teacherId' && item.teacherIds
            ? item.teacherIds.includes(value)
            : item[key] === value)
      )
    )
  }
  const filteredCourses = courses.filter((item) =>
    matches(item, [item.code, item.name, item.level])
  )
  const filteredClasses = classes.filter((item) =>
    matches(item, [
      item.code,
      item.name,
      courseMap[item.courseId]?.name,
      ...item.teacherIds.map((id) => teacherMap[id]?.name),
      ...item.roomIds.map((id) => roomMap[id]?.name)
    ])
  )
  const filteredResults = results.filter((item) =>
    matches(item, [
      studentMap[item.studentId]?.name,
      classMap[item.classId]?.name,
      courseMap[item.courseId]?.name,
      teacherMap[item.teacherId]?.name,
      item.title,
      item.subject
    ])
  )

  const handleSubmit = async (action, values) => {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    try {
      const resource = action.entity === 'course' ? 'course' : 'class'
      let saved
      if (action.mode === 'delete')
        await deleteResource(resource, action.item.id)
      else {
        if (resource === 'class' && values.endDate < values.startDate)
          throw new Error('Ngày kết thúc phải từ ngày khai giảng trở đi')
        const payload =
          resource === 'course' ? coursePayload(values) : classPayload(values)
        if (!payload.code || !payload.name)
          throw new Error('Vui lòng nhập mã và tên hợp lệ')
        saved =
          action.mode === 'edit'
            ? await updateResource(resource, action.item.id, payload)
            : await createResource(resource, payload)
      }
      setModal(null)
      toast.success(
        action.mode === 'delete' ? 'Đã xóa thành công' : 'Đã lưu thành công'
      )
      try {
        await refresh()
        if (resource === 'course' && action.mode === 'create' && saved?.id) {
          setActiveTab('classes')
          setKeyword('')
          setFilterValues({ courseId: saved.id })
          setModal({ entity: 'class', mode: 'create', courseId: saved.id })
        }
      } catch (error) {
        toast.error(
          'Đã lưu nhưng chưa tải lại được danh sách: ' + error.message
        )
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }
  const exportResults = async () => {
    try {
      const XLSX = await import('xlsx')
      const rows = filteredResults.map((item) => ({
        'Học viên': studentMap[item.studentId]?.name || item.studentId,
        'Lớp học': classMap[item.classId]?.name || item.classId,
        'Khóa học': courseMap[item.courseId]?.name || '',
        'Giáo viên': teacherMap[item.teacherId]?.name || item.teacherId,
        'Bài kiểm tra': item.title,
        Môn: item.subject,
        Ngày: item.scoreDate,
        Điểm: item.score,
        'Điểm tối đa': item.maxScore,
        'Thứ hạng': item.rank ?? '',
        'Nhận xét': item.note || ''
      }))
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(rows),
        'Bang diem'
      )
      XLSX.writeFile(
        workbook,
        'bang-diem-' + new Date().toISOString().slice(0, 10) + '.xlsx'
      )
    } catch (error) {
      toast.error('Không xuất được bảng điểm: ' + error.message)
    }
  }
  const actions = (entity) =>
    Object.fromEntries(
      ['view', 'edit', 'delete'].map((mode) => [
        'on' + mode[0].toUpperCase() + mode.slice(1),
        (item) => setModal({ entity, mode, item })
      ])
    )
  return (
    <div className="space-y-6">
      <CourseHeader
        activeTab={activeTab}
        tabs={courseTabs}
        keyword={keyword}
        filters={filters}
        filterValues={filterValues}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setFilterValues({})
          setKeyword('')
        }}
        onKeywordChange={setKeyword}
        onFilterChange={(key, value) =>
          setFilterValues((current) => ({
            ...current,
            [key]: value,
            ...(key === 'courseId' ? { classId: '' } : {})
          }))
        }
        showAdd={activeTab !== 'results' && !loading && !loadError}
        onAdd={() =>
          setModal({
            entity: activeTab === 'classes' ? 'class' : 'course',
            mode: 'create',
            courseId: filterValues.courseId
          })
        }
      />
      {loading ? (
        <LoadingSkeleton label="Đang tải dữ liệu khóa học…" rows={4} />
      ) : loadError ? (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {loadError}
          <button
            className="ml-4 underline"
            onClick={() => refresh().catch(() => {})}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'courses' ? (
            <CourseTable
              courses={filteredCourses}
              statusMap={courseStatusMap}
              {...actions('course')}
              onAddClass={(item) => {
                setActiveTab('classes')
                setKeyword('')
                setFilterValues({ courseId: item.id })
                setModal({ entity: 'class', mode: 'create', courseId: item.id })
              }}
            />
          ) : null}
          {activeTab === 'classes' ? (
            <CourseClassTable
              classes={filteredClasses}
              courseMap={courseMap}
              teacherMap={teacherMap}
              roomMap={roomMap}
              statusMap={classStatusMap}
              {...actions('class')}
            />
          ) : null}
          {activeTab === 'results' ? (
            <LearningResultTable
              results={filteredResults}
              studentMap={studentMap}
              classMap={classMap}
              courseMap={courseMap}
              teacherMap={teacherMap}
              onView={setSelectedResult}
              onExport={exportResults}
            />
          ) : null}
        </>
      )}
      <CourseModal
        modal={modal}
        saving={saving}
        courseStatuses={courseStatuses}
        classStatuses={classStatuses}
        courses={courses}
        teachers={teachers}
        rooms={rooms}
        courseMap={courseMap}
        teacherMap={teacherMap}
        roomMap={roomMap}
        onClose={() => {
          if (!savingRef.current) setModal(null)
        }}
        onSubmit={handleSubmit}
      />
      <LearningResultDetailModal
        result={selectedResult}
        studentMap={studentMap}
        classMap={classMap}
        courseMap={courseMap}
        teacherMap={teacherMap}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  )
}
