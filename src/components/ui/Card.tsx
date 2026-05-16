import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type CardProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick()
            }
          : undefined
      }
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4',
        onClick && 'cursor-pointer transition-colors duration-150 hover:border-[var(--accent)]',
        className
      )}
    >
      {children}
    </div>
  )
}
