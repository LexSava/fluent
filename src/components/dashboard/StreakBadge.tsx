import { Flame } from 'lucide-react'

import { cn } from '@/lib/utils'

type StreakBadgeProps = {
  streak: number
  className?: string
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xs border border-[var(--warning)]',
        'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] px-2.5 py-1',
        className
      )}
    >
      <Flame size={13} className="text-[var(--warning)]" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--warning)]">
        {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}
      </span>
    </div>
  )
}
