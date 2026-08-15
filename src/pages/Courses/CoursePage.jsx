import { useMemo, useState } from 'react'
import CourseClassTable from '../../components/Courses/CourseClassTable.jsx'
import CourseHeader from '../../components/Courses/CourseHeader.jsx'
import CourseModal from '../../components/Courses/CourseModal.jsx'
import CourseTable from '../../components/Courses/CourseTable.jsx'
import LearningResultDetailModal from '../../components/Courses/LearningResultDetailModal.jsx'
import LearningResultTable from '../../components/Courses/LearningResultTable.jsx'
import {
  classStatuses,
  courseClasses,
  courseStatuses,
  courseTabs,
  courses,
  learningResults,
  rooms,
  students,
  teachers,
} from '../../datas/courses.js'

function indexById(items) {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}

function normalize(value) {
  return String(value || '').toLowerCase().trim()
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}`
}

function CoursePage() {
  const [activeTab, setActiveTab] = useState('courses')
  const [keyword, setKeyword] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [courseItems, setCourseItems] = useState(courses)
  const [classItems, setClassItems] = useState(courseClasses)
  const [resultItems, setResultItems] = useState(learningResults)
  const [modal, setModal] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)

  const courseMap = useMemo(() => indexById(courseItems), [courseItems])
  const teacherMap = useMemo(() => indexById(teachers), [])
  const roomMap = useMemo(() => indexById(rooms), [])
  const studentMap = useMemo(() => indexById(students), [])
  const classMap = useMemo(() => indexById(classItems), [classItems])
  const courseStatusMap = useMemo(() => Object.fromEntries(courseStatuses.map((item) => [item.value, item])), [])
  const classStatusMap = useMemo(() => Object.fromEntries(classStatuses.map((item) => [item.value, item])), [])

  const activeFilters = useMemo(() => {
    const resultClassOptions = filterValues.courseId
      ? classItems.filter((item) => item.courseId === filterValues.courseId)
      : classItems

    if (activeTab === 'courses') {
      return [
        { key: 'status', label: 'Trạng thái', options: courseStatuses },
      ]
    }

    if (activeTab === 'classes') {
      return [
        { key: 'courseId', label: 'Khóa học', options: courseItems.map((item) => ({ value: item.id, label: item.name })) },
        { key: 'teacherId', label: 'Giáo viên', options: teachers.map((item) => ({ value: item.id, label: item.name })) },
        { key: 'status', label: 'Trạng thái', options: classStatuses },
      ]
    }

    return [
      { key: 'courseId', label: 'Khóa học', options: courseItems.map((item) => ({ value: item.id, label: item.name })) },
      { key: 'classId', label: 'Lớp học', options: resultClassOptions.map((item) => ({ value: item.id, label: item.name })) },
      { key: 'teacherId', label: 'Giáo viên', options: teachers.map((item) => ({ value: item.id, label: item.name })) },
    ]
  }, [activeTab, classItems, courseItems, filterValues.courseId])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setFilterValues({})
    setKeyword('')
  }

  const handleFilterChange = (key, value) => {
    setFilterValues((current) => {
      if (activeTab === 'results' && key === 'courseId') {
        return { ...current, courseId: value, classId: '' }
      }
      return { ...current, [key]: value }
    })
  }

  const openCreate = () => {
    if (activeTab === 'classes') {
      setModal({ entity: 'class', mode: 'create' })
      return
    }
    setModal({ entity: 'course', mode: 'create' })
  }

  const handleCourseSubmit = (action, values) => {
    if (action.mode === 'delete') {
      const deletedCourseId = action.item.id
      setCourseItems((current) => current.filter((item) => item.id !== deletedCourseId))
      setClassItems((current) => current.filter((item) => item.courseId !== deletedCourseId))
      setResultItems((current) => current.filter((item) => item.courseId !== deletedCourseId))
      setModal(null)
      return
    }

    const payload = {
      ...values,
      sessions: Number(values.sessions),
      tuition: Number(values.tuition),
    }

    if (action.mode === 'edit') {
      setCourseItems((current) => current.map((item) => (item.id === action.item.id ? { ...item, ...payload } : item)))
      setModal(null)
      return
    }

    const createdCourse = {
      ...payload,
      id: makeId('course'),
    }

    setCourseItems((current) => [createdCourse, ...current])
    setActiveTab('classes')
    setKeyword('')
    setFilterValues({ courseId: createdCourse.id })
    setModal({ entity: 'class', mode: 'create', courseId: createdCourse.id })
  }

  const handleClassSubmit = (action, values) => {
    if (action.mode === 'delete') {
      const deletedClassId = action.item.id
      setClassItems((current) => current.filter((item) => item.id !== deletedClassId))
      setResultItems((current) => current.filter((item) => item.classId !== deletedClassId))
      setModal(null)
      return
    }

    const payload = {
      ...values,
      currentStudents: Number(values.currentStudents),
      maxStudents: Number(values.maxStudents),
      studentIds: action.item?.studentIds || [],
    }

    if (action.mode === 'edit') {
      setClassItems((current) => current.map((item) => (item.id === action.item.id ? { ...item, ...payload } : item)))
      setModal(null)
      return
    }

    setClassItems((current) => [{ ...payload, id: makeId('class') }, ...current])
    setActiveTab('classes')
    setFilterValues(values.courseId ? { courseId: values.courseId } : {})
    setModal(null)
  }

  const handleModalSubmit = (action, values) => {
    if (action.entity === 'course') {
      handleCourseSubmit(action, values)
      return
    }
    handleClassSubmit(action, values)
  }

  const exportResults = async (items) => {
    const XLSX = await import('xlsx')
    const rows = items.map((item) => ({
      'Học viên': studentMap[item.studentId]?.name,
      'Lớp học': classMap[item.classId]?.name,
      'Khóa học': courseMap[item.courseId]?.name,
      'Giáo viên': teacherMap[item.teacherId]?.name,
      'Số buổi': item.attendance.totalSessions,
      'Có mặt': item.attendance.present,
      'Nghỉ phép': item.attendance.excusedAbsent,
      'Nghỉ không phép': item.attendance.unexcusedAbsent,
      'Giữa kỳ': item.scores.midterm,
      'Cuối kỳ': item.scores.final,
      'Trung bình': item.scores.average,
      'Xếp loại': item.scores.rank,
      Listening: item.skills.listening,
      Speaking: item.skills.speaking,
      Reading: item.skills.reading,
      Writing: item.skills.writing,
      'Tiến bộ': item.progress,
      'Điểm mạnh': item.strength,
      'Cần cải thiện': item.improvement,
      'Đề xuất': item.recommendation,
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang diem')
    XLSX.writeFile(workbook, `bang-diem-hoc-vien-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const filteredCourses = useMemo(() => {
    const search = normalize(keyword)
    return courseItems.filter((item) => {
      const matchesSearch = !search || [item.code, item.name, item.level].some((value) => normalize(value).includes(search))
      const matchesStatus = !filterValues.status || item.status === filterValues.status
      return matchesSearch && matchesStatus
    })
  }, [courseItems, filterValues.status, keyword])

  const filteredClasses = useMemo(() => {
    const search = normalize(keyword)
    return classItems.filter((item) => {
      const matchesSearch = !search || [
        item.code,
        item.name,
        courseMap[item.courseId]?.name,
        teacherMap[item.teacherId]?.name,
        roomMap[item.roomId]?.name,
      ].some((value) => normalize(value).includes(search))
      const matchesCourse = !filterValues.courseId || item.courseId === filterValues.courseId
      const matchesTeacher = !filterValues.teacherId || item.teacherId === filterValues.teacherId
      const matchesStatus = !filterValues.status || item.status === filterValues.status
      return matchesSearch && matchesCourse && matchesTeacher && matchesStatus
    })
  }, [classItems, courseMap, filterValues.courseId, filterValues.status, filterValues.teacherId, keyword, roomMap, teacherMap])

  const filteredResults = useMemo(() => {
    const search = normalize(keyword)
    return resultItems.filter((item) => {
      const matchesSearch = !search || [
        studentMap[item.studentId]?.name,
        classMap[item.classId]?.name,
        courseMap[item.courseId]?.name,
        teacherMap[item.teacherId]?.name,
      ].some((value) => normalize(value).includes(search))
      const matchesCourse = !filterValues.courseId || item.courseId === filterValues.courseId
      const matchesClass = !filterValues.classId || item.classId === filterValues.classId
      const matchesTeacher = !filterValues.teacherId || item.teacherId === filterValues.teacherId
      return matchesSearch && matchesCourse && matchesClass && matchesTeacher
    })
  }, [classMap, courseMap, filterValues.classId, filterValues.courseId, filterValues.teacherId, keyword, resultItems, studentMap, teacherMap])

  return (
    <div className="space-y-5">
      <CourseHeader
        activeTab={activeTab}
        tabs={courseTabs}
        keyword={keyword}
        filters={activeFilters}
        filterValues={filterValues}
        onTabChange={handleTabChange}
        onKeywordChange={setKeyword}
        onFilterChange={handleFilterChange}
        onAdd={openCreate}
        showAdd={activeTab !== 'results'}
      />

      {activeTab === 'courses' ? (
        <CourseTable
          courses={filteredCourses}
          statusMap={courseStatusMap}
          onView={(item) => setModal({ entity: 'course', mode: 'view', item })}
          onEdit={(item) => setModal({ entity: 'course', mode: 'edit', item })}
          onDelete={(item) => setModal({ entity: 'course', mode: 'delete', item })}
          onAddClass={(item) => {
            setActiveTab('classes')
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
          onView={(item) => setModal({ entity: 'class', mode: 'view', item })}
          onEdit={(item) => setModal({ entity: 'class', mode: 'edit', item })}
          onDelete={(item) => setModal({ entity: 'class', mode: 'delete', item })}
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
          onExport={() => exportResults(filteredResults)}
        />
      ) : null}

      <CourseModal
        modal={modal}
        courseStatuses={courseStatuses}
        classStatuses={classStatuses}
        courses={courseItems}
        teachers={teachers}
        rooms={rooms}
        courseMap={courseMap}
        teacherMap={teacherMap}
        roomMap={roomMap}
        onClose={() => setModal(null)}
        onSubmit={handleModalSubmit}
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

export default CoursePage
