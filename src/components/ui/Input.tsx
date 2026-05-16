'use client'

import { type InputHTMLAttributes, useId } from 'react'

import { cn } from '@/lib/utils'

type InputProps = {
  label?: string
  error?: string
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>

export function Input({ label, error, className, id: externalId, ...props }: InputProps) {
  const generatedId = useId()
  const id = externalId ?? generatedId

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
        >
          {label}
          {props.required && <span className="ml-1 text-[var(--error)]">*</span>}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-[var(--radius-sm)] border border-[var(--border)]',
          'bg-[var(--bg-card)] text-[var(--text-primary)] text-sm',
          'px-3 py-2 outline-none transition-colors duration-150',
          'placeholder:text-[var(--text-hint)]',
          'focus:border-[var(--accent)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[var(--error)] focus:border-[var(--error)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  )
}
