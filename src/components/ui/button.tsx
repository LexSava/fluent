import { type ButtonHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-white border-transparent hover:bg-[var(--accent-deep)] font-semibold',
  secondary:
    'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]',
  ghost: 'bg-transparent text-[var(--accent)] border-[var(--border)] hover:bg-[var(--bg-elevated)]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
}

type ButtonProps = {
  variant?: Variant
  size?: Size
  loading?: boolean
  children?: ReactNode
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border',
        'transition-colors duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={size} /> : children}
    </button>
  )
}

function Spinner({ size }: { size: Size }) {
  const dim = size === 'sm' ? 'size-3' : size === 'lg' ? 'size-5' : 'size-4'
  return (
    <span
      className={cn(dim, 'animate-spin rounded-full border-2 border-current border-t-transparent')}
    />
  )
}
