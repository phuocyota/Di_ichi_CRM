import { useState } from 'react'
import StudentDashboard from '../../components/Students/StudentDashboard.jsx'
import StudentHeader from '../../components/Students/StudentHeader.jsx'
import StudentModal from '../../components/Students/StudentModal.jsx'
import StudentProfile from '../../components/Students/StudentProfile.jsx'
import StudentTable from '../../components/Students/StudentTable.jsx'
import {
  modalConfigs,
  profileTabs,
  studentAttendanceSessions,
  studentCharts,
  studentCertificateItems,
  studentFilters,
  studentHistoryItems,
  studentHomeworkItems,
  studentScoreItems,
  studentStatistics,
  studentTuitionItems,
  students,
} from '../../datas/students.js'

function StudentPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [keyword, setKeyword] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(students[0])
  const [modal, setModal] = useState(null)

  const handleOpenModal = (type, student = selectedStudent) => {
    setSelectedStudent(student || students[0])
    setModal(type)
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setActiveTab('profile')
  }

  return (
    <div className="space-y-5">
      <StudentHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onOpenModal={handleOpenModal}
      />
      {activeTab === 'dashboard' ? (
        <StudentDashboard statistics={studentStatistics} charts={studentCharts} />
      ) : null}
      {activeTab === 'list' ? (
        <StudentTable
          students={students}
          filters={studentFilters}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelectStudent={handleSelectStudent}
          onOpenModal={handleOpenModal}
        />
      ) : null}
      {activeTab === 'profile' ? (
        <StudentProfile
          student={selectedStudent}
          tabs={profileTabs}
          attendanceSessions={studentAttendanceSessions}
          scoreItems={studentScoreItems}
          homeworkItems={studentHomeworkItems}
          tuitionItems={studentTuitionItems}
          historyItems={studentHistoryItems}
          certificateItems={studentCertificateItems}
        />
      ) : null}
      <StudentModal
        modal={modal}
        configs={modalConfigs}
        selectedStudent={selectedStudent}
        filters={studentFilters}
        onClose={() => setModal(null)}
      />
    </div>
  )
}

export default StudentPage
