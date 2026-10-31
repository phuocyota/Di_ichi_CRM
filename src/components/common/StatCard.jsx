import React from 'react'
import { ArrowUpRight, BarChart3 } from 'lucide-react'

export default function StatCard({
  label,
  value,
  trend = null,
  description = null,
  icon: Icon = BarChart3,
  color = 'info',
  onClick = null,
  loading = false
}) {
  const colors = {
    blue: 'info',
    emerald: 'success',
    amber: 'warning',
    rose: 'danger',
    red: 'danger',
    slate: 'neutral',
    violet: 'purple',
    orange: 'warning',
    cyan: 'cyan'
  }
  const tone = colors[color] || color,
    Card = onClick ? 'button' : 'article'
  return (
    <Card
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`ui-stat-card ui-tone-${tone} ${onClick ? 'is-clickable' : ''}`}
      aria-busy={loading}
    >
      <div className="ui-stat-heading">
        <span className="ui-stat-label">{label}</span>
        <span className="ui-stat-icon">
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>
      <p className={`ui-stat-value ${loading ? 'ui-stat-loading' : ''}`}>
        {loading ? <span className="sr-only">Đang tải</span> : (value ?? '—')}
      </p>
      <div className="ui-stat-description">
        {trend || description || <span aria-hidden="true">&nbsp;</span>}
        {onClick && <ArrowUpRight size={15} aria-hidden="true" />}
      </div>
    </Card>
  )
}
