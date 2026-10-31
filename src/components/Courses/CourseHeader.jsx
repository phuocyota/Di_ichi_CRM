import React from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../common/PageHeader.jsx'
import { FilterBar, SearchInput } from '../common/ui.jsx'

export default function CourseHeader({
  activeTab,
  tabs,
  keyword,
  filters,
  filterValues,
  onTabChange,
  onKeywordChange,
  onFilterChange,
  onAdd,
  showAdd = true
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý khóa học"
        description="Chương trình đào tạo, lớp học và kết quả học tập của học viên."
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        actions={
          showAdd && (
            <button
              type="button"
              className="ui-button ui-button-primary"
              onClick={onAdd}
            >
              <Plus size={16} />
              {activeTab === 'classes' ? 'Thêm lớp học' : 'Thêm khóa học'}
            </button>
          )
        }
      />
      <FilterBar
        active={!!keyword || Object.values(filterValues).some(Boolean)}
        onClear={() => {
          onKeywordChange('')
          Object.keys(filterValues).forEach((key) => onFilterChange(key, ''))
        }}
      >
        <label>
          Tìm kiếm
          <SearchInput
            value={keyword}
            onChange={onKeywordChange}
            placeholder="Tên, mã khóa học, lớp hoặc học viên"
            className="mt-2"
          />
        </label>
        {filters.map((filter) => (
          <label key={filter.key}>
            {filter.label}
            <select
              className="ui-input mt-2"
              value={filterValues[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            >
              <option value="">Tất cả</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </FilterBar>
    </div>
  )
}
