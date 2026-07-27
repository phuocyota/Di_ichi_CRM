import { useState } from 'react'
import ClassDashboard from '../../components/Classes/ClassDashboard.jsx'
import ClassDetail from '../../components/Classes/ClassDetail.jsx'
import ClassHeader from '../../components/Classes/ClassHeader.jsx'
import ClassModal from '../../components/Classes/ClassModal.jsx'
import ClassTable from '../../components/Classes/ClassTable.jsx'
import {
  classCharts,
  classDetailTabs,
  classAttendanceSessions,
  classDocumentItems,
  classFilters,
  classHomeworkItems,
  classModalConfigs,
  classNotificationItems,
  classSchedules,
  classScoreItems,
  classStatistics,
  classStudents,
  classes,
} from '../../datas/classes.js'

function ClassPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [keyword, setKeyword] = useState('')
  const [selectedClass, setSelectedClass] = useState(classes[0])
  const [modal, setModal] = useState(null)

  const handleOpenModal = (type, classItem = selectedClass) => {
    setSelectedClass(classItem || classes[0])
    setModal(type)
  }

  const handleSelectClass = (classItem) => {
    setSelectedClass(classItem)
    setActiveTab('detail')
  }

  return (
    <div className="space-y-5">
      <ClassHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onOpenModal={handleOpenModal}
      />
      {activeTab === 'dashboard' ? (
        <ClassDashboard statistics={classStatistics} charts={classCharts} />
      ) : null}
      {activeTab === 'list' ? (
        <ClassTable
          classes={classes}
          filters={classFilters}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelectClass={handleSelectClass}
          onOpenModal={handleOpenModal}
        />
      ) : null}
      {activeTab === 'detail' ? (
        <ClassDetail
          classItem={selectedClass}
          tabs={classDetailTabs}
          students={classStudents}
          schedules={classSchedules}
          attendanceSessions={classAttendanceSessions}
          homeworkItems={classHomeworkItems}
          scoreItems={classScoreItems}
          notificationItems={classNotificationItems}
          documentItems={classDocumentItems}
        />
      ) : null}
      <ClassModal
        modal={modal}
        configs={classModalConfigs}
        selectedClass={selectedClass}
        filters={classFilters}
        onClose={() => setModal(null)}
      />
    </div>
  )
}

export default ClassPage
