import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Variant = 'success' | 'error' | 'warning' | 'accent' | 'neutral'

const variantStyles: Record<Variant, string> = {
  success:
    'border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]',
  error:
    'border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]',
  warning:
    'border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]',
  accent: 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent-light)]',
  neutral: 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
}

type BadgeProps = {
  variant?: Variant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5',
        'text-[10px] font-semibold uppercase tracking-[0.08em]',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
