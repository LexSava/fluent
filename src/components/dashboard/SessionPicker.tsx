'use client'

import { BookOpen, Edit3, FileText, MessageCircle, Pencil, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(SESSION_FORMATS) as SessionFormat[]).map((format) => {
        const info = SESSION_FORMATS[format]
        const Icon = ICONS[info.icon] ?? MessageCircle
        return (
          <button
            key={format}
            onClick={() => router.push(`/session?format=${format}`)}
            className={cn(
              'flex flex-col gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)]',
              'p-4 text-left transition-colors duration-150',
              'hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]'
            )}
          >
            <Icon size={18} className="text-[var(--accent)]" />
            <p className="text-sm font-medium text-[var(--text-primary)]">{info.label}</p>
            <p className="text-xs text-[var(--text-hint)]">{info.description}</p>
          </button>
        )
      })}
    </div>
  )
}
