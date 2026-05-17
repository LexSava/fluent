'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const MAX_CHARS = 500

type InputBarProps = {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export function InputBar({
  onSend,
  disabled = false,
  placeholder = 'Напиши свой ответ...',
}: InputBarProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled || value.length > MAX_CHARS) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const charCount = value.length
  const isOverLimit = charCount > MAX_CHARS
  const isNearLimit = charCount > MAX_CHARS * 0.8
  const canSend = value.trim().length > 0 && !disabled && !isOverLimit

  const counterColor = isOverLimit
    ? 'var(--error)'
    : isNearLimit
      ? 'var(--warning)'
      : 'var(--text-hint)'

  return (
    <div className="w-full border  border- border-[var(--border)] bg-[var(--bg-card)] rounded-md px-4 py-3">
      <div className="mx-auto flex max-w-2xl flex-col gap-1">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            aria-label="Введите сообщение"
            rows={1}
            className={cn(
              'w-full min-h-[44px] max-h-[160px] resize-none overflow-y-auto',
              'rounded-[var(--radius-md)] border border-[var(--border)]',
              'bg-[var(--bg-elevated)] px-3 py-2.5 text-sm leading-relaxed text-[var(--text-primary)]',
              'placeholder:text-[var(--text-hint)] outline-none',
              'transition-colors duration-150 focus:border-[var(--accent)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isOverLimit && 'border-[var(--error)]'
            )}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Отправить сообщение"
            className={cn(
              'flex size-[44px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] border',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
              canSend
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-transparent text-[var(--text-hint)]',
              'disabled:cursor-not-allowed'
            )}
          >
            <ArrowUp size={16} aria-hidden="true" />
          </button>
        </div>
        {charCount > 0 && (
          <div className="flex justify-end">
            <span className="text-[11px]" style={{ color: counterColor }}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
