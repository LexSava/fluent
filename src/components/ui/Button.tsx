import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary: 'bg-accent text-white border-transparent hover:bg-accent-deep font-semibold',
  secondary: 'bg-bg-elevated text-text-secondary border-border hover:border-accent',
  ghost: 'bg-transparent text-accent border-border hover:bg-bg-elevated',
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, children, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm border',
        'transition-colors duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
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
})

function Spinner({ size }: { size: Size }) {
  const dim = size === 'sm' ? 'size-3' : size === 'lg' ? 'size-5' : 'size-4'
  return (
    <span
      className={cn(dim, 'animate-spin rounded-full border-2 border-current border-t-transparent')}
    />
  )
}
