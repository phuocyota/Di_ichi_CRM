export default function ScheduleTimeGroups({ groups, children }) {
  return groups.map(group => <div key={group.key} role="group" aria-label={`Lịch ${group.start}–${group.end}`} className={`work-time-row ${group.items.length > 1 ? 'has-parallel' : ''}`} style={{ gridTemplateColumns: `repeat(${group.items.length}, minmax(0, 1fr))` }}>
    {group.items.map(children)}
  </div>)
}
