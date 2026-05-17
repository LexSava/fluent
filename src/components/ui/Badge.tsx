import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Variant = 'success' | 'error' | 'warning' | 'accent' | 'neutral'

const variantStyles: Record<Variant, string> = {
  success: 'border-success bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success',
  error: 'border-error bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-error',
  warning: 'border-warning bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-warning',
  accent: 'border-accent bg-accent-dim text-accent-light',
  neutral: 'border-border bg-bg-elevated text-text-secondary',
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
        'inline-flex items-center rounded-xs border px-2 py-0.5',
        'text-[10px] font-semibold uppercase tracking-[0.08em]',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
