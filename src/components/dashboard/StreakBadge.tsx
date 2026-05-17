import { Flame } from 'lucide-react'

import { cn } from '@/lib/utils'

type StreakBadgeProps = {
  streak: number
  className?: string
}

function pluralDays(n: number) {
  if (n === 1) return 'день'
  if (n >= 2 && n <= 4) return 'дня'
  return 'дней'
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const active = streak > 0

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1',
        active
          ? 'border-warning bg-[color-mix(in_srgb,var(--warning)_12%,transparent)]'
          : 'border-border bg-bg-elevated',
        className
      )}
    >
      <Flame size={13} className={active ? 'text-warning' : 'text-text-hint'} />
      <span
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.08em]',
          active ? 'text-warning' : 'text-text-hint'
        )}
      >
        {streak} {pluralDays(streak)} подряд
      </span>
    </div>
  )
}
