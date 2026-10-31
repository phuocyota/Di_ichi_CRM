import React from 'react'
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Download,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react'
import PageHeader from '../common/PageHeader.jsx'
import StatCard from '../common/StatCard.jsx'

export default function ScheduleHeader({
  calendarTitle,
  currentView,
  statistics,
  onToday,
  onPrev,
  onNext,
  onViewChange,
  onOpenModal,
  onDateChange,
  selectedDate,
  filtersOpen,
  onToggleFilters
}) {
  return (
    <>
      <PageHeader
        title="Quản lý lịch học"
        description="Điều phối buổi học, giáo viên, phòng học và theo dõi điểm danh."
        actions={
          <>
            <button
              type="button"
              className="ui-button"
              onClick={() => onOpenModal('export')}
            >
              <Download size={16} />
              Xuất lịch học
            </button>
            <button
              type="button"
              className="ui-button ui-button-primary"
              onClick={() => onOpenModal('create')}
            >
              <CalendarPlus size={16} />
              Tạo lịch học mới
            </button>
          </>
        }
      />
      <section
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        aria-label="Thống kê lịch học"
      >
        {statistics.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            color={item.tone}
          />
        ))}
      </section>
      <div className="ui-calendar-toolbar">
        <div>
          <button type="button" className="ui-button" onClick={onToday}>
            Hôm nay
          </button>
          <button
            type="button"
            className="ui-button ui-icon-button"
            aria-label="Khoảng thời gian trước"
            title="Khoảng thời gian trước"
            onClick={onPrev}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="ui-button ui-icon-button"
            aria-label="Khoảng thời gian sau"
            title="Khoảng thời gian sau"
            onClick={onNext}
          >
            <ChevronRight size={16} />
          </button>
          <span className="ui-calendar-title">{calendarTitle}</span>
          <label className="sr-only" htmlFor="schedule-jump-date">
            Đến ngày
          </label>
          <input
            id="schedule-jump-date"
            type="date"
            className="ui-input !w-auto"
            value={selectedDate || ''}
            onChange={(e) => {
              if (e.target.value) onDateChange(e.target.value)
            }}
          />
        </div>
        <div>
          <div className="ui-segment">
            {[
              ['timeGridDay', 'Theo ngày'],
              ['timeGridWeek', 'Theo tuần'],
              ['dayGridMonth', 'Theo tháng']
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                aria-pressed={currentView === key}
                onClick={() => onViewChange(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ui-button"
            aria-expanded={filtersOpen}
            aria-controls="schedule-filters"
            onClick={onToggleFilters}
          >
            {filtersOpen ? (
              <PanelRightClose size={16} />
            ) : (
              <PanelRightOpen size={16} />
            )}
            Bộ lọc
          </button>
        </div>
      </div>
    </>
  )
}
