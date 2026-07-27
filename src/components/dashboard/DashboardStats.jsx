import StatCard from '../common/StatCard.jsx'

function DashboardStats({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          trend={item.trend}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </section>
  )
}

export default DashboardStats
