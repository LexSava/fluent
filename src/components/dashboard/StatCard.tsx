import { cn } from '@/lib/utils'

type Color = 'accent' | 'success' | 'warning' | 'primary'

const colorMap: Record<Color, { value: string; label: string; border: string; bg: string }> = {
  accent: {
    value: 'text-accent',
    label: 'text-text-hint',
    border: 'border-border',
    bg: 'bg-bg-card',
  },
  success: {
    value: 'text-success',
    label: 'text-text-hint',
    border: 'border-border',
    bg: 'bg-bg-card',
  },
  warning: {
    value: 'text-warning',
    label: 'text-text-hint',
    border: 'border-border',
    bg: 'bg-bg-card',
  },
  primary: {
    value: 'text-text-primary',
    label: 'text-text-hint',
    border: 'border-border',
    bg: 'bg-bg-card',
  },
}

type StatCardProps = {
  label: string
  value: string | number
  color?: Color
  hint?: string
  className?: string
}

export function StatCard({ label, value, color = 'primary', hint, className }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div className={cn('flex flex-col gap-1 rounded-md border p-4', c.border, c.bg, className)}>
      <p className={cn('text-[11px] font-semibold uppercase tracking-[0.08em]', c.label)}>
        {label}
      </p>
      <p className={cn('text-[28px] font-bold leading-none tabular-nums', c.value)}>{value}</p>
      {hint && <p className="text-[11px] text-text-hint">{hint}</p>}
    </div>
  )
}
