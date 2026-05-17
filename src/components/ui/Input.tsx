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
          className="text-xs font-medium text-text-secondary uppercase tracking-wide"
        >
          {label}
          {props.required && <span className="ml-1 text-error">*</span>}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-sm border border-border',
          'bg-bg-card text-text-primary text-sm',
          'px-3 py-2 outline-none transition-colors duration-150',
          'placeholder:text-text-hint',
          'focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-error focus:border-error',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
