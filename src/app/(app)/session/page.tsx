'use client'

import { ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState } from 'react'

import { ChatWindow } from '@/components/session/ChatWindow'
import { ProgressBar } from '@/components/session/ProgressBar'
import { Button } from '@/components/ui/Button'
import { SESSION_FORMATS, SessionFormat } from '@/types/session'
import type { Exercise } from '@/types/session'

const TOTAL_EXERCISES = 10

// ── Inner client component that reads searchParams ────────────────────────────

function SessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get('sessionId') ?? ''
  const rawFormat = searchParams.get('format') ?? ''
  const sessionFormat =
    rawFormat in SessionFormat ? (rawFormat as SessionFormat) : SessionFormat.VOCABULARY

  const [exerciseScores, setExerciseScores] = useState<number[]>([])
  const [isCompleting, setIsCompleting] = useState(false)
  const [endError, setEndError] = useState<string | null>(null)
  const endErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const exerciseCount = exerciseScores.length
  const formatInfo = SESSION_FORMATS[sessionFormat]

  function handleExerciseDone(score: number) {
    setExerciseScores((prev) => [...prev, score])
  }

  async function handleComplete() {
    if (isCompleting) return
    setIsCompleting(true)
    setEndError(null)

    const exercises: Pick<
      Exercise,
      | 'id'
      | 'sessionId'
      | 'vocabItemId'
      | 'type'
      | 'prompt'
      | 'userAnswer'
      | 'score'
      | 'feedback'
      | 'createdAt'
    >[] = exerciseScores.map((score, i) => ({
      id: `ex-${i}`,
      sessionId,
      vocabItemId: null,
      type: 'ai_evaluated',
      prompt: '',
      userAnswer: '',
      score,
      feedback: '',
      createdAt: new Date(),
    }))

    try {
      const res = await fetch('/api/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, exercises }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      router.push('/dashboard')
    } catch (err) {
      console.error('Session end error:', err)
      setEndError('Ошибка завершения. Попробуйте снова.')
      if (endErrorTimer.current) clearTimeout(endErrorTimer.current)
      endErrorTimer.current = setTimeout(() => setEndError(null), 4000)
      setIsCompleting(false)
    }
  }

  function handleExit() {
    if (confirm('Прогресс этой сессии не сохранится. Выйти?')) {
      router.push('/dashboard')
    }
  }

  // ── No sessionId: placeholder ─────────────────────────────────────────────
  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <MessageCircle size={40} className="text-[var(--text-hint)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          Сначала выбери формат занятия на главной странице
        </p>
        <Link
          href="/dashboard"
          className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
        >
          На главную
        </Link>
      </div>
    )
  }

  // ── Active session ────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Session header */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={15} />
          Выйти
        </button>

        <p className="text-sm font-semibold text-[var(--text-primary)]">{formatInfo.label}</p>

        <Button
          variant="ghost"
          size="sm"
          disabled={exerciseCount === 0 || isCompleting}
          loading={isCompleting}
          onClick={handleComplete}
        >
          Завершить
        </Button>
      </div>

      {/* Progress bar */}
      <div className="pb-3">
        <ProgressBar current={exerciseCount} total={TOTAL_EXERCISES} />
      </div>

      {/* Error banner */}
      {endError && (
        <div className="mb-2 rounded-sm border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] px-3 py-2 text-xs text-[var(--error)]">
          {endError}
        </div>
      )}

      {/* Chat — takes all remaining space; min-h-0 allows flex-1 children to shrink and scroll */}
      <div className="flex min-h-0 flex-1 overflow-hidden border-t border-[var(--border)]">
        <ChatWindow
          sessionId={sessionId}
          sessionFormat={sessionFormat}
          onComplete={handleComplete}
          onExerciseDone={handleExerciseDone}
        />
      </div>
    </div>
  )
}

// ── Page export with Suspense boundary ────────────────────────────────────────

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <span className="size-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  )
}
