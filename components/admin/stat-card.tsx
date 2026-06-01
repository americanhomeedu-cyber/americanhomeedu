import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg = 'var(--primary-soft)',
  iconColor = 'var(--primary)',
  delta,
  deltaUp,
  deltaNote,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  iconBg?: string
  iconColor?: string
  delta?: string
  deltaUp?: boolean
  deltaNote?: string
}) {
  return (
    <div className="stat-card">
      <div className="sc-top">
        <span className="sc-label">{label}</span>
        {Icon && (
          <span className="sc-ic" style={{ background: iconBg, color: iconColor }}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="sc-num">{value}</div>
      {delta && (
        <span className={`sc-delta ${deltaUp ? 'up' : 'down'}`}>
          {deltaUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {delta}
          {deltaNote && <span className="muted">{deltaNote}</span>}
        </span>
      )}
    </div>
  )
}
