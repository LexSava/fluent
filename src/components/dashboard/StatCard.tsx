import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  value: string | number
  hint?: string
  className?: string
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn('rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4', className)}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-hint)]">
        {label}
      </p>
      <p className="mt-1 text-[28px] font-bold leading-none text-[var(--text-primary)]">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-[var(--text-hint)]">{hint}</p>}
    </div>
  )
}
