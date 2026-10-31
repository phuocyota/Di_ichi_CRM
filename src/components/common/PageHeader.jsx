import React from 'react'
import { Breadcrumb, PageTabs } from './ui.jsx'

export default function PageHeader({
  title,
  description = null,
  actions = null,
  tabs = null,
  activeTab = null,
  onTabChange = null,
  children = null,
  breadcrumb = title
}) {
  return (
    <header className="ui-page-header">
      <Breadcrumb current={breadcrumb} />
      <div className="ui-page-heading">
        <div className="min-w-0">
          <h1 className="ui-page-title">{title}</h1>
          {description && <p className="ui-page-description">{description}</p>}
        </div>
        {actions && <div className="ui-page-actions">{actions}</div>}
      </div>
      {tabs && (
        <PageTabs tabs={tabs} value={activeTab} onChange={onTabChange} />
      )}
      {children}
    </header>
  )
}
