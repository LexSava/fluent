'use client'

import { BookOpen, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type VocabItem = {
  id: string
  term: string
  translation: string
  repetitions: number
  dueAt: string | Date
  lastScore: number | null
}

type Filter = 'all' | 'learning' | 'mastered'

type Props = {
  items: VocabItem[]
}

function getBadge(repetitions: number) {
  if (repetitions === 0)
    return {
      label: 'Новое',
      color: 'var(--text-hint)',
      bg: 'var(--bg-elevated)',
      border: 'var(--border)',
    }
  if (repetitions <= 3)
    return {
      label: 'Учится',
      color: '#B45309',
      bg: 'rgba(251,191,36,0.12)',
      border: 'rgba(251,191,36,0.3)',
    }
  return {
    label: 'Выучено',
    color: '#15803D',
    bg: 'rgba(74,222,128,0.12)',
    border: 'rgba(74,222,128,0.3)',
  }
}

function getDueLabel(dueAt: string | Date) {
  const due = new Date(dueAt)
  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dayAfter = new Date(today)
  dayAfter.setDate(today.getDate() + 2)

  if (due <= now) return { text: 'Повторить сейчас', color: 'var(--error)' }
  if (due < tomorrow) return { text: 'Сегодня', color: 'var(--warning)' }
  if (due < dayAfter) return { text: 'Завтра', color: 'var(--text-secondary)' }

  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return { text: `Через ${diffDays} дн.`, color: 'var(--text-hint)' }
}

const PAGE_SIZE = 20

export default function VocabList({ items }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [shown, setShown] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return items.filter((item) => {
      const matchSearch =
        !q || item.term.toLowerCase().includes(q) || item.translation.toLowerCase().includes(q)
      const matchFilter =
        filter === 'all' ||
        (filter === 'learning' && item.repetitions >= 1 && item.repetitions <= 3) ||
        (filter === 'mastered' && item.repetitions >= 4)
      return matchSearch && matchFilter
    })
  }, [items, search, filter])

  const visible = filtered.slice(0, shown)
  const hasMore = shown < filtered.length

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-bg-card py-16">
        <BookOpen size={32} className="text-text-hint" />
        <p className="text-[14px] font-medium text-text-secondary">
          Словарь пока пуст. Начни сессию чтобы добавить слова.
        </p>
        <Link
          href="/dashboard"
          className="mt-1 rounded-sm bg-accent px-4 py-2 text-[13px] font-semibold text-white"
        >
          Начать занятие
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
        <input
          type="text"
          placeholder="Поиск по словам..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setShown(PAGE_SIZE)
          }}
          className="w-full rounded-sm border border-border bg-bg-card py-2 pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-hint focus:border-accent focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(['all', 'learning', 'mastered'] as const).map((f) => {
          const labels = { all: 'Все', learning: 'Учится', mastered: 'Выучено' }
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                setShown(PAGE_SIZE)
              }}
              className="cursor-pointer rounded-xs px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150"
              style={{
                background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                color: active ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {labels[f]}
            </button>
          )
        })}
        <span className="ml-auto self-center text-[11px] text-text-hint">
          {filtered.length} слов
        </span>
      </div>

      {/* Empty filtered state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-bg-card py-10">
          <Search size={24} className="text-text-hint" />
          <p className="text-[13px] text-text-hint">Ничего не найдено</p>
        </div>
      )}

      {/* Word cards grid */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {visible.map((item) => {
          const badge = getBadge(item.repetitions)
          const due = getDueLabel(item.dueAt)
          const progress = Math.min(item.repetitions / 7, 1)

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-border bg-bg-card p-3"
            >
              {/* Left: term + translation */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold leading-tight text-text-primary">
                  {item.term}
                </p>
                <p className="truncate text-[14px] text-text-secondary">{item.translation}</p>
              </div>

              {/* Center: progress bar */}
              <div className="flex w-[80px] shrink-0 flex-col gap-1">
                <div className="h-[4px] overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-hint">Повторений: {item.repetitions}</p>
              </div>

              {/* Right: badge + due */}
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className="rounded-xs px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    color: badge.color,
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                  }}
                >
                  {badge.label}
                </span>
                <span className="text-[11px]" style={{ color: due.color }}>
                  {due.text}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setShown((prev) => prev + PAGE_SIZE)}
          className="cursor-pointer rounded-sm border border-border bg-bg-elevated py-2 text-[13px] font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          Показать ещё ({filtered.length - shown} слов)
        </button>
      )}
    </div>
  )
}
