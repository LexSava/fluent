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
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
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
  const isNearLimit = charCount >= MAX_CHARS - 50
  const canSend = value.trim().length > 0 && !disabled && !isOverLimit

  const counterColor = isOverLimit
    ? 'var(--error)'
    : isNearLimit
      ? 'var(--warning)'
      : 'var(--text-hint)'

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          'rounded-[var(--radius-lg)] border bg-[var(--bg-card)] transition-colors duration-150',
          focused ? 'border-[var(--accent)]' : 'border-[var(--border)]',
          disabled && 'opacity-60'
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Введите сообщение"
          rows={1}
          className={cn(
            'block w-full resize-none overflow-y-auto bg-transparent',
            'min-h-[44px] max-h-[200px]',
            'px-4 pt-3 pb-2 text-sm leading-relaxed',
            'text-[var(--text-primary)] placeholder:text-[var(--text-hint)]',
            'border-none outline-none focus:outline-none',
            'disabled:cursor-not-allowed'
          )}
        />
        <div className="flex items-center justify-end gap-4 px-3 py-2">
          <span className="text-[12px]" style={{ color: counterColor }}>
            {charCount}/{MAX_CHARS}
          </span>
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Отправить сообщение"
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
              canSend
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-elevated)] text-[var(--text-hint)]',
              'disabled:cursor-not-allowed'
            )}
          >
            <ArrowUp size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
