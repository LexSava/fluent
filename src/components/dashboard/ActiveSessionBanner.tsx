'use client'

import { ArrowRight, BookOpen, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

function readSessionUrl(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem('active_session_url')
  } catch {
    return null
  }
}

export function ActiveSessionBanner() {
  const [sessionUrl] = useState<string | null>(readSessionUrl)
  const [dismissed, setDismissed] = useState(false)

  if (!sessionUrl || dismissed) return null

  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent-dim)] px-4 py-3">
      <Link href={sessionUrl} className="flex min-w-0 flex-1 items-center gap-3">
        <BookOpen size={16} className="shrink-0 text-[var(--accent)]" />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          У тебя есть незавершённая сессия
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--accent)]">
          Продолжить
          <ArrowRight size={14} />
        </span>
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-[var(--text-hint)] transition-colors hover:text-[var(--text-primary)]"
        aria-label="Закрыть"
      >
        <X size={14} />
      </button>
    </div>
  )
}
