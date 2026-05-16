'use client'

import { BookOpen, Edit3, FileText, MessageCircle, Pencil, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { SessionFormat, SESSION_FORMATS } from '@/types/session'

const ICONS: Record<string, LucideIcon> = {
  RotateCcw,
  BookOpen,
  Pencil,
  FileText,
  Edit3,
  MessageCircle,
}

export function SessionPicker() {
  const router = useRouter()
  const [loading, setLoading] = useState<SessionFormat | null>(null)

  async function handlePick(format: SessionFormat) {
    if (loading) return
    setLoading(format)

    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      })

      if (!res.ok) throw new Error('Failed to start session')

      const data = await res.json()
      // Pass sessionId via query so /session page can pick it up
      router.push(`/session?sessionId=${data.session.id}&format=${format}`)
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(SESSION_FORMATS) as SessionFormat[]).map((format) => {
        const info = SESSION_FORMATS[format]
        const Icon = ICONS[info.icon] ?? MessageCircle
        const isLoading = loading === format
        const isDisabled = loading !== null && !isLoading

        return (
          <button
            key={format}
            onClick={() => handlePick(format)}
            disabled={isDisabled}
            className={cn(
              'flex flex-col gap-2 rounded-md border p-4 text-left',
              'transition-colors duration-150 outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
              isLoading
                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]'
                : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]',
              isDisabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <div className="flex items-center justify-between">
              <Icon
                size={18}
                className={isLoading ? 'text-[var(--accent)]' : 'text-[var(--text-hint)]'}
              />
              {isLoading && (
                <span className="size-3.5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              )}
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{info.label}</p>
            <p className="text-xs text-[var(--text-hint)]">{info.description}</p>
          </button>
        )
      })}
    </div>
  )
}
